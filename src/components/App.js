import React, { useEffect, useState } from 'react';
import './App.css';
import { Container, Row, Navbar, Nav, Button } from 'react-bootstrap';
import Footer from './Footer';

import NftCarousel from './NftCarousel';
import NftDescription from './NftDescription';
import { shortHash } from '../services/helpers';
import connect from '../services/contractsConnector';
import MintForm from './Day365Mint';

function App() {
  const [account, setAccount] = useState(null);
  const [currentFee, setCurrentFee] = useState("0");
  const [nftContract, setNftContract] = useState(null);
  const [auctioner, setAuctioner] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [currentNft, setCurrentNft] = useState(null);

  useEffect(() => {
    connect({
      userConnect: false, 
      setAccount, 
      setNftContract, 
      setCurrentFee, 
      nfts, 
      setNfts, 
      setAuctioner
    });
  }, []);

  const showSecondRowComponent = () => {
    let component = null;

    if(account) 
    {
      if(!!currentNft && account.toLowerCase() !== currentNft.owner.toLowerCase()) {
        component = null;
      }
      else
      {
        component = <MintForm 
          descriptionHandler={setCurrentNft}
          currentNft={currentNft}
          nftContract={nftContract}
          nfts={nfts}
          setNfts={setNfts}
          currentFee={currentFee}
          account={account}
          auctioner={auctioner}
        />
      }
    }
    else 
    {
      component = <Button onClick={
        () => { connect({
          userConnect: false, 
          setAccount, 
          setNftContract, 
          setCurrentFee, 
          nfts, 
          setNfts, 
          setAuctioner
        }); }
      } variant="info">Connect Wallet</Button>
    }

    if(component != null) {
      return (<Row style={{marginTop: '1rem', width: '100%'}} className="justify-content-md-center">
          {component}
        </Row>
      );
    }
  }

  return (
    <div>
      <div style={{minHeight: '100vh'}}>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand href="/">365 DAY NFT</Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link href={`https://etherscan.io/address/${account}`}>
                Account: {shortHash(account)}
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>

        <Container fluid="md" style={{width: '100%'}}>
          <Row style={{marginTop: '1rem', width: '100%'}} className="justify-content-md-center">
            {
              currentNft ? 
              <NftDescription currentNft={currentNft} descriptionHandler={setCurrentNft} account={account}/> :
              <NftCarousel nfts={nfts} account={account} descriptionHandler={setCurrentNft}/>
            }
          </Row>
          {showSecondRowComponent()}
        </Container>
      </div>

      <Footer style={{marginTop: '10rem'}}/>
    </div>
  );
}

export default App;
