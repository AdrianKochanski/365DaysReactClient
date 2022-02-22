import React from 'react';
import { Carousel, Button, Image } from 'react-bootstrap';
import { getOwner } from '../services/helpers';

function NftCarousel({nfts, account, descriptionHandler}) {
    const getItems = () => {
        const cards = [];
    
        if(nfts && nfts.length > 0) {
            nfts.forEach(nft => {
                cards.push(
                  <Carousel.Item key={nft.id}>
                      <Image
                          className="d-block"
                          src={nft.image ? nft.image : "placeholder-image.png"}
                          alt={"Owned by: " + getOwner(nft, account)}
                          style={{width: '46rem', height: '28rem', objectFit: 'cover'}}
                      />
                      <Carousel.Caption>
                        <Button 
                            onClick={() => {descriptionHandler(nft)}} 
                            variant="primary" 
                            type="button">
                            {nft.name ? nft.name : "Set metadata..."}
                        </Button>
                        <p>{"Owner: " + getOwner(nft, account) + " " + nft.description}</p>
                      </Carousel.Caption>
                  </Carousel.Item>
                );
            });
        } 
        else {
            cards.push(
                <Carousel.Item>
                    <img
                        className="d-block"
                        src="placeholder-image.png"
                        alt={"No Owner..."}
                        style={{width: '46rem', height: '28rem', objectFit: 'cover'}}
                    />
                    <Carousel.Caption>
                        <h3>No name...</h3>
                        <p>Should be description</p>
                    </Carousel.Caption>
                </Carousel.Item>
            );
        }
        
        return cards;
    };

    return (
        <Carousel style={{background: 'gray'}}>
            {getItems()}
        </Carousel>
    );
}

export default NftCarousel;