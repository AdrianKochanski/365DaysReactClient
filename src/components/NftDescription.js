import React , { useEffect } from 'react';
import { Table, Button, Container, Row, Image } from 'react-bootstrap';
import {getOwner, shortHash, getDateFromMiliseconds} from '../services/helpers';

function NftDescription({currentNft, descriptionHandler, account, auction}) {


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
            <tr hidden={!(auction.isStarted && !auction.isEnded)}>
                <td>Auction</td>
                <td>
                    <Table variant="dark" style={{marginBottom: '0px'}}>
                        <tbody>
                            <tr>
                                <td>Current Price:</td>
                                <td>{ auction.price + ' ETH'}</td>
                            </tr>
                            <tr>
                                <td>Current Winner:</td>
                                <td>{ shortHash(auction.winner) }</td>
                            </tr>
                            <tr>
                                <td>Time End:</td>
                                <td>{ getDateFromMiliseconds(auction.timestamp*1000) }</td>
                            </tr>
                        </tbody>
                    </Table>
                </td>
            </tr>
            <tr>
                <td>Interactions</td>
                <td>
                    <Button 
                        hidden={!(auction.isStarted && !auction.isEnded)}
                        style={{marginRight: '7px'}}
                        variant="success" 
                        type="button">
                        BID(amount)
                    </Button>
                    <Button 
                        hidden={!(auction.isStarted && auction.isEnded)}
                        style={{marginRight: '7px'}}
                        variant="warning" 
                        type="button">
                        END
                    </Button>
                    <Button 
                        style={{marginRight: '7px'}}
                        variant="warning" 
                        type="button">
                        WITHDRAW(amount)
                    </Button>
                    <Button 
                        hidden={!(auction.isOwner && auction.isStarted && !auction.isEnded)}
                        variant="danger" 
                        type="button">
                        CANCEL
                    </Button>
                </td>
            </tr>
        </tbody>
    </Table>);
}

export default NftDescription;