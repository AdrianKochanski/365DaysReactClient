import React, { Fragment } from 'react';
import { Table, Button, Container, Row, Image } from 'react-bootstrap';

function NftDescription({currentNft, descriptionHandler}) {
return (
    <Table style={{width: '46rem'}} striped bordered hover variant="dark">
        <thead>
            <tr>
                <th>
                    <Container style={{height: '17rem', display: 'flex', flexFlow: 'column nowrap', justifyContent: 'space-between'}}>
                        <Row className="justify-content-md-center">
                            <Container fluid="md">
                                <Row className="justify-content-md-center">
                                    Current Price:
                                </Row>
                                <Row className="justify-content-md-center">
                                    {1000 + ' ETH'}
                                </Row>
                            </Container>
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
                <td>Id</td>
                <td>{currentNft.id}</td>
            </tr>
            <tr>
                <td>Owner</td>
                <td>{currentNft.owner}</td>
            </tr>
            <tr>
                <td>Metadata Uri</td>
                <td>{currentNft.uri}</td>
            </tr>
            <tr>
                <td>Name</td>
                <td>{currentNft.name}</td>
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
                <td>Temperature</td>
                <td>{currentNft.temperature}</td>
            </tr>
        </tbody>
    </Table>
);}

export default NftDescription;