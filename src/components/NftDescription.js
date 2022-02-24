import React  from 'react';
import { Table, Button, Container, Row, Image } from 'react-bootstrap';
import {getOwner} from '../services/helpers';

function NftDescription({currentNft, descriptionHandler, account}) {

    return (<Table style={{width: '46rem'}} striped bordered hover variant="dark">
        <thead>
            <tr>
                <th>
                    <Container style={{height: '17rem', display: 'flex', flexFlow: 'column nowrap', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Row className="justify-content-md-center">
                            <span style={{marginRight: '5px'}}>Id:</span>
                            <span>{currentNft.id}</span>
                        </Row>
                        <Row className="justify-content-md-center">
                            <span style={{marginRight: '5px'}}>Date:</span>
                            <span>{"#" + currentNft.name}</span>
                        </Row>
                        <Row className="justify-content-md-center">
                            <span style={{marginRight: '5px'}}>Temperature:</span>
                            <span>{currentNft.temperature + " °C"}</span>
                        </Row>
                        <Row className="justify-content-md-center">
                            <span style={{marginRight: '5px'}}>Price:</span>
                            <span>{10 + ' ETH'}</span>
                        </Row>
                        <Row className="justify-content-md-center">
                            <Button 
                                onClick={() => {descriptionHandler(null)}} 
                                variant="primary" 
                                type="button">
                                Back
                            </Button>
                        </Row>
                    </Container>
                </th>
                <th>
                    <Container >
                        <Row className="justify-content-md-center">
                            <Image 
                                style={{width: '30rem', height: '17rem', objectFit: 'cover'}}
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
            <tr>
                <td>Interactions</td>
                <td>
                    <Button 
                        style={{marginRight: '7px'}}
                        variant="success" 
                        type="button">
                        BID(amount)
                    </Button>
                    <Button 
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