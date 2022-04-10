import React, { useRef } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import propTypes from "prop-types";
import { connect } from "react-redux";
import { compose } from "redux";
import * as actions from "../actions/index";

const AuctionForms = ({ currentNft, startAuction, auctionLoading }) => {
  const auctionFormRef = useRef(null);

  const auctionHandler = async (e) => {
    e.preventDefault();
    const startPrice = auctionFormRef.current[0].value;
    const daysEnd = auctionFormRef.current[1].value;

    startAuction(currentNft.id, startPrice, daysEnd, () => {
      if (auctionFormRef) {
        auctionFormRef.current[0].value = null;
        auctionFormRef.current[1].value = null;
      }
    });
  };

  return (
    <Form ref={auctionFormRef}>
      <div>
        <Form.Group className="mb-3" controlId="price">
          <Form.Label>Start Price ETH</Form.Label>
          <Form.Control type="number" placeholder="Start Price" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="endDays">
          <Form.Label>Days End</Form.Label>
          <Form.Control type="number" placeholder="Days End" />
        </Form.Group>
      </div>

      <Button
        disabled={auctionLoading}
        onClick={auctionHandler}
        variant="primary"
        type="submit"
      >
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
          hidden={!auctionLoading}
        />
        Start Auction
      </Button>
    </Form>
  );
};

AuctionForms.propTypes = {
  auctionLoading: propTypes.bool,
  currentNft: propTypes.object,
};

function mapStateToProps(state) {
  return {
    auctionLoading: state.contracts.auctionLoading,
    currentNft: state.contracts.currentNftId
      ? state.contracts.nfts[state.contracts.currentNftId - 1]
      : null,
  };
}

export default compose(connect(mapStateToProps, actions))(AuctionForms);
