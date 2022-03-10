import React from 'react';
import { Carousel, Button, Image } from 'react-bootstrap';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import * as actions from '../actions/index';
import { Link } from "react-router-dom";

import { getOwner } from '../services/helpers';

function NftCarousel({nfts, account, carouselView, onSelect, setCurrentNft}) {

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
                    {(nft && nft.auction && nft.auction.isStarted && !nft.auction.isEnded) ? 
                     <p style={{backgroundColor: 'blue', color: 'yellow', marginBottom: '0px', fontWeight: 'bold', width: '170px', margin: 'auto'}}>{getOwner(nft, account, false) + " " + nft.auction.price + " ETH"}</p> : 
                     <p style={{backgroundColor: 'white', color: 'black', marginBottom: '0px', fontWeight: 'bold', width: '170px', margin: 'auto'}}>{getOwner(nft, account, false)}</p>
                    }
                <Button 
                    style={{margin: '5px 0px 5px 0px'}}
                    variant="primary" 
                    type="button">
                    <p style={{marginBottom: '0px'}}>
                        <Link
                        onClick={() => {setCurrentNft(nft.id)}}
                        style={{textDecoration: 'none', color: 'white'}}
                        to={`/nfts/${nft.id}`}
                        key={nft.id}>
                            {nft.uri && nft.name ? "#" + nft.name : "Details.."}
                        </Link>
                    </p>
                </Button>
                <p style={{marginBottom: '0px'}}>{nft.description}</p>
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