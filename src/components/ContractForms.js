import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import AuctionForm from './AuctionForm';
import Days365Form from './Days365Form';


const contractForms = ({connect, setAccount, setNftContract, setCurrentFee, setAuctioner, nftContract, 
  nfts, setNfts, currentFee, account, currentNft, descriptionHandler, auctioner, getAuction}) => {

    if(account) 
    {
      return  (
        <Container fluid="md">
          <Row className="justify-content-md-center" style={{ height: '20rem' }}>
            <Col md="auto">
              <Days365Form
                nftContract={nftContract}
                nfts={nfts}
                setNfts={setNfts}
                currentFee={currentFee}
                account={account}
                currentNft={currentNft}
                descriptionHandler={descriptionHandler}
              />
            </Col>
            <Col md="auto" hidden={!currentNft}>
              <AuctionForm
                nftContract={nftContract}
                nfts={nfts}
                account={account}
                currentNft={currentNft}
                auctioner={auctioner}
                getAuction={getAuction}
              />
            </Col>
          </Row>
        </Container>
      );
    } 
    else
    {
      return (
        <Button onClick={
          () => { connect({
            userConnect: true, 
            setAccount, 
            setNftContract, 
            setCurrentFee, 
            nfts, 
            setNfts, 
            setAuctioner
          }); }
        } variant="info">Connect Wallet</Button>
      );
    }
    
}

export default contractForms;