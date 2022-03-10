import React, { useRef, useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Card, Spinner } from 'react-bootstrap';
import { previewImage } from '../services/helpers';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import * as actions from '../actions/index';
import { useNavigate } from 'react-router-dom';


const Days365Form = ({currentFee, day365Loading, updateNftUri, mintNft, currentNft, setCurrentNft}) => {
    const daysFormRef = useRef(null);
    const navigate = useNavigate();

    const [previewImg, setPreview] = useState('placeholder-image.png');
    const [file, setFile] = useState(null);


    const clearMintingForm = () => {
      if(daysFormRef) 
      {
        daysFormRef.current[0].value = null;
        daysFormRef.current[1].value = "";
        daysFormRef.current[2].value = 0;
        daysFormRef.current[3].value = "";
        setPreview('placeholder-image.png');
        setFile(null);
      }
    }

    const setDataOnForm = () => {
      if(currentNft && daysFormRef)
      {
        setPreview(currentNft.image);
        daysFormRef.current[1].value = currentNft.description;
        daysFormRef.current[2].value = currentNft.temperature;
        daysFormRef.current[3].value = currentNft.location;
      } 
      else 
      {
        clearMintingForm();
      }
    }

    const interactHandler = async (e) => {
        e.preventDefault();
        
        const description = daysFormRef.current[1].value;
        const temperature = daysFormRef.current[2].value;
        const location = daysFormRef.current[3].value;
  
        if(currentNft) {
          updateNftUri(file, description, temperature, location, (nftId) => {
            clearMintingForm();
            navigate(`nfts/${nftId}`);
          });
        }
        else {
          mintNft(file, description, temperature, location, (nftId) => {
            clearMintingForm();
            navigate(`nfts/${nftId}`);
          });
        }
    }

    const getButtonDescription = () => {
      switch(!!day365Loading) {
        case true:
          switch(!!currentNft) {
            case true:
              return 'Updating...';
            default:
              return 'Minting...';
          }
        default:
          switch(!!currentNft) {
            case true:
              return 'Update URI';
            default:
              return 'Mint DAY NFT';
          }
      }
    }

    useEffect(() => {
        setDataOnForm();
    }, [currentNft]);

    return  (
        <Form ref={daysFormRef}>
        <Container fluid="md">
          <Row className="justify-content-md-center">
            <Col style={{width: '20rem'}} md="auto">
              <Card style={{ width: '18rem' }}>
                <Card.Img id='previewImg' style={{ height: '12rem' }} variant="top" src={previewImg} />
                <Card.Body>
                  <Form.Group className="mb-3" controlId="image">
                    <Form.File 
                      onChange={(e) => {previewImage(e, setPreview, setFile)}} 
                      accept='image/png, image/jpeg' 
                      type="file"
                      label="NFT Image"/>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
            <Col style={!currentNft ? {width: '20rem'} : {}} md="auto">
              <Form.Group className="mb-3" controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" placeholder="Description" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="temperature">
                <Form.Label>Temperature</Form.Label>
                <Form.Control type="number" placeholder="Temperature" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="location">
                <Form.Label>Location coordinates</Form.Label>
                <Form.Control type="text" label="Location coordinates" />
              </Form.Group>

              <Button 
                disabled={day365Loading}
                onClick={interactHandler} 
                variant="primary" 
                type="submit">
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    hidden={!day365Loading}
                  />
                  {getButtonDescription()}
              </Button>
              <div>{"Current Fee: " + currentFee + " ETH"}</div>
            </Col>
          </Row>
        </Container>
      </Form>
    )
}

Days365Form.propTypes = {
  currentFee: propTypes.number,
  day365Loading: propTypes.bool,
  currentNft: propTypes.object
};

function mapStateToProps(state) {
return {
    currentFee: state.contracts.currentFee,
    day365Loading: state.contracts.day365Loading,
    currentNft: state.contracts.currentNft
};
}

export default compose(
  connect(mapStateToProps, actions)
)(Days365Form);