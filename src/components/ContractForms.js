import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import AuctionForm from './AuctionForm';
import Days365Form from './Days365Form';


const contractForms = ({connect, setAccount, setNftContract, setCurrentFee, setAuctioner, nftContract, 
  nfts, setNfts, currentFee, account, currentNft, setCurrentNft, auctioner, auctions, setAuctions}) => {

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
                setCurrentNft={setCurrentNft}
              />
            </Col>
            <Col md="auto" hidden={!currentNft}>
              <AuctionForm
                setNfts={setNfts}
                nftContract={nftContract}
                nfts={nfts}
                account={account}
                currentNft={currentNft}
                auctioner={auctioner}
                auctions={auctions} 
                setAuctions={setAuctions}
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