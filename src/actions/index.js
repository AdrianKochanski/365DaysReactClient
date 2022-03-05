import nftContractJSON from '../abis/Days365.json';
import auctionerContractJSON from '../abis/Auctioner.json';
import { ethers } from 'ethers';
import axios from 'axios';

import { CONTRACTS_DATA_INIT, AUCTION_UPDATE, NFT_UPDATE } from './types';

export const contractsInit = (userConnect) => async dispatch => {
    const { ethereum } = window;

    if(!ethereum){
      console.log("Make sure you have Metamask installed!");
      return;
    }
    else {
      console.log("Wallet is ready to connect!");
    }

    try{
        let accounts;

        if(userConnect) {
            accounts = await ethereum.request({method: 'eth_requestAccounts'});
        }
        else {
            accounts = await ethereum.request({method: 'eth_accounts'});
        }
    
        if(accounts.length !== 0) {
            console.log("Connecting authorized account: "  + accounts[0]);
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();

            const data = {};
            data.account = accounts[0].toLowerCase();
            data.day365 = new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS, nftContractJSON.abi, signer);
            data.auctioner = new ethers.Contract(process.env.REACT_APP_AUCTIONER_ADDRESS, auctionerContractJSON.abi, signer);
            data.currentFee = Number.parseFloat(ethers.utils.formatEther((await data.day365.currentFee())));
            data.contractsConnected = true;

            dispatch({
                type: CONTRACTS_DATA_INIT,
                payload: data
            });
            dispatch(nftsDataInit());
        }
        else {
          console.log("Did not found account to connect");
        }
    } catch(err)
    {
        console.log(err);
    }
}

export const nftsDataInit = () => async (dispatch, getState) => {
    const contract = getState().contracts.day365;
    let tokensCount = await contract.tokensCount();

    for(let i=0 ; i<tokensCount; i++) {
        dispatch(nftInit(i+1));
    }
}

export const nftInit = (nftId) => async (dispatch, getState) => {
    const contract = getState().contracts.day365;
    let file;
    const tokenUri = await contract.tokenURI(nftId);
    const owner = await contract.ownerOf(nftId);
    
    const data = {
        id: nftId,
        uri: tokenUri,
        name: "",
        description: "",
        image: "",
        location: "",
        temperature: 0,
        owner: owner.toLowerCase()
    };

    try {
        file = await axios({
            url: tokenUri,
            method: 'GET',
            responseType: 'json'
        });
    }
    catch(err) {
        console.log(err);
    }

    if(file) {
        data.name = file.data.name;
        data.description = file.data.description;
        data.image = file.data.image;
        data.location = file.data.attributes.filter(a => a.trait_type === "location")[0].value;
        data.temperature = file.data.attributes.filter(a => a.trait_type === "temperature")[0].value;
    }

    dispatch({
        type: NFT_UPDATE,
        payload: data
    });
    dispatch(auctionInit(nftId));
}

export const auctionInit = (nftId) => async (dispatch, getState) => {
    const auctioner = getState().contracts.auctioner;
    const account = getState().contracts.account;

    const auction = await auctioner.getAuction(nftId);
    const bid = await auctioner.getBid(nftId);

    const owner = auction[0] ? auction[0].toLowerCase() : ethers.constants.AddressZero;
    const timestamp = auction[1].toNumber();
    const price = ethers.utils.formatEther(auction[2]);
    const winner = auction[3] ? auction[3].toLowerCase() : ethers.constants.AddressZero;

    const formatAuction = {
        nftId: nftId,
        owner: owner,
        timestamp: timestamp,
        price: price,
        winner: winner,
        isWinner: winner === account.toLowerCase(),
        isStarted: timestamp !== 0,
        isEnded: timestamp !== 0 && (new Date(timestamp*1000)) < (new Date()),
        isOwner: owner === account.toLowerCase(),
        totalBid: ethers.utils.formatEther(bid)
    };

    dispatch({
        type: AUCTION_UPDATE,
        payload: formatAuction
    });
}