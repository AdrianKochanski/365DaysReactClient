import React, { useRef, useState } from 'react';
import { ethers } from 'ethers';
import { Container, Row, Col, Button, Form, Card, Spinner } from 'react-bootstrap';
import ipfs from '../services/ipfs';
import { getBuffer, getBufferFromJson, getIpfsLink, previewImage } from '../services/helpers';


const mintForm = ({nftContract, nfts, setNfts, previewImg, setPreview, file, setFile, currentFee, account}) => {
    const formRef = useRef(null);

    const [loading, setLoading] = useState(false);

    const clearForm = () => {
      formRef.current[0].value = null;
      formRef.current[1].value = "";
      formRef.current[2].value = 0;
      formRef.current[3].value = "";
      setPreview('placeholder-image.png');
      setFile(null);
    }

    const addNewNftToList = (tokenUri, nextDate, description, location, temperature) => {
      const newNft = {
        uri: tokenUri,
        name: nextDate,
        description: description,
        image: URL.createObjectURL(file),
        location: location,
        temperature: temperature,
        owner: account
      };
  
      nfts.push(newNft);
      setNfts([...nfts]);
    }

    const getMetadata = (nextDate, description, imgHash, fileName, location, temperature) => {
      return {
        name: nextDate,
        description: description,
        image: getIpfsLink(imgHash, fileName),
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

    const mintToken = async () => {
      const imgBuffer =  await getBuffer(file);
      const imgResponse = await ipfs.files.add(imgBuffer);
      const d = new Date();
      const nextDate = d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear();
      const imgHash = imgResponse[0].hash;
      const description = formRef.current[1].value;
      const temperature = formRef.current[2].value;
      const location = formRef.current[3].value;

      const metadata = getMetadata(nextDate, description, imgHash, file.name, location, temperature);
      const jsonBuffer = await getBufferFromJson(metadata);
      const metadataResp = await ipfs.files.add(jsonBuffer);
      const metadataHash = metadataResp[0].hash;
      const tokenUri = getIpfsLink(metadataHash, metadata.name);
      await nftContract.mintToken(tokenUri, {value: ethers.utils.parseEther(currentFee)});
      const tokenId = parseInt(await nftContract.tokensCount()) + 1;

      return {
        tokenId, tokenUri, nextDate, description, location, temperature
      }
    }

    const mintHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        const nft = await mintToken();
        const eventFilter = nftContract.filters.Transfer(ethers.constants.AddressZero, account, nft.tokenId);

        nftContract.provider.on(eventFilter, (log, event) => {
          addNewNftToList(nft.tokenUri, nft.nextDate, nft.description, nft.location, nft.temperature);
          setLoading(false);
          clearForm();
        })
    }

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
                    {loading ? 'Minting...' : 'Mint DAY NFT'}
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