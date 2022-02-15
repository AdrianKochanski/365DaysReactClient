import React, { useEffect, useState } from 'react';
import './App.css';
import { Container, Row, Navbar, Nav, Button } from 'react-bootstrap';

import NftList from './NftList';
import { shortHash } from '../services/helpers';
import connectToContract from '../services/days365';
import MintForm from './Day365Mint';

function App() {
  const [account, setAccount] = useState(null);
  const [currentFee, setCurrentFee] = useState("0");
  const [nftContract, setNftContract] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [previewImg, setPreview] = useState('placeholder-image.png');
  const [file, setFile] = useState(null);

  const connectWalletButton = () => {
    return (
      <Button onClick={
        () => { connectToContract(true, setAccount, setNftContract, setCurrentFee, setNfts); }
      } variant="info">Connect Wallet</Button>
    )
  };

  useEffect(() => {
    connectToContract(false, setAccount, setNftContract, setCurrentFee, nfts, setNfts);
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
        <Row style={{marginTop: '1rem'}} className="justify-content-md-center">
          <NftList nfts={nfts} account={account}></NftList>
        </Row>
        <Row style={{marginTop: '1rem'}} className="justify-content-md-center">
          {account ? 
            <MintForm 
              nftContract={nftContract} 
              nfts={nfts} 
              setNfts={setNfts} 
              previewImg={previewImg} 
              setPreview={setPreview} 
              file={file} 
              setFile={setFile} 
              currentFee={currentFee} 
              account={account}/> : connectWalletButton()}
        </Row>
      </Container>

    </div>
  );
}

export default App;
