import React, { useEffect, useState } from 'react';
import './App.css';
import { ethers } from 'ethers';
import { Container, Row, Navbar, Nav, Col, Button, Card } from 'react-bootstrap';
import ipfs from '../services/ipfs';

import NftList from './NftList';
import { shortHash } from '../services/helpers';
import connectToContract from '../services/days365Service';

function App() {
  const [account, setAccount] = useState(null);
  const [currentFee, setCurrentFee] = useState("0");
  const [nftContract, setNftContract] = useState(null);
  const [nfts, setNfts] = useState([]);

  const mintNftHandler = async () => {
    if(nftContract && currentFee != "0") {
      console.log("Initialize payment");
      let nftTxn = await nftContract.mintToken("Empty URI", {value: ethers.utils.parseEther(currentFee)});
      console.log("Mining... please wait");
      await nftTxn.wait();
      console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
    }
  };

  const connectWalletButton = () => {
    return (
      <Button onClick={
        async () => { await connectToContract(true, setAccount, setNftContract, setCurrentFee, setNfts); }
      } variant="info">Connect Wallet</Button>
    )
  };

  const mintNftButton = () => {
    return (
      <Container fluid="md">
        <Row className="justify-content-md-center">
          <Col md="auto">{"Current Fee: " + currentFee}</Col>
          <Col md="auto">
            <Button onClick={mintNftHandler} variant="success">Mint DAY NFT</Button>
          </Col>
        </Row>
      </Container>
    )
  };

  useEffect(async () => {
    await connectToContract(false, setAccount, setNftContract, setCurrentFee, nfts, setNfts);
  }, []);

  return (
    <div>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand href="#home">365 DAY NFT</Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link href="#home">
                Account: {shortHash(account)}
              </Nav.Link>
            </Nav>
          </Container>
      </Navbar>

      <Container fluid="md">
        <Row className="justify-content-md-center">
          <NftList nfts={nfts} account={account}></NftList>
        </Row>
        <Row className="justify-content-md-center">
          {account ? mintNftButton() : connectWalletButton()}
        </Row>
      </Container>

    </div>
  );
}

export default App;
