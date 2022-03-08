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
import ContractForms from './ContractForms';

function App({account, contractsInit, currentNft, setCurrentNft, saveSubscribe}) {
  const accountRef = useRef(null);
  const contractRef = useRef(null);
  const [carouselView, setCarouselView] = useState(0);

  const carouselViewHandler = (idx, e) => {
    if(currentNft) 
    {
      setCarouselView(currentNft.id-1);
      setCurrentNft(0);
    }
    else 
    {
      setCarouselView(idx);
    }
  };

  useEffect(() => {
    identiconAsync(process.env.REACT_APP_CONTRACT_ADDRESS, 80, contractRef);
    contractsInit(false, false);
    const unsubscibeSave = saveSubscribe();
    
    return () => {
      unsubscibeSave();
    };
  }, []);

  useEffect(() => {
    identiconAsync(account, 80, accountRef);
  }, [account]);

  return (
    <div>
      <div style={{minHeight: '100vh'}}>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand href="/">365 DAY NFT</Navbar.Brand>
            <Nav className="me-auto">
              <Image alt='Contract' ref={contractRef} style={{width: '40px', height: '40px'}} />
              <Nav.Link href={`https://etherscan.io/address/${process.env.REACT_APP_CONTRACT_ADDRESS}`}>
                {'Contract: ' + shortHash(process.env.REACT_APP_CONTRACT_ADDRESS.toLowerCase())}
              </Nav.Link>
              <Image alt='Account' ref={accountRef} style={{width: '40px', height: '40px'}} />
              <Nav.Link href={`https://etherscan.io/address/${account}`}>
                {'Account: ' + shortHash(account)}
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>

        <Container fluid="md" style={{width: '100%', marginBottom: '10rem'}}>
          <Row style={{marginTop: '1rem', width: '100%'}} className="justify-content-md-center">
            {
              currentNft ? 
              <NftDescription 
                carouselViewHandler={carouselViewHandler}/> :
              <NftCarousel 
                carouselView={carouselView} 
                onSelect={carouselViewHandler}/>
            }
          </Row>
          <Row 
            hidden={!!currentNft && account.toLowerCase() !== currentNft.owner.toLowerCase()}
            style={{marginTop: '1rem', width: '100%'}} 
            className="justify-content-md-center">
            <ContractForms/>
          </Row>
        </Container>
      </div>

      <Footer/>
    </div>
  );
}

App.propTypes = {
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
)(App);