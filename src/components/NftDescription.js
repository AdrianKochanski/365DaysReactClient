import React from 'react';
import { Table } from 'react-bootstrap';
import { getOwner } from '../services/helpers';

function NftDescription({currentNft, descriptionHandler}) {
    return (
        <Table style={{width: '46rem'}} striped bordered hover variant="dark">
            <thead>
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
    );
}

export default NftDescription;