import nftContractJSON from '../abis/Days365.json';
import auctionerContractJSON from '../abis/Auctioner.json';
import { ethers } from 'ethers';
import axios from 'axios';
import { getBuffer, getBufferFromJson, getIpfsLink, getDefaultNft, getMetadata } from '../services/helpers';
import ipfs from '../services/ipfs';

import { CONTRACTS_DATA_INIT, CONTRACTS_UPDATE, AUCTION_UPDATE, NFT_UPDATE, SHOW_ALERT } from './types';

export const contractsInit = (userConnect) => async dispatch => {
    const { ethereum } = window;

    if(!ethereum){
      dispatch(setAlert("warning", "Make sure you have Metamask installed!"));
      return;
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
            dispatch(setAlert("info", "Connecting authorized account: "  + accounts[0]));
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
          dispatch(setAlert("warning", "Connecting to wallet failed!"));
        }
    } catch(err)
    {
        console.log(err);
        dispatch(setAlert("danger", "Connecting to wallet failed!"));
    }
}

export const setAlert = (variant, message) => async (dispatch, getState) => {
    dispatch({
        type: SHOW_ALERT, payload: {variant, message}
    });
}

const nftsDataInit = () => async (dispatch, getState) => {
    const contract = getState().contracts.day365;
    let tokensCount = await contract.tokensCount();

    for(let i=0 ; i<tokensCount; i++) {
        dispatch(nftInit(i+1));
    }
}

export const nftInit = (nftId) => async (dispatch, getState) => {
    let data = {};
    const nftsInitial = getState().contracts.nfts;
    const switchUpdate = getState().contracts.switchUpdate;

    if(switchUpdate || !nftsInitial[nftId-1])
    {
        let file;
        const contract = getState().contracts.day365;
        const tokenUri = await contract.tokenURI(nftId);
        const owner = await contract.ownerOf(nftId);
        
        data = getDefaultNft(nftId);
        data.uri = tokenUri;
        data.owner = owner.toLowerCase();
    
        try {
            file = await axios({
                url: tokenUri,
                method: 'GET',
                responseType: 'json'
            });
        }
        catch(err) {
            console.log(err);
            dispatch(setAlert("danger", `Nft data fetch failed for nftId: ${nftId}`));
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
    }
    else {
        dispatch({
            type: NFT_UPDATE,
            payload: {
                id: nftId, wasInit: !switchUpdate
            }
        });
    }

    dispatch(auctionInit(nftId, false));
}

const auctionInit = (nftId, isUpdate) => async (dispatch, getState) => {
    const nftState = getState().contracts.nfts[nftId-1];
    const account = getState().contracts.account;
    const switchUpdate = getState().contracts.switchUpdate;

    if(isUpdate || switchUpdate || !nftState.auction.wasInit) {
        const auctioner = getState().contracts.auctioner;
    
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
            totalBid: ethers.utils.formatEther(bid),
            wasInit: true
        };
    
        dispatch({
            type: AUCTION_UPDATE,
            payload: formatAuction
        });

        dispatch({
            type: NFT_UPDATE,
            payload: {
                id: nftId,
                wasInit: true
            }
        });
    }    
    else if ((account.toLowerCase() === nftState.auction.owner && !nftState.auction.isOwner) || 
        (account.toLowerCase() === nftState.auction.winner && !nftState.auction.isWinner)) {
        dispatch({
            type: AUCTION_UPDATE,
            payload: {
                nftId: nftId,
                isOwner: nftState.auction.owner === account.toLowerCase(),
                isWinner: nftState.auction.winner === account.toLowerCase()
            }
        });
    }
}

export const mintNft = (file, description, temperature, location, callback) => async (dispatch, getState) => {
    const contract = getState().contracts.day365;
    const account = getState().contracts.account;
    const currentFee = getState().contracts.currentFee.toString();

    try {
        dispatch({
            type: CONTRACTS_UPDATE, payload: {day365Loading: true}
        });

        const d = new Date();
        const name = d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear();
        let image;
        let id;

        if(file) {
            const imgBuffer =  await getBuffer(file);
            const imgResponse = await ipfs.files.add(imgBuffer);
            image = getIpfsLink(imgResponse[0].hash, file.name);
        } 

        const metadata = getMetadata(name, description, image, location, temperature);
        const jsonBuffer = await getBufferFromJson(metadata);
        const metadataResp = await ipfs.files.add(jsonBuffer);
        const metadataHash = metadataResp[0].hash;
        const uri = getIpfsLink(metadataHash, metadata.name);

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
                type: AUCTION_UPDATE, 
                payload: {
                    nftId: id,
                    owner: ethers.constants.AddressZero,
                    timestamp: 0,
                    price: 0,
                    winner: ethers.constants.AddressZero,
                    isWinner: false,
                    isStarted: false,
                    isEnded: false,
                    isOwner: false,
                    totalBid: 0
                }
            });

            dispatch({
                type: CONTRACTS_UPDATE, payload: {day365Loading: false}
            });

            dispatch(setCurrentNft(id));
            
            if(callback) {
                callback(id);
            }

            dispatch(setAlert("success", "Minting succeed!"));
        });

        await contract.mintToken(uri, {value: ethers.utils.parseEther(currentFee)});
      } 
      catch(e) {
        console.log(e);
        dispatch({
            type: CONTRACTS_UPDATE, payload: {day365Loading: false}
        });
        dispatch(setAlert("danger", "Miniting failed!"));
      }
}

