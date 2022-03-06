import nftContractJSON from '../abis/Days365.json';
import auctionerContractJSON from '../abis/Auctioner.json';
import { ethers } from 'ethers';
import axios from 'axios';
import { getBuffer, getBufferFromJson, getIpfsLink } from '../services/helpers';
import ipfs from '../services/ipfs';

import { CONTRACTS_DATA_INIT, CONTRACTS_UPDATE, AUCTION_UPDATE, NFT_UPDATE, CURRENT_NFT_UPDATE } from './types';

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

const nftsDataInit = () => async (dispatch, getState) => {
    const contract = getState().contracts.day365;
    let tokensCount = await contract.tokensCount();

    for(let i=0 ; i<tokensCount; i++) {
        dispatch(nftInit(i+1));
    }
}

const nftInit = (nftId) => async (dispatch, getState) => {
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
        owner: owner.toLowerCase(),
        isLoading: false
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

const auctionInit = (nftId) => async (dispatch, getState) => {
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

export const mintNft = (file, description, temperature, location, callback) => async (dispatch, getState) => {
    const contract = getState().contracts.day365;
    const account = getState().contracts.account;
    const currentFee = getState().contracts.currentFee.toString();

    dispatch({
        type: CONTRACTS_UPDATE, payload: {day365Loading: true}
    });

    try {
        const d = new Date();
        const name = d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear();
        let image;
        let id;

        if(file) {
            const imgBuffer =  await getBuffer(file);
            const imgResponse = await ipfs.files.add(imgBuffer);
            image = getIpfsLink(imgResponse[0].hash, file.name);
        } 

        const metadata = {
            name: name,
            description: description,
            image: image,
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
        }

        const jsonBuffer = await getBufferFromJson(metadata);
        const metadataResp = await ipfs.files.add(jsonBuffer);
        const metadataHash = metadataResp[0].hash;
        const uri = getIpfsLink(metadataHash, metadata.name);

        await contract.mintToken(uri, {value: ethers.utils.parseEther(currentFee)});
        id = parseInt(await contract.tokensCount()) + 1;

        const eventFilter = contract.filters.Transfer(ethers.constants.AddressZero, account, id);

        contract.provider.on(eventFilter, (log, event) => {
            dispatch({
                type: NFT_UPDATE, 
                payload: {
                    id, uri, name, description, location, temperature, image,
                    owner: account,
                    isLoading: false
                }
            });

            dispatch({
                type: CONTRACTS_UPDATE, payload: {day365Loading: false}
            });
            
            if(callback) {
                callback();
            }
        });

      } 
      catch(e) {
        console.log(e);
        dispatch({
            type: CONTRACTS_UPDATE, payload: {day365Loading: false}
        });
      }
}

export const updateNftUri = (file, description, temperature, location, callback) => async (dispatch, getState) => {
    const contract = getState().contracts.day365;
    const currentNft = getState().contracts.currentNft;

    dispatch({
        type: CONTRACTS_UPDATE, payload: {day365Loading: true}
    });

    try {
        let image = currentNft.image;
        let name = currentNft.name;
        let id = currentNft.id;

        if(file) {
            const imgBuffer =  await getBuffer(file);
            const imgResponse = await ipfs.files.add(imgBuffer);
            image = getIpfsLink(imgResponse[0].hash, file.name);
        }

        const metadata = {
            name: name,
            description: description,
            image: image,
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
        }
        const jsonBuffer = await getBufferFromJson(metadata);
        const metadataResp = await ipfs.files.add(jsonBuffer);
        const metadataHash = metadataResp[0].hash;
        const uri = getIpfsLink(metadataHash, metadata.name);
        await contract.setTokenURI(id, uri);
        const eventFilter = contract.filters.UriChange(id, null);

        contract.provider.on(eventFilter, (log, event) => {
            dispatch({
                type: NFT_UPDATE, 
                payload: {
                    id, uri, name, description, location, temperature, image
                }
            });

            dispatch({
                type: CONTRACTS_UPDATE, payload: {day365Loading: false}
            });

            dispatch(setCurrentNft(id));
            
            if(callback) {
                callback();
            }
        });
      } catch (e) {
        console.log(e);
        dispatch({
            type: CONTRACTS_UPDATE, payload: {day365Loading: false}
        });
      }
}

export const startAuction = (startPrice, daysEnd, callback) => async (dispatch, getState) => {
    const contract = getState().contracts.day365;
    const auctioner = getState().contracts.auctioner;
    const account = getState().contracts.account;
    const currentNft = getState().contracts.currentNft;
    
    dispatch({
        type: CONTRACTS_UPDATE, payload: {auctionLoading: true}
    });

    try {
        await contract.approve(auctioner.address, currentNft.id);
        let approvalEvent = contract.filters.Approval(account, auctioner.address, currentNft.id);
        let auctionStartEvent = auctioner.filters.Start(currentNft.id, null, null);
        
        contract.provider.on(approvalEvent, async (log, event) => {
            await auctioner.start(currentNft.id, ethers.utils.parseEther(startPrice), daysEnd);
        });

        auctioner.provider.on(auctionStartEvent, async (log, event) => {
            dispatch(auctionInit(currentNft.id));

            dispatch({
                type: NFT_UPDATE, payload: {
                    id: currentNft.id,
                    owner: process.env.REACT_APP_AUCTIONER_ADDRESS.toLowerCase()
                }
            });

            dispatch({
                type: CONTRACTS_UPDATE, payload: {auctionLoading: false}
            });

            dispatch(setCurrentNft(currentNft.id));

            if(callback) {
                callback();
            }

        });
    } 
    catch (e) {
        console.log(e);
        dispatch({
            type: CONTRACTS_UPDATE, payload: {auctionLoading: false}
        });
    }
}

export const cancelAuction = () => async (dispatch, getState) => {
    const auctioner = getState().contracts.auctioner;
    const account = getState().contracts.account;
    const currentNft = getState().contracts.currentNft;
    
    dispatch({
        type: NFT_UPDATE, payload: {id: currentNft.id, isLoading: true}
    });

    try {
        await auctioner.cancel(currentNft.id);
        let cancelEvent = auctioner.filters.Cancel(currentNft.id, null);
        
        auctioner.provider.on(cancelEvent, async (log, event) => {
            dispatch({
                type: AUCTION_UPDATE, payload: {
                    nftId: currentNft.id, 
                    timestamp: 0,
                    isStarted: false,
                    price: 0
                }
            });

            dispatch({
                type: NFT_UPDATE, payload: {
                    id: currentNft.id, 
                    owner: account, 
                    isLoading: false
                }
            });

            dispatch(setCurrentNft(currentNft.id));
        });
    } 
    catch (e) {
        console.log(e);
        dispatch({
            type: NFT_UPDATE, payload: {id: currentNft.id, isLoading: false}
        });
    }
}

export const bidAuction = (price, callback) => async (dispatch, getState) => {
    const auctioner = getState().contracts.auctioner;
    const account = getState().contracts.account;
    const currentNft = getState().contracts.currentNft;
    const auction = getState().contracts.nfts[currentNft.id-1].auction;
    let nextPrice = Number.parseFloat(price);

    if(auction.winner === account) {
        nextPrice = Number.parseFloat(auction.price) + nextPrice;
    }
    
    dispatch({
        type: NFT_UPDATE, payload: {id: currentNft.id, isLoading: true}
    });

    try {
        await auctioner.bid(currentNft.id, {value: ethers.utils.parseEther(price)});
        let bidEvent = auctioner.filters.Bid(currentNft.id, account, null);
        
        auctioner.provider.on(bidEvent, async (log, event) => {
            dispatch({
                type: AUCTION_UPDATE, payload: {
                    nftId: currentNft.id,
                    price: nextPrice,
                    winner: account,
                    isWinner: true,
                    totalBid: nextPrice
                }
            });

            dispatch({
                type: NFT_UPDATE, payload: {id: currentNft.id, isLoading: false}
            });

            dispatch(setCurrentNft(currentNft.id));

            if(callback) {
                callback();
            }
        });
    } 
    catch (e) {
        console.log(e);
        dispatch({
            type: NFT_UPDATE, payload: {id: currentNft.id, isLoading: false}
        });
    }
}

export const endAuction = () => async (dispatch, getState) => {
    const auctioner = getState().contracts.auctioner;
    const account = getState().contracts.account;
    const currentNft = getState().contracts.currentNft;
    const auction = getState().contracts.nfts[currentNft.id-1].auction;
    let nextOwner = account;

    if(auction.winner !== ethers.constants.AddressZero) {
        nextOwner = auction.winner;
    }
    
    dispatch({
        type: NFT_UPDATE, payload: {id: currentNft.id, isLoading: true}
    });

    try {
        await auctioner.end(currentNft.id);
        let endEvent = auctioner.filters.End(currentNft.id, null, null);
        
        auctioner.provider.on(endEvent, async (log, event) => {
            dispatch({
                type: AUCTION_UPDATE, payload: {
                    nftId: currentNft.id,
                    timestamp: 0,
                    isStarted: false,
                    price: 0,
                }
            });

            dispatch({
                type: NFT_UPDATE, payload: {
                    id: currentNft.id, 
                    owner: nextOwner,
                    isLoading: false
                }
            });

            dispatch(setCurrentNft(currentNft.id));
        });
    } 
    catch (e) {
        console.log(e);
        dispatch({
            type: NFT_UPDATE, payload: {id: currentNft.id, isLoading: false}
        });
    }
}

export const withdrawAuction = () => async (dispatch, getState) => {
    const auctioner = getState().contracts.auctioner;
    const currentNft = getState().contracts.currentNft;
    const account = getState().contracts.account;
    
    dispatch({
        type: NFT_UPDATE, payload: {id: currentNft.id, isLoading: true}
    });

    try {
        await auctioner.withdraw(currentNft.id);
        let withdrawEvent = auctioner.filters.Withdraw(currentNft.id, account, null);
        
        auctioner.provider.on(withdrawEvent, async (log, event) => {
            dispatch({
                type: AUCTION_UPDATE, payload: {
                    nftId: currentNft.id,
                    totalBid: 0
                }
            });

            dispatch({
                type: NFT_UPDATE, payload: {id: currentNft.id, isLoading: false}
            });

            dispatch(setCurrentNft(currentNft.id));
        });
    } 
    catch (e) {
        console.log(e);
        dispatch({
            type: NFT_UPDATE, payload: {id: currentNft.id, isLoading: false}
        });
    }
}

export const setCurrentNft = (nftId) => async (dispatch, getState) => {
    const nfts = getState().contracts.nfts;

    if(nftId > 0) {
        dispatch({
            type: CURRENT_NFT_UPDATE, payload: {currentNft: nfts[nftId-1]}
        });
    } 
    else {
        dispatch({
            type: CURRENT_NFT_UPDATE, payload: {currentNft: null}
        });
    }
}