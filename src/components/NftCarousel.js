import React from 'react';
import { Carousel, Button, Image } from 'react-bootstrap';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import * as actions from '../actions/index';

import { getOwner } from '../services/helpers';

function NftCarousel({nfts, account, setCurrentNft, carouselView, onSelect}) {

    const nftPlaceholder = () => {
        return (
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

    const nftItem = (nft) => {
        return (
            nft ?
            <Carousel.Item key={nft.id}>
                <Image
                    className="d-block"
                    src={nft.image ? nft.image : "placeholder-image.png"}
                    alt={"Owned by: " + getOwner(nft, account, false)}
                    style={{width: '46rem', height: '28rem', objectFit: 'cover'}}
                />
                <Carousel.Caption>
                <Button 
                    onClick={() => {setCurrentNft(nft.id)}} 
                    variant="primary" 
                    type="button">
                    {nft.uri && nft.name ? nft.name : nft.uri ? "Details" : "Set metadata..."}
                </Button>
                <p>{"Owner: " + getOwner(nft, account, false) + " " + nft.description}</p>
                </Carousel.Caption>
            </Carousel.Item>
            : nftPlaceholder()
        );
    }

    const getItems = () => {
        const cards = [];
    
        if(nfts && nfts.length > 0) {
            nfts.forEach(nft => {
                cards.push(
                    nftItem(nft)
                );
            });
        } 
        else {
            cards.push(
                nftPlaceholder()
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

NftCarousel.propTypes = {
    account: propTypes.string.isRequired,
    nfts: propTypes.array
};

function mapStateToProps(state) {
  return {
      account: state.contracts.account,
      nfts: state.contracts.nfts
  };
}

export default compose(
  connect(mapStateToProps, actions)
)(NftCarousel);