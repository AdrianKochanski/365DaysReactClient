import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Navbar, Nav, Image } from 'react-bootstrap';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import * as actions from '../actions/index';
import { identiconAsync } from '../services/identicon';

import './App.css';
import Footer from './Footer';
import NftCarousel from './NftCarousel';
import NftDescription from './NftDescription';
import { shortHash } from '../services/helpers';
import contractsConnector from '../services/contractsConnector';
import ContractForms from './ContractForms';

function App(props) {
  const accountRef = useRef(null);
  const [account, setAccount] = useState(null);
  const [currentFee, setCurrentFee] = useState("0");
  const [nftContract, setNftContract] = useState(null);
  const [auctioner, setAuctioner] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [currentNft, setCurrentNft] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [carouselView, setCarouselView] = useState(0);

  const carouselViewHandler = (idx, e) => {
    if(currentNft) 
    {
      setCarouselView(currentNft.id-1);
      setCurrentNft(null);
    }
    else 
    {
      setCarouselView(idx);
    }
  };

  useEffect(() => {
    props.contractsInit(false);
    contractsConnector({
      userConnect: false, 
      setAccount, 
      setNftContract, 
      setCurrentFee, 
      nfts, 
      setNfts,
      auctions,
      setAuctions,
      setAuctioner
    });
  }, []);

  useEffect(() => {
    identiconAsync(account, 80, accountRef);
  }, [account]);

  useEffect(() => {
    console.log(props);
  }, [props]);

  return (
    <div>
      <div style={{minHeight: '100vh'}}>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand href="/">365 DAY NFT</Navbar.Brand>
            <Nav className="me-auto">
              <Image alt='Account' ref={accountRef} style={{width: '40px', height: '40px'}} />
              <Nav.Link href={`https://etherscan.io/address/${account}`}>
                {shortHash(account)}
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>

        <Container fluid="md" style={{width: '100%', marginBottom: '10rem'}}>
          <Row style={{marginTop: '1rem', width: '100%'}} className="justify-content-md-center">
            {
              currentNft ? 
              <NftDescription 
                nfts={nfts}
                setNfts={setNfts}
                currentNft={currentNft} 
                carouselViewHandler={carouselViewHandler} 
                account={account}
                auctioner={auctioner}
                auctions={auctions}
                setAuctions={setAuctions}/> :
              <NftCarousel 
                carouselView={carouselView} 
                onSelect={carouselViewHandler}
                nfts={nfts} 
                account={account} 
                setCurrentNft={setCurrentNft}/>
            }
          </Row>
          <Row 
            hidden={!!currentNft && account.toLowerCase() !== currentNft.owner.toLowerCase()}
            style={{marginTop: '1rem', width: '100%'}} 
            className="justify-content-md-center">
            <ContractForms 
              connect={contractsConnector}
              setAccount={setAccount}
              setNftContract={setNftContract}
              setCurrentFee={setCurrentFee}
              setAuctioner={setAuctioner}
              setCurrentNft={setCurrentNft}
              currentNft={currentNft}
              nftContract={nftContract}
              nfts={nfts}
              setNfts={setNfts}
              currentFee={currentFee}
              account={account}
              auctioner={auctioner}
              auctions={auctions}
              setAuctions={setAuctions}
            />
          </Row>
        </Container>
      </div>

      <Footer/>
    </div>
  );
}

App.propTypes = {
    day365: propTypes.object.isRequired,
    auctioner: propTypes.object.isRequired,
    account: propTypes.string.isRequired,
    currentFee: propTypes.number,
    nfts: propTypes.array,
    contractsConnected: propTypes.bool
};

function mapStateToProps(state) {
  return {
      day365: state.contracts.day365,
      auctioner: state.contracts.auctioner,
      account: state.contracts.account,
      currentFee: state.contracts.currentFee,
      nfts: state.contracts.nfts,
      contractsConnected: state.contracts.contractsConnected
  };
}

export default compose(
  connect(mapStateToProps, actions)
)(App);