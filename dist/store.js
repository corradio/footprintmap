import {createStore, applyMiddleware} from "./pkg/redux.js";
import {logger} from "./pkg/redux-logger.js";
import reducer from "./reducers/index.js";
import {isProduction} from "./helpers/environment.js";
export const store = isProduction() ? createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()) : createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), applyMiddleware(logger));
export const dispatchApplication = (key, value) => {
  store.dispatch({type: "APPLICATION_STATE_UPDATE", key, value});
};
