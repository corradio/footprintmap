import React from "../pkg/react.js";
import {connect} from "../pkg/react-redux.js";
const mapStateToProps = (state) => ({
  brightModeEnabled: state.application.brightModeEnabled
});
export default connect(mapStateToProps)((props) => /* @__PURE__ */ React.createElement("div", {
  id: "header"
}, /* @__PURE__ */ React.createElement("div", {
  id: "header-content",
  className: props.brightModeEnabled ? "brightmode" : null
}, /* @__PURE__ */ React.createElement("div", {
  className: "logo"
}, /* @__PURE__ */ React.createElement("span", {
  className: "maintitle small-screen-hidden"
}, "CO₂", " ", /* @__PURE__ */ React.createElement("span", {
  className: "live",
  style: {fontWeight: "bold"}
}, "footprintMap"))))));
