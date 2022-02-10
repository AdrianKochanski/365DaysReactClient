import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import { ethers } from 'ethers';
import { Container, Row, Navbar, Nav, Col, Button, Form, Card } from 'react-bootstrap';
import ipfs from '../services/ipfs';

import NftList from './NftList';
import { shortHash } from '../services/helpers';
import connectToContract from '../services/days365Service';

function App() {
  const formRef = useRef(null);
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

  const mintNftHandler = async () => {
    if(nftContract && currentFee != "0") {
      console.log("Initialize payment");
      let nftTxn = await nftContract.mintToken("Empty URI", {value: ethers.utils.parseEther(currentFee)});
      console.log("Mining... please wait");
      await nftTxn.wait();
      console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
    }
  };

  const previewImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFile(file);
    }
  }

  const ipfsAddImage = async (file) => {
    const buffer = await getBuffer(file);
    return ipfs.files.add(buffer);
  }

  const ipfsAddJson = async (file) => {
    const buffer = await getBufferFromJson(file);
    return ipfs.files.add(buffer);
  }

  function getBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => resolve(Buffer.from(reader.result));
      reader.onerror = error => reject(error);
    });
  }

  function getBufferFromJson(fileJson) {
    let json = JSON.stringify(fileJson);
    const blob = new Blob([json], {type:"application/json"});

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(blob);
      reader.onload = () => resolve(Buffer.from(reader.result));
      reader.onerror = error => reject(error);
    });
  }

  const mintHandler = async (e) => {
    e.preventDefault();
    const imgResponse = await ipfsAddImage(file);
    const d = new Date();
    const nextDate = d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear();
    const imgHash = imgResponse[0].hash;
    const description = formRef.current[1].value;
    const temperature = formRef.current[2].value;
    const location = formRef.current[3].value;

    const metadata = {
      name: nextDate,
      description: description,
      image: `https://ipfs.io/ipfs/${imgHash}?filename=${file.name}`,
      attributes: [
          {
              trait_type: "location",
              value: location
          },
          {
              trait_type: "temperature",
              value: temperature
          }
      ]
    };

    const metadataResp = await ipfsAddJson(metadata);
    const metadataHash = metadataResp[0].hash;
    const tokenUri = await nftContract.mintToken(`https://ipfs.io/ipfs/${metadataHash}`, {value: ethers.utils.parseEther(currentFee)});

    const newNft = {
      uri: tokenUri,
      name: nextDate,
      description: description,
      image: URL.createObjectURL(file),
      location: location,
      temperature: temperature,
      owner: account
    };

    nfts.push(newNft);
    setNfts([...nfts]);
  }

  const mintForm = () => {
    return  (
      <Form ref={formRef}>
        <Container fluid="md">
          <Row className="justify-content-md-center">
            <Col style={{width: '20rem'}} md="auto">
              <Card style={{ width: '18rem' }}>
                <Card.Img id='previewImg' style={{ height: '12rem' }} variant="top" src={previewImg} />
                <Card.Body>
                  <Form.Group className="mb-3" controlId="image">
                    <Form.File 
                      onChange={previewImage} 
                      accept='image/png, image/jpeg' 
                      type="file"
                      label="NFT Image"/>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
            <Col style={{width: '20rem'}} md="auto">
              <Form.Group className="mb-3" controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" placeholder="Description" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="temperature">
                <Form.Label>Temperature</Form.Label>
                <Form.Control type="number" placeholder="Temperature" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="location">
                <Form.Label>Location coordinates</Form.Label>
                <Form.Control type="text" label="Location coordinates" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="location">
                <Button onClick={mintHandler} variant="primary" type="submit">Mint DAY NFT</Button>
                <div>{"Current Fee: " + currentFee + " ETH"}</div>  
              </Form.Group>
            </Col>
          </Row>
        </Container>
      </Form>
    )
  }

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
          {account ? mintForm() : connectWalletButton()}
        </Row>
      </Container>

    </div>
  );
}

export default App;
