import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { getOwner } from '../services/helpers';

function NftList({nfts, account}) {
    const showNFTCards = () => {
        const cards = [];
    
        nfts.forEach(nft => {
          cards.push(
            <Col md="auto">
              <Card style={{ width: '18rem' }}>
                <Card.Img style={{ height: '12rem' }} variant="top" src={nft.image ? nft.image : "placeholder-image.png"} />
                <Card.Body>
                  <Card.Title>{nft.name ? nft.name : "Metadata does not exist..."}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{"Owned by: " + getOwner(nft, account, false)}</Card.Subtitle>
                  <Card.Text>
                    {nft.description ? nft.description : "(...)"}
                  </Card.Text>
                  <Button variant="primary">Open Details</Button>
                </Card.Body>
              </Card>
            </Col>
          );
        });
    
        return (
            <Container fluid="md">
                <Row className="justify-content-md-center">
                    {cards}
                </Row>
            </Container>
        )
    };

    return showNFTCards(); 
}

export default NftList;