export const updateNftUri = (nftId, file, description, temperature, location, callback) => async (dispatch, getState) => {
    const currentNftId = Number.parseInt(nftId);
    const contract = getState().contracts.day365;
    const currentNft = getState().contracts.nfts[currentNftId-1];

    try {
        dispatch({
            type: CONTRACTS_UPDATE, payload: {day365Loading: true}
        });

        let image = currentNft.image;
        let name = currentNft.name;

        if(file) {
            const imgBuffer =  await getBuffer(file);
            const imgResponse = await ipfs.files.add(imgBuffer);
            image = getIpfsLink(imgResponse[0].hash, file.name);
        }

        const metadata = getMetadata(name, description, image, location, temperature);
        const jsonBuffer = await getBufferFromJson(metadata);
        const metadataResp = await ipfs.files.add(jsonBuffer);
        const metadataHash = metadataResp[0].hash;
        const uri = getIpfsLink(metadataHash, metadata.name);
        const eventFilter = contract.filters.UriChange(currentNftId, null);

        contract.provider.on(eventFilter, (log, event) => {
            dispatch({
                type: NFT_UPDATE, 
                payload: {
                    id: currentNftId, uri, name, description, location, temperature, image
                }
            });

            dispatch({
                type: CONTRACTS_UPDATE, payload: {day365Loading: false}
            });
            
            if(callback) {
                callback(currentNftId);
            }

            dispatch(setAlert("success", "Update URI succeed!"));
        });

        await contract.setTokenURI(currentNftId, uri);
      } 
      catch (e) {
        console.log(e);
        dispatch({
            type: CONTRACTS_UPDATE, payload: {day365Loading: false}
        });
        dispatch(setAlert("danger", `Updating URI failed for nftId: ${nftId}`));
      }
}

export const startAuction = (nftId, startPrice, daysEnd, callback) => async (dispatch, getState) => {
    const currentNftId = Number.parseInt(nftId);
    const contract = getState().contracts.day365;
    const auctioner = getState().contracts.auctioner;
    const account = getState().contracts.account;

    try {
        dispatch({
            type: CONTRACTS_UPDATE, payload: {auctionLoading: true}
        });

        let approvalEvent = contract.filters.Approval(account, auctioner.address, currentNftId);
        let auctionStartEvent = auctioner.filters.Start(currentNftId, null, null);
        
        contract.provider.on(approvalEvent, async (log, event) => {
            await auctioner.start(currentNftId, ethers.utils.parseEther(startPrice), daysEnd);
        });

        auctioner.provider.on(auctionStartEvent, async (log, event) => {
            dispatch(auctionInit(currentNftId, true));

            dispatch({
                type: NFT_UPDATE, payload: {
                    id: currentNftId,
                    owner: process.env.REACT_APP_AUCTIONER_ADDRESS.toLowerCase()
                }
            });

            dispatch({
                type: CONTRACTS_UPDATE, payload: {auctionLoading: false}
            });

            if(callback) {
                callback();
            }

            dispatch(setAlert("success", "Start auction succeed!"));
        });

        await contract.approve(auctioner.address, currentNftId);
    } 
    catch (e) {
        console.log(e);
        dispatch({
            type: CONTRACTS_UPDATE, payload: {auctionLoading: false}
        });
        dispatch(setAlert("danger", `Start auction failed for nftId: ${nftId}`));
    }
}

export const cancelAuction = (nftId) => async (dispatch, getState) => {
    const currentNftId = Number.parseInt(nftId);
    const auctioner = getState().contracts.auctioner;
    const account = getState().contracts.account;

    try {
        dispatch({
            type: NFT_UPDATE, payload: {id: currentNftId, isLoading: true}
        });

        let cancelEvent = auctioner.filters.Cancel(currentNftId, null);
        
        auctioner.provider.on(cancelEvent, async (log, event) => {
            dispatch({
                type: AUCTION_UPDATE, payload: {
                    nftId: currentNftId, 
                    timestamp: 0,
                    isStarted: false,
                    price: 0
                }
            });

            dispatch({
                type: NFT_UPDATE, payload: {
                    id: currentNftId, 
                    owner: account, 
                    isLoading: false
                }
            });

            dispatch(setAlert("success", "Cancel auction succeed!"));
        });

        await auctioner.cancel(currentNftId);
    } 
    catch (e) {
        console.log(e);
        dispatch({
            type: NFT_UPDATE, payload: {id: currentNftId, isLoading: false}
        });
        dispatch(setAlert("danger", `Cancel auction failed for nftId: ${nftId}`));
    }
}

