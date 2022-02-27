import React, {useState} from 'react';
import { Carousel, Button, Image, Spinner } from 'react-bootstrap';
import { getOwner } from '../services/helpers';

function NftCarousel({nfts, account, getAuction}) {
    const [descriptionLoading, setDescriptionLoading] = useState(false);

    const getAuctionHandler = async (nft) => {
        setDescriptionLoading(true);
        try {
            await getAuction(nft, () => {
                setDescriptionLoading(false);
            });
        } catch {
            setDescriptionLoading(false);
        }
    }

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
                            disabled={descriptionLoading}
                            onClick={() => {getAuctionHandler(nft)}} 
                            variant="primary" 
                            type="button">
                            <Spinner
                                hidden={!descriptionLoading}
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                            {nft.name ? nft.name : "Set metadata..."}
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