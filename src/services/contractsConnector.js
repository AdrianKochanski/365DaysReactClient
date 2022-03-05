import nftContractJSON from '../abis/Days365.json';
import auctionerContractJSON from '../abis/Auctioner.json';
import { ethers } from 'ethers';
import axios from 'axios';
import { updateAuction } from '../services/helpers';

const checkMintingFee = async (contract, setFee) => {
    if(contract) {
        let fee = await contract.currentFee();
        fee = ethers.utils.formatEther(fee);
        setFee(fee);
    }
};

const getNFTs = async (contract, nfts, setNfts, auctioner, auctions, setAuctions, account) => {
    if(contract) {
        let tokensCount = await contract.tokensCount();

        for(let i=0 ; i<tokensCount; i++) {
            const tokenUri = await contract.tokenURI(i+1);
            const owner = await contract.ownerOf(i+1);
            
            nfts.push({
                id: i+1,
                uri: tokenUri,
                name: "",
                description: "",
                image: "",
                location: "",
                temperature: 0,
                owner: owner.toLowerCase()
            });

            let file;

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
                nfts[i].name = file.data.name;
                nfts[i].description = file.data.description;
                nfts[i].image = file.data.image;
                nfts[i].location = file.data.attributes.filter(a => a.trait_type === "location")[0].value;
                nfts[i].temperature = file.data.attributes.filter(a => a.trait_type === "temperature")[0].value;
            }

            await updateAuction(i+1, auctioner, auctions, setAuctions, account);
            
            setNfts([...nfts]);
        }
    }
};

const getNftContract = (ethereum) => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS, nftContractJSON.abi, signer);
}

const getAuctionerContract = (ethereum) => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(process.env.REACT_APP_AUCTIONER_ADDRESS, auctionerContractJSON.abi, signer);
}

const connect = async ({userConnect, setAccount, setNftContract, setCurrentFee, 
    nfts, setNfts, auctions, setAuctions, setAuctioner}) => {
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
          setAccount(accounts[0]);
          const contract = getNftContract(ethereum);
          setNftContract(contract);
          // set Auctioner
          const auctioner = getAuctionerContract(ethereum);
          setAuctioner(auctioner);

          await checkMintingFee(contract, setCurrentFee);
          await getNFTs(contract, nfts, setNfts, auctioner, auctions, setAuctions, accounts[0]);
        }
        else {
          console.log("Did not found account to connect");
        }
    } catch(err)
    {
        console.log(err);
    }
};

export default connect;