export const bidAuction = (nftId, price, callback) => async (dispatch, getState) => {
    const currentNftId = Number.parseInt(nftId);
    const auctioner = getState().contracts.auctioner;
    const account = getState().contracts.account;
    const auction = getState().contracts.nfts[currentNftId-1].auction;
    let nextPrice = Number.parseFloat(price);

    try {
        if(auction.winner === account) {
            nextPrice = Number.parseFloat(auction.price) + nextPrice;
        }
        
        dispatch({
            type: NFT_UPDATE, payload: {id: currentNftId, isLoading: true}
        });

        let bidEvent = auctioner.filters.Bid(currentNftId, account, null);
        
        auctioner.provider.on(bidEvent, async (log, event) => {
            dispatch({
                type: AUCTION_UPDATE, payload: {
                    nftId: currentNftId,
                    price: nextPrice,
                    winner: account,
                    isWinner: true,
                    totalBid: nextPrice
                }
            });

            dispatch({
                type: NFT_UPDATE, payload: {id: currentNftId, isLoading: false}
            });

            if(callback) {
                callback();
            }

            dispatch(setAlert("success", "Bid auction succeed!"));
        });

        await auctioner.bid(currentNftId, {value: ethers.utils.parseEther(price)});
    } 
    catch (e) {
        console.log(e);
        dispatch({
            type: NFT_UPDATE, payload: {id: currentNftId, isLoading: false}
        });
        dispatch(setAlert("danger", `Bid auction failed for nftId: ${nftId}`));
    }
}

export const endAuction = (nftId) => async (dispatch, getState) => {
    const currentNftId = Number.parseInt(nftId);
    const auctioner = getState().contracts.auctioner;
    const account = getState().contracts.account;
    const auction = getState().contracts.nfts[currentNftId-1].auction;
    let nextOwner = account;

    try {
        if(auction.winner !== ethers.constants.AddressZero) {
            nextOwner = auction.winner;
        }
        
        dispatch({
            type: NFT_UPDATE, payload: {id: currentNftId, isLoading: true}
        });

        let endEvent = auctioner.filters.End(currentNftId, null, null);
        
        auctioner.provider.on(endEvent, async (log, event) => {
            dispatch({
                type: AUCTION_UPDATE, payload: {
                    nftId: currentNftId,
                    timestamp: 0,
                    isStarted: false,
                    price: 0,
                }
            });

            dispatch({
                type: NFT_UPDATE, payload: {
                    id: currentNftId, 
                    owner: nextOwner,
                    isLoading: false
                }
            });

            dispatch(setAlert("success", "End auction succeed!"));
        });

        await auctioner.end(currentNftId);
    } 
    catch (e) {
        console.log(e);
        dispatch({
            type: NFT_UPDATE, payload: {id: currentNftId, isLoading: false}
        });
        dispatch(setAlert("danger", `End auction failed for nftId: ${nftId}`));
    }
}

export const withdrawAuction = (nftId) => async (dispatch, getState) => {
    const currentNftId = Number.parseInt(nftId);
    const auctioner = getState().contracts.auctioner;
    const account = getState().contracts.account;

    try {
        dispatch({
            type: NFT_UPDATE, payload: {id: currentNftId, isLoading: true}
        });

        let withdrawEvent = auctioner.filters.Withdraw(currentNftId, account, null);
        
        auctioner.provider.on(withdrawEvent, async (log, event) => {
            dispatch({
                type: AUCTION_UPDATE, payload: {
                    nftId: currentNftId,
                    totalBid: 0
                }
            });

            dispatch({
                type: NFT_UPDATE, payload: {id: currentNftId, isLoading: false}
            });

            dispatch(setAlert("success", "Withdraw succeed!"));
        });

        await auctioner.withdraw(currentNftId);
    } 
    catch (e) {
        console.log(e);
        dispatch({
            type: NFT_UPDATE, payload: {id: currentNftId, isLoading: false}
        });
        dispatch(setAlert("danger", `Withdraw failed for nftId: ${nftId}`));
    }
}

export const setCurrentNft = (nftId) => async (dispatch, getState) => {
    const currentNftId = getState().contracts.currentNftId;
    const switchUpdate = getState().contracts.switchUpdate;

    if(nftId > 0) {
        dispatch({
            type: CONTRACTS_UPDATE, payload: {currentNftId: Number.parseInt(nftId)}
        });
    } 
    else {
        dispatch({
            type: NFT_UPDATE,
            payload: {
                id: currentNftId, wasInit: !switchUpdate
            }
        });

        dispatch({
            type: CONTRACTS_UPDATE, payload: {currentNftId: null}
        });
    }
}

export const switchUpdateChange = (value) => async (dispatch, getState) => {
    const nfts = getState().contracts.nfts;
    const currentNftId = getState().contracts.currentNftId;

    dispatch({
        type: CONTRACTS_UPDATE, payload: {switchUpdate: !!value}
    });

    for (let nftId = 1; nftId <= nfts.length; nftId++) {
        if(currentNftId == nftId) {
            continue;
        }

        dispatch({
            type: NFT_UPDATE,
            payload: {
                id: nftId, wasInit: !value
            }
        });
    }
}

