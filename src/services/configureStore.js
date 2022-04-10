import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import reduxThunk from "redux-thunk";
import combineReducers from "../reducers/index";
import throttle from "lodash/throttle";

const loadState = () => {
  try {
    const day365Nfts = localStorage.getItem("day365Nfts");
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
        currentNftId: JSON.parse(localStorage.getItem("currentNftId")),
        switchUpdate: JSON.parse(localStorage.getItem("switchUpdate")),
        alertMessage: null,
      },
    };
  } catch (err) {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    localStorage.setItem("day365Nfts", JSON.stringify(state.contracts.nfts));
    localStorage.setItem(
      "currentNftId",
      JSON.stringify(state.contracts.currentNftId)
    );
    localStorage.setItem(
      "switchUpdate",
      JSON.stringify(state.contracts.switchUpdate)
    );
  } catch {
    // ignore write errors
  }
};

const composedEnhancer = composeWithDevTools(applyMiddleware(reduxThunk));

const store = createStore(combineReducers, loadState(), composedEnhancer);

const saveSubscribe = () => {
  return store.subscribe(
    throttle(() => {
      saveState({
        contracts: store.getState().contracts,
      });
    }, 1000)
  );
};

export { store, saveSubscribe };
