import {
  CONTRACTS_DATA_INIT,
  AUCTION_UPDATE,
  NFT_UPDATE,
  CONTRACTS_UPDATE,
  SHOW_ALERT,
} from "../actions/types";

const INITIAL_STATE = {
  day365: {},
  auctioner: {},
  account: "",
  currentFee: 0,
  nfts: [],
  contractsConnected: false,
  day365Loading: false,
  auctionLoading: false,
  currentNftId: null,
  switchUpdate: false,
  alertMessage: null,
};

export default (state = INITIAL_STATE, action) => {
  let nftsArr = null;
  let nftIdx = null;

  switch (action.type) {
    case CONTRACTS_DATA_INIT:
      return {
        ...state,
        day365: action.payload.day365,
        auctioner: action.payload.auctioner,
        account: action.payload.account,
        currentFee: action.payload.currentFee,
        contractsConnected: action.payload.contractsConnected,
      };
    case NFT_UPDATE:
      nftsArr = state.nfts;
      nftIdx = action.payload.id - 1;
      nftsArr[nftIdx] = {
        ...nftsArr[nftIdx],
        ...action.payload,
      };

      return {
        ...state,
        nfts: [...nftsArr],
      };
    case AUCTION_UPDATE:
      nftsArr = state.nfts;
      nftIdx = action.payload.nftId - 1;

      let auctionObj = nftsArr[nftIdx].auction;
      auctionObj = {
        ...auctionObj,
        ...action.payload,
      };
      nftsArr[nftIdx].auction = auctionObj;

      return {
        ...state,
        nfts: [...nftsArr],
      };
    case CONTRACTS_UPDATE:
      return {
        ...state,
        ...action.payload,
      };
    case SHOW_ALERT:
      return {
        ...state,
        alertMessage: { ...action.payload },
      };
    default:
      return state;
  }
};
