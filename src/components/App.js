import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Navbar, Nav, Image, Form } from "react-bootstrap";
import propTypes from "prop-types";
import { connect } from "react-redux";
import { compose } from "redux";
import * as actions from "../actions/index";
import { identiconAsync } from "../services/identicon";
import { Routes, Route, useNavigate } from "react-router-dom";

import "./App.css";
import Footer from "./Footer";
import NftCarousel from "./NftCarousel";
import NftDescription from "./NftDescription";
import { shortHash } from "../services/helpers";
import ContractForms from "./ContractForms";
import Alert from "./Alert";

function App({
  account,
  contractsInit,
  saveSubscribe,
  currentNft,
  switchUpdateChange,
  switchUpdate,
  setCurrentNft,
}) {
  const accountRef = useRef(null);
  const contractRef = useRef(null);
  const switchRef = useRef(null);
  const [carouselView, setCarouselView] = useState(0);
  const navigate = useNavigate();

  const carouselViewHandler = (idx, e) => {
    console.log("set view to: " + idx);
    setCarouselView(idx);
  };

  useEffect(() => {
    identiconAsync(process.env.REACT_APP_CONTRACT_ADDRESS, 80, contractRef);
    contractsInit(false);
    const unsubscibeSave = saveSubscribe();
    switchRef.current.checked = switchUpdate;

    return () => {
      unsubscibeSave();
    };
  }, []);

  useEffect(() => {
    identiconAsync(account, 80, accountRef);
  }, [account]);

  return (
    <div>
      <Alert />

      <div style={{ minHeight: "100vh" }}>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand
              onClick={(e) => {
                carouselViewHandler(0, e);
                navigate("/");
                setCurrentNft(0);
              }}
            >
              365 DAY NFT
            </Navbar.Brand>
            <Nav className="me-auto">
              <Form
                style={{
                  color: "white",
                  margin: "auto",
                  alignItems: "center",
                  marginRight: "20px",
                  textAlign: "center",
                }}
              >
                <Form.Switch
                  ref={switchRef}
                  id="update-switch"
                  label="Use Update"
                  onChange={(e) => {
                    switchUpdateChange(e.target.checked);
                  }}
                />
              </Form>
              <Image
                alt="Contract"
                ref={contractRef}
                style={{ width: "40px", height: "40px" }}
              />
              <Nav.Link
                href={`https://etherscan.io/address/${process.env.REACT_APP_CONTRACT_ADDRESS}`}
              >
                {"Contract: " +
                  shortHash(
                    process.env.REACT_APP_CONTRACT_ADDRESS.toLowerCase()
                  )}
              </Nav.Link>
              <Image
                alt="Account"
                ref={accountRef}
                style={{ width: "40px", height: "40px" }}
              />
              <Nav.Link href={`https://etherscan.io/address/${account}`}>
                {"Account: " + shortHash(account)}
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>

        <Container fluid="md" style={{ width: "100%", marginBottom: "10rem" }}>
          <Row
            style={{ marginTop: "1rem", width: "100%" }}
            className="justify-content-md-center"
          >
            <Routes>
              <Route
                path="/nfts/:id"
                element={
                  <NftDescription carouselViewHandler={carouselViewHandler} />
                }
              />
              <Route
                path="/"
                element={
                  <NftCarousel
                    carouselView={carouselView}
                    onSelect={carouselViewHandler}
                  />
                }
              />
            </Routes>
          </Row>
          <Row
            hidden={
              !!currentNft &&
              account.toLowerCase() !== currentNft.owner.toLowerCase()
            }
            style={{ marginTop: "1rem", width: "100%" }}
            className="justify-content-md-center"
          >
            <ContractForms />
          </Row>
        </Container>
      </div>

      <Footer />
    </div>
  );
}

App.propTypes = {
  account: propTypes.string.isRequired,
  setCurrentNft: propTypes.func,
  currentNft: propTypes.object,
  switchUpdate: propTypes.bool,
};

function mapStateToProps(state) {
  return {
    account: state.contracts.account,
    setCurrentNft: state.contracts.setCurrentNft,
    currentNft: state.contracts.currentNftId
      ? state.contracts.nfts[state.contracts.currentNftId - 1]
      : null,
    switchUpdate: state.contracts.switchUpdate,
  };
}

export default compose(connect(mapStateToProps, actions))(App);
