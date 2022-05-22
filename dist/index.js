import * as __SNOWPACK_ENV__ from './env.js';
import.meta.env = __SNOWPACK_ENV__;

import React from './pkg/react.js';
import ReactDOM from './pkg/react-dom.js';
import { Router } from './pkg/react-router-dom.js';
import { Provider } from './pkg/react-redux.js';
import moment from './pkg/moment.js';
import './pkg/mapbox-gl/dist/mapbox-gl.css.proxy.js'; // Required for map zooming buttons

import './pkg/url-search-params-polyfill.js'; // For IE 11 support

import thirdPartyServices from './services/thirdparty.js';
import { history } from './helpers/router.js';
import { store, sagaMiddleware } from './store.js';
import { cordovaApp } from './cordova.js';
import sagas from './sagas/index.js';
import Main from './layout/main.js';
import GlobalStyle from './globalstyle.js'; // init styling

import './scss/styles.css.proxy.js'; // Track how long it took to start executing the JS code

if (thirdPartyServices._ga) {
  thirdPartyServices._ga.timingMark('start_executing_js');
} // Set proper locale


window.locale = 'en';
moment.locale(window.locale.toLowerCase()); // Plug in the sagas

sagaMiddleware.run(sagas); // Render DOM

ReactDOM.render( /*#__PURE__*/React.createElement(Provider, {
  store: store
}, /*#__PURE__*/React.createElement(Router, {
  history: history
}, /*#__PURE__*/React.createElement(GlobalStyle, null), /*#__PURE__*/React.createElement(Main, null))), document.querySelector('#app')); // Initialise mobile app (cordova)

if (window.isCordova) {
  cordovaApp.initialize();
} // HMR


if (undefined /* [snowpack] import.meta.hot */ ) {
  undefined /* [snowpack] import.meta.hot */ .accept();
}