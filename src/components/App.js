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

function App({account, contractsInit}) {
  const accountRef = useRef(null);
  const [currentNft, setCurrentNft] = useState(null);
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
    contractsInit(false);
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
                currentNft={currentNft} 
                carouselViewHandler={carouselViewHandler}/> :
              <NftCarousel 
                carouselView={carouselView} 
                onSelect={carouselViewHandler}
                setCurrentNft={setCurrentNft}/>
            }
          </Row>
          <Row 
            hidden={!!currentNft && account.toLowerCase() !== currentNft.owner.toLowerCase()}
            style={{marginTop: '1rem', width: '100%'}} 
            className="justify-content-md-center">
            <ContractForms 
              setCurrentNft={setCurrentNft}
              currentNft={currentNft}
            />
          </Row>
        </Container>
      </div>

      <Footer/>
    </div>
  );
}

App.propTypes = {
    account: propTypes.string.isRequired
};

function mapStateToProps(state) {
  return {
      account: state.contracts.account
  };
}

export default compose(
  connect(mapStateToProps, actions)
)(App);