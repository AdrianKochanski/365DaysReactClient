import React, { useEffect, useState } from 'react';
import './App.css';
import { Container, Row, Navbar, Nav } from 'react-bootstrap';
import Footer from './Footer';
import { ethers } from 'ethers';

import NftCarousel from './NftCarousel';
import NftDescription from './NftDescription';
import { shortHash } from '../services/helpers';
import connect from '../services/contractsConnector';
import ContractForms from './ContractForms';

function App() {
  const [account, setAccount] = useState(null);
  const [currentFee, setCurrentFee] = useState("0");
  const [nftContract, setNftContract] = useState(null);
  const [auctioner, setAuctioner] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [currentNft, setCurrentNft] = useState(null);
  const [auction, setAuction] = useState(null);

  useEffect(() => {
    connect({
      userConnect: false, 
      setAccount, 
      setNftContract, 
      setCurrentFee, 
      nfts, 
      setNfts, 
      setAuctioner
    });
  }, []);

  const getAuction = async (nft, callback) => {
    const auction = await auctioner.getAuction(nft.id);
    const bid = await auctioner.getBid(nft.id);

    const formatAuction = {
        owner: auction[0].toLowerCase(),
        timestamp: auction[1].toNumber(),
        price: ethers.utils.formatEther(auction[2]),
        winner: auction[3].toLowerCase(),
        isWinner: auction[3].toLowerCase() === account.toLowerCase(),
        isStarted: auction[1].toNumber() !== 0,
        isEnded: auction[1].toNumber() !== 0 && (new Date(auction[1].toNumber()*1000)) < (new Date()),
        isOwner: auction[0].toLowerCase() === account.toLowerCase(),
        totalBid: ethers.utils.formatEther(bid)
    };

    console.log(formatAuction);

    setAuction(formatAuction);
    setCurrentNft(nft);
    if(callback) callback();
  }

  return (
    <div>
      <div style={{minHeight: '100vh'}}>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand href="/">365 DAY NFT</Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link href={`https://etherscan.io/address/${account}`}>
                Account: {shortHash(account)}
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>

        <Container fluid="md" style={{width: '100%'}}>
          <Row style={{marginTop: '1rem', width: '100%'}} className="justify-content-md-center">
            {
              currentNft ? 
              <NftDescription 
                currentNft={currentNft} 
                descriptionHandler={setCurrentNft} 
                account={account}
                auctioner={auctioner}
                getAuction={getAuction}
                auction={auction}/> :
              <NftCarousel 
                nfts={nfts} 
                account={account} 
                getAuction={getAuction}/>
            }
          </Row>
          <Row 
            hidden={!!currentNft && account.toLowerCase() !== currentNft.owner.toLowerCase()}
            style={{marginTop: '1rem', width: '100%'}} 
            className="justify-content-md-center">
            <ContractForms 
              connect={connect}
              setAccount={setAccount}
              setNftContract={setNftContract}
              setCurrentFee={setCurrentFee}
              setAuctioner={setAuctioner}
              descriptionHandler={setCurrentNft}
              currentNft={currentNft}
              nftContract={nftContract}
              nfts={nfts}
              setNfts={setNfts}
              currentFee={currentFee}
              account={account}
              auctioner={auctioner}
              getAuction={getAuction}
            />
          </Row>
        </Container>
      </div>

      <Footer style={{marginTop: '10rem'}}/>
    </div>
  );
}

export default App;
