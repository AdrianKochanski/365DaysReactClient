import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension'
import reduxThunk from 'redux-thunk';
import combineReducers from '../reducers/index';
import throttle from 'lodash/throttle';

const loadState = () => {
    try {
      const day365Nfts = localStorage.getItem('day365Nfts');
      if (day365Nfts === null) {
        return undefined;
      }
      return {
        contracts: {
            day365: {},
            auctioner: {},
            account: "",
            currentFee: 0,
            nfts: JSON.parse(day365Nfts),
            contractsConnected: false,
            day365Loading: false,
            auctionLoading: false,
            currentNft: null
        }}
    } catch (err) {
      return undefined;
    }
};

const saveState = (state) => {
    try {
      const serializedState = JSON.stringify(state.contracts.nfts);
      localStorage.setItem('day365Nfts', serializedState);
    } catch {
      // ignore write errors
    }
};

const composedEnhancer = composeWithDevTools(
    applyMiddleware(reduxThunk)
);

const store = createStore(combineReducers, loadState(), composedEnhancer);

const saveSubscribe = () => { 
  return store.subscribe(throttle(() => {
      saveState({
          contracts: store.getState().contracts
      });
  }, 1000));
}

export { store, saveSubscribe };