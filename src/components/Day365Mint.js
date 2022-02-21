import React, { useRef, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Container, Row, Col, Button, Form, Card, Spinner } from 'react-bootstrap';
import ipfs from '../services/ipfs';
import { getBuffer, getBufferFromJson, getIpfsLink, previewImage } from '../services/helpers';


const mintForm = ({nftContract, nfts, setNfts, currentFee, account, currentNft, descriptionHandler}) => {
    const formRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [previewImg, setPreview] = useState('placeholder-image.png');
    const [file, setFile] = useState(null);

    const clearForm = () => {
      formRef.current[0].value = null;
      formRef.current[1].value = "";
      formRef.current[2].value = 0;
      formRef.current[3].value = "";
      setPreview('placeholder-image.png');
      setFile(null);
    }

    const setDataOnForm = () => {
      if(currentNft){
        setPreview(currentNft.image);
        formRef.current[1].value = currentNft.description;
        formRef.current[2].value = currentNft.temperature;
        formRef.current[3].value = currentNft.location;
      }
    }

    const updateNftList = ({id, uri, name, description, image, location, temperature}) => {
      let nftToUpdate;

      if(currentNft) 
      {
        nftToUpdate = nfts[currentNft.id-1];
      }
      else {
        nftToUpdate = {};
      }

      nftToUpdate.id = id;
      nftToUpdate.uri = uri;
      nftToUpdate.name = name;
      nftToUpdate.description = description;
      nftToUpdate.image = image;
      nftToUpdate.location = location;
      nftToUpdate.temperature = temperature;
      nftToUpdate.owner = account;
  
      if(!currentNft)
      {
        nfts.push(nftToUpdate);
      }

      setNfts([...nfts]);
    }

    const getMetadata = (name, description, imgUri, location, temperature) => {
      return {
        name: name,
        description: description,
        image: imgUri,
        attributes: [
            {
                trait_type: "location",
                value: location
            },
            {
                trait_type: "temperature",
                value: temperature
            }
        ]
      };
    }

    const handleTokenMetadata = async () => {
      let image;
      let name;
      let id;

      if(file) {
        const imgBuffer =  await getBuffer(file);
        const imgResponse = await ipfs.files.add(imgBuffer);
        image = getIpfsLink(imgResponse[0].hash, file.name);
      } 
      else if(currentNft) {
        image = currentNft.image;
      }

      if(currentNft) {
        name = currentNft.name;
      } else {
        const d = new Date();
        name = d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear();
      }

      const description = formRef.current[1].value;
      const temperature = formRef.current[2].value;
      const location = formRef.current[3].value;

      const metadata = getMetadata(name, description, image, location, temperature);
      const jsonBuffer = await getBufferFromJson(metadata);
      const metadataResp = await ipfs.files.add(jsonBuffer);
      const metadataHash = metadataResp[0].hash;
      const uri = getIpfsLink(metadataHash, metadata.name);

      if(currentNft) {
        id = currentNft.id;
        await nftContract.setTokenURI(id, uri);
      }
      else {
        await nftContract.mintToken(uri, {value: ethers.utils.parseEther(currentFee)});
        id = parseInt(await nftContract.tokensCount()) + 1;
      }

      return {
        id, uri, name, description, location, temperature, image
      }
    }

    const mintHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        const nft = await handleTokenMetadata();

        if(currentNft) {
          updateNftList(nft);
          descriptionHandler(0);
          setLoading(false);
          clearForm();
        }
        else {
          const eventFilter = nftContract.filters.Transfer(ethers.constants.AddressZero, account, nft.tokenId);

          nftContract.provider.on(eventFilter, (log, event) => {
            updateNftList(nft);
            setLoading(false);
            clearForm();
          })
        }
    }

    const getButtonDescription = () => {
      switch(!!loading) {
        case true:
          switch(!!currentNft) {
            case true:
              return 'Updating...';
            case false:
              return 'Minting...';
          }
        case false:
          switch(!!currentNft) {
            case true:
              return 'Update URI';
            case false:
              return 'Mint DAY NFT';
          }
      }
    }

    useEffect(() => {
      setDataOnForm();
    }, [currentNft]);

    return  (
      <Form ref={formRef}>
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
            <Col style={{width: '20rem'}} md="auto">
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

              <Form.Group className="mb-3" controlId="location">
                <Button 
                  disabled={loading}
                  onClick={mintHandler} 
                  variant="primary" 
                  type="submit">
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      hidden={!loading}
                    />
                    {getButtonDescription()}
                </Button>
                <div>{"Current Fee: " + currentFee + " ETH"}</div>
              </Form.Group>
            </Col>
          </Row>
        </Container>
      </Form>
    )
}

export default mintForm;