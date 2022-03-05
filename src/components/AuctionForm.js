import React, { useRef, useState } from 'react';
import { ethers } from 'ethers';
import { Button, Form, Spinner } from 'react-bootstrap';
import { updateAuction } from '../services/helpers';

const auctionForms = ({nftContract, nfts, setNfts, account, currentNft, auctioner, auctions, setAuctions}) => {
    const auctionFormRef = useRef(null);
    const [auctionLoading, setAuctionLoading] = useState(false);

    const getAuctionFormData = () => {
      const startPrice = auctionFormRef.current[0].value;
      const daysEnd = auctionFormRef.current[1].value;
      return {startPrice, daysEnd};
    }

    const auctionHandler = async (e) => {
      e.preventDefault();
      setAuctionLoading(true);

      try {
        const auctionFormData = getAuctionFormData();
        await nftContract.approve(auctioner.address, currentNft.id);
        let approvalEvent = nftContract.filters.Approval(account, auctioner.address, currentNft.id);
        let auctionStartEvent = auctioner.filters.Start();
        
        nftContract.provider.on(approvalEvent, async (log, event) => {
          await auctioner.start(currentNft.id, ethers.utils.parseEther(auctionFormData.startPrice), auctionFormData.daysEnd);
        });
  
        auctioner.provider.on(auctionStartEvent, async (log, event) => {
          await updateAuction(currentNft.id, auctioner, auctions, setAuctions, account);
          clearAuctionForm();
          nfts[currentNft.id-1].owner = process.env.REACT_APP_AUCTIONER_ADDRESS.toLowerCase();
          setNfts([...nfts]);
          setAuctionLoading(false);
        });
      } catch (e) {
        console.log(e);
        setAuctionLoading(false);
      }
    }

    const clearAuctionForm = () => {
      if(auctionFormRef) {
        auctionFormRef.current[0].value = null;
        auctionFormRef.current[1].value = null;
      }
    }

    return  (
    <Form ref={auctionFormRef}>
        <div>
        <Form.Group className="mb-3" controlId="price">
            <Form.Label>Start Price ETH</Form.Label>
            <Form.Control type="number" placeholder="Start Price" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="endDays">
            <Form.Label>Days End</Form.Label>
            <Form.Control type="number" placeholder="Days End" />
        </Form.Group>
        </div>

        <Button 
            disabled={auctionLoading}
            onClick={auctionHandler}
            variant="primary" 
            type="submit">
            <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                hidden={!auctionLoading}
            />
            Start Auction
        </Button>
    </Form>
    )
}

export default auctionForms;