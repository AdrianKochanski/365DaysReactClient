import React , { useRef, useState } from 'react';
import { Table, Button, Container, Row, Image, Form, Spinner } from 'react-bootstrap';
import {getOwner, checkWalletAddress, getDateFromMiliseconds} from '../services/helpers';
import { ethers } from 'ethers';

function NftDescription({currentNft, descriptionHandler, account, auctioner, auction, getAuction}) {

    const bidFormRef = useRef(null);
    const [bidLoading, setBidLoading] = useState(false);
    const [endLoading, setEndLoading] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const bidHandler = async () => {
        setBidLoading(true);
        try {
            const price = bidFormRef.current[0].value;
            await auctioner.bid(currentNft.id, {value: ethers.utils.parseEther(price)});
    
            let bidEvent = auctioner.filters.Bid(currentNft.id, account, null);
            
            auctioner.provider.on(bidEvent, async (log, event) => {
                bidFormRef.current[0].value = null;
                await getAuction(currentNft);
                setBidLoading(false);
            });
        } catch {
            setBidLoading(false);
        }
    }

    const endHandler = async () => {
        setEndLoading(true);
        try{
            await auctioner.end(currentNft.id);

            let endEvent = auctioner.filters.End(currentNft.id, null, null);
            
            auctioner.provider.on(endEvent, async (log, event) => {
                await getAuction(currentNft);
                setEndLoading(false);
            });
        } catch {
            setEndLoading(false);
        }
    }

    const withdrawHandler = async () => {
        setWithdrawLoading(true);
        try {
            await auctioner.withdraw(currentNft.id);

            let withdrawEvent = auctioner.filters.Withdraw(currentNft.id, account, null);
            
            auctioner.provider.on(withdrawEvent, async (log, event) => {
                await getAuction(currentNft);
                setWithdrawLoading(false);
            });
        } catch {
            setWithdrawLoading(false);
        }
    }

    const cancelHandler = async () => {
        setCancelLoading(true);
        try {
            await auctioner.cancel(currentNft.id);

            let cancelEvent = auctioner.filters.Cancel(currentNft.id, null);
            
            auctioner.provider.on(cancelEvent, async (log, event) => {
                await getAuction(currentNft);
                setCancelLoading(false);
            });
        } catch {
            setCancelLoading(false);
        }
    }

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
                                    onClick={() => {descriptionHandler(null)}} 
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
                <td>{getOwner(currentNft, account, true)}</td>
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
                            <td>Seller:</td>
                                <td>{ checkWalletAddress(auction.owner, account, false) }</td>
                            </tr>
                            <tr>
                                <td>Current Price:</td>
                                <td>{ auction.price + ' ETH'}</td>
                            </tr>
                            <tr>
                                <td>Current Winner:</td>
                                <td>{ checkWalletAddress(auction.winner, account, false) }</td>
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
                                            disabled={bidLoading}
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
                                                hidden={!bidLoading}
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
                    (auction.totalBid != 0 && auction.isWinner) || 
                    (auction.isStarted && auction.isEnded) || 
                    (auction.isOwner && auction.isStarted && !auction.isEnded && auction.winner === ethers.constants.AddressZero)
                )}>
                <td>Interactions</td>
                <td>
                    <Button 
                        disabled={endLoading}
                        hidden={!(auction.isStarted && auction.isEnded)}
                        onClick={endHandler}
                        style={{marginRight: '7px'}}
                        variant="warning" 
                        type="button">
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            hidden={!endLoading}
                        />
                        END
                    </Button>
                    <Button 
                        disabled={withdrawLoading}
                        hidden={!(auction.totalBid != 0 && auction.isWinner)}
                        style={{marginRight: '7px'}}
                        onClick={withdrawHandler}
                        variant="warning" 
                        type="button">
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            hidden={!withdrawLoading}
                        />
                        WITHDRAW({auction.totalBid + ' ETH'})
                    </Button>
                    <Button 
                        disabled={cancelLoading}
                        hidden={!(auction.isOwner && auction.isStarted && !auction.isEnded && auction.winner === ethers.constants.AddressZero)}
                        onClick={cancelHandler}
                        variant="danger" 
                        type="button">
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            hidden={!cancelLoading}
                        />
                        CANCEL
                    </Button>
                </td>
            </tr>
        </tbody>
    </Table>);
}

export default NftDescription;