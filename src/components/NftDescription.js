import React , { useRef, useEffect } from 'react';
import { Table, Button, Container, Row, Image, Form, Spinner } from 'react-bootstrap';
import {getOwner, checkWalletAddress, getDateFromMiliseconds, getDefaultNft} from '../services/helpers';
import { identiconAsync } from '../services/identicon';
import { ethers } from 'ethers';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import * as actions from '../actions/index';
import { useParams, useNavigate } from "react-router-dom";

function NftDescription({nfts, carouselViewHandler, account, cancelAuction, bidAuction, endAuction, withdrawAuction, setCurrentNft}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentNft = nfts[id-1] ? nfts[id-1] : getDefaultNft(id);
    const bidFormRef = useRef(null);
    const ownerIdentRef = useRef(null);
    const auctionSellerIdentRef = useRef(null);
    const auctionWinnerIdentRef = useRef(null);
    const auction = currentNft.auction;
    const isLoading = currentNft.isLoading;

    const bidHandler = async () => {
        const price = bidFormRef.current[0].value;

        bidAuction(price, () => {
            bidFormRef.current[0].value = null;
        });
    }

    useEffect(() => {
        identiconAsync(currentNft.owner, 50, ownerIdentRef);
    }, [currentNft]);

    useEffect(() => {
        identiconAsync(auction.owner, 50, auctionSellerIdentRef);
        identiconAsync(auction.winner, 50, auctionWinnerIdentRef);
    }, [auction]);

    return (<Table style={{width: '46rem'}} striped bordered variant="dark">
        <thead>
            <tr>
                <th>
                    <Table variant="dark" style={{marginBottom: '0px'}}>
                        <thead>
                            <tr>
                                <th> {'Id: ' + currentNft.id} </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{"#" + currentNft.name}</td>
                            </tr>
                            <tr>
                                <td>{currentNft.temperature + " °C"}</td>
                            </tr>
                            <tr>
                                <td>{auction.price != 0 ? auction.price + ' ETH' : 'No price history'}</td>
                            </tr>
                            <tr>
                                <td>
                                    <Button 
                                    onClick={(e) => {
                                        carouselViewHandler(currentNft.id-1, e);
                                        navigate("/");
                                        setCurrentNft(0);
                                    }}
                                    variant="primary" 
                                    type="button">
                                    Back
                                    </Button>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </th>
                <th>
                    <Container >
                        <Row className="justify-content-md-center">
                            <Image 
                                style={{width: '28rem', height: '16rem', objectFit: 'cover'}}
                                src={currentNft.image}
                            />
                        </Row>
                    </Container>
                </th>
            </tr>
            <tr>
                <th>Property</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Owner</td>
                <td>
                    <Image alt='Contract' ref={ownerIdentRef} style={{width: '25px', height: '25px'}} />
                    {" " + getOwner(currentNft, account, true)}
                </td>
            </tr>
            <tr>
                <td>Metadata Uri</td>
                <td>{currentNft.uri}</td>
            </tr>
            <tr>
                <td>Description</td>
                <td>{currentNft.description}</td>
            </tr>
            <tr>
                <td>Location Coordinates</td>
                <td>{currentNft.location}</td>
            </tr>
            <tr hidden={!(auction.isStarted)}>
                <td>Auction</td>
                <td>
                    <Table variant="dark" style={{marginBottom: '0px'}}>
                        <tbody>
                            <tr>
                                <td>Status:</td>
                                <td>{ auction.isStarted && !auction.isEnded ? "Pending" : "Ended" }</td>
                            </tr>
                            <tr>
                                <td>Seller:</td>
                                <td>
                                    <Image alt='Contract' ref={auctionSellerIdentRef} style={{width: '25px', height: '25px'}} />
                                    {" " + checkWalletAddress(auction.owner, account, false) }
                                </td>
                            </tr>
                            <tr>
                                <td>Current Price:</td>
                                <td>{ auction.price + ' ETH'}</td>
                            </tr>
                            <tr>
                                <td>Current Winner:</td>
                                <td>
                                    <Image alt='Contract' ref={auctionWinnerIdentRef} style={{width: '25px', height: '25px'}} />
                                    {" " + checkWalletAddress(auction.winner, account, false) }
                                </td>
                            </tr>
                            <tr>
                                <td>Time End:</td>
                                <td>{ getDateFromMiliseconds(auction.timestamp*1000) }</td>
                            </tr>
                            <tr hidden={!(!auction.isEnded && !auction.isOwner)}>
                                <td>Bid:</td>
                                <td>
                                    <Form ref={bidFormRef} >
                                        <Form.Group className="mb-3" controlId="amount">
                                            <Form.Label>Amount</Form.Label>
                                            <Form.Control type="number" placeholder="Amount" />
                                        </Form.Group>

                                        <Button 
                                            disabled={isLoading}
                                            onClick={bidHandler}
                                            style={{width: '5rem'}}
                                            variant="success" 
                                            type="button">
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                hidden={!isLoading}
                                            />
                                            BID
                                        </Button>
                                    </Form>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </td>
            </tr>
            <tr hidden={!(
                    (auction.totalBid != 0 && !auction.isWinner) || 
                    (auction.isStarted && auction.isEnded) || 
                    (auction.isOwner && auction.isStarted && !auction.isEnded && auction.winner === ethers.constants.AddressZero)
                )}>
                <td>Interactions</td>
                <td>
                    <Button 
                        disabled={isLoading}
                        hidden={!(auction.isStarted && auction.isEnded)}
                        onClick={() => {endAuction(id)}}
                        style={{marginRight: '7px'}}
                        variant="warning" 
                        type="button">
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            hidden={!isLoading}
                        />
                        END
                    </Button>
                    <Button 
                        disabled={isLoading}
                        hidden={!(auction.totalBid != 0 && !auction.isWinner)}
                        style={{marginRight: '7px'}}
                        onClick={() => {withdrawAuction(id)}}
                        variant="warning" 
                        type="button">
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            hidden={!isLoading}
                        />
                        WITHDRAW({auction.totalBid + ' ETH'})
                    </Button>
                    <Button 
                        disabled={isLoading}
                        hidden={!(auction.isOwner && auction.isStarted && !auction.isEnded && auction.winner === ethers.constants.AddressZero)}
                        onClick={() => {cancelAuction(id)}}
                        variant="danger" 
                        type="button">
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            hidden={!isLoading}
                        />
                        CANCEL
                    </Button>
                </td>
            </tr>
        </tbody>
    </Table>);
}

NftDescription.propTypes = {
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
)(NftDescription);