import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import moment from 'moment';

import 'mapbox-gl/dist/mapbox-gl.css'; // Required for map zooming buttons
import 'url-search-params-polyfill'; // For IE 11 support

import thirdPartyServices from './services/thirdparty';
import { history } from './helpers/router';
import { store } from './store';

import Main from './layout/main';
import GlobalStyle from './globalstyle';

// init styling
import './scss/styles.scss';

// Track how long it took to start executing the JS code
// eslint-disable-next-line no-underscore-dangle
if (thirdPartyServices._ga) {
  // eslint-disable-next-line no-underscore-dangle
  thirdPartyServices._ga.timingMark('start_executing_js');
}

// Set proper locale
window.locale = 'en';
moment.locale(window.locale.toLowerCase());

// Render DOM
ReactDOM.render(
  <Provider store={store}>
    {/* TODO: Switch to BrowserRouter once we don't need to manipulate */}
    {/* the route history outside of React components anymore */}
    <Router history={history}>
      <GlobalStyle />
      <Main />
    </Router>
  </Provider>,
  document.querySelector('#app')
);

// HMR
// if (import.meta.hot) {
//   import.meta.hot.accept();
// }
