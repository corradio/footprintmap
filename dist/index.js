import * as __SNOWPACK_ENV__ from './env.js';
import.meta.env = __SNOWPACK_ENV__;

import React from "./pkg/react.js";
import ReactDOM from "./pkg/react-dom.js";
import {Router} from "./pkg/react-router-dom.js";
import {Provider} from "./pkg/react-redux.js";
import moment from "./pkg/moment.js";
import "./pkg/mapbox-gl/dist/mapbox-gl.css.proxy.js";
import "./pkg/url-search-params-polyfill.js";
import thirdPartyServices from "./services/thirdparty.js";
import {history} from "./helpers/router.js";
import {store} from "./store.js";
import Main from "./layout/main.js";
import GlobalStyle from "./globalstyle.js";
import "./scss/styles.css.proxy.js";
if (thirdPartyServices._ga) {
  thirdPartyServices._ga.timingMark("start_executing_js");
}
window.locale = "en";
moment.locale(window.locale.toLowerCase());
ReactDOM.render(/* @__PURE__ */ React.createElement(Provider, {
  store
}, /* @__PURE__ */ React.createElement(Router, {
  history
}, /* @__PURE__ */ React.createElement(GlobalStyle, null), /* @__PURE__ */ React.createElement(Main, null))), document.querySelector("#app"));
if (undefined /* [snowpack] import.meta.hot */ ) {
  undefined /* [snowpack] import.meta.hot */ .accept();
}
