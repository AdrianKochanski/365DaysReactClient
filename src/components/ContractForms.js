import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import AuctionForm from './AuctionForm';
import Days365Form from './Days365Form';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import * as actions from '../actions/index';


const ContractForms = ({account, currentNft, contractsInit}) => {
    if(account) 
    {
      return  (
        <Container fluid="md">
          <Row className="justify-content-md-center" style={{ height: '20rem' }}>
            <Col md="auto">
              <Days365Form/>
            </Col>
            <Col md="auto" hidden={!currentNft}>
              <AuctionForm/>
            </Col>
          </Row>
        </Container>
      );
    } 
    else
    {
      return (
        <Button onClick={
          () => { contractsInit(true, false) }
        } variant="info">Connect Wallet</Button>
      );
    }
    
}

ContractForms.propTypes = {
  account: propTypes.string.isRequired,
  currentNft: propTypes.object
};

function mapStateToProps(state) {
return {
    account: state.contracts.account,
    currentNft: state.contracts.currentNft
};
}

export default compose(
  connect(mapStateToProps, actions)
)(ContractForms);