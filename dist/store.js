import * as __SNOWPACK_ENV__ from './env.js';

import createSagaMiddleware from './pkg/redux-saga.js';
import { createStore, applyMiddleware } from './pkg/redux.js';
import { logger } from './pkg/redux-logger.js';
import reducer from './reducers/index.js';
export const sagaMiddleware = createSagaMiddleware();
export const store = __SNOWPACK_ENV__.NODE_ENV === 'production' ? createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), applyMiddleware(sagaMiddleware)) : createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), applyMiddleware(sagaMiddleware), applyMiddleware(logger)); // TODO: Deprecate and use actioncreators instead

export const dispatchApplication = (key, value) => {
  store.dispatch({
    type: 'APPLICATION_STATE_UPDATE',
    key,
    value
  });
};