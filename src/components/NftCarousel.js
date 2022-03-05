import React from 'react';
import { Carousel, Button, Image } from 'react-bootstrap';
import { getOwner } from '../services/helpers';

function NftCarousel({nfts, account, setCurrentNft, carouselView, onSelect}) {

    const getItems = () => {
        const cards = [];
    
        if(nfts && nfts.length > 0) {
            nfts.forEach(nft => {
                cards.push(
                  <Carousel.Item key={nft.id}>
                      <Image
                          className="d-block"
                          src={nft.image ? nft.image : "placeholder-image.png"}
                          alt={"Owned by: " + getOwner(nft, account, false)}
                          style={{width: '46rem', height: '28rem', objectFit: 'cover'}}
                      />
                      <Carousel.Caption>
                        <Button 
                            onClick={() => {setCurrentNft(nft)}} 
                            variant="primary" 
                            type="button">
                            {nft.uri && nft.name ? nft.name : nft.uri ? "Details" : "Set metadata..."}
                        </Button>
                        <p>{"Owner: " + getOwner(nft, account, false) + " " + nft.description}</p>
                      </Carousel.Caption>
                  </Carousel.Item>
                );
            });
        } 
        else {
            cards.push(
                <Carousel.Item>
                    <Image
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
        <Carousel activeIndex={carouselView} onSelect={onSelect} style={{maxWidth: '46rem', background: 'gray'}}>
            {getItems()}
        </Carousel>
    );
}

export default NftCarousel;