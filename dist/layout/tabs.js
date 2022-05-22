import React from '../pkg/react.js';
import { NavLink, useLocation } from '../pkg/react-router-dom.js';
import { useSelector } from '../pkg/react-redux.js';
export default (() => {
  const location = useLocation();
  const canRenderMap = useSelector(state => state.application.webGLSupported);
  return /*#__PURE__*/React.createElement("div", {
    id: "tab"
  }, /*#__PURE__*/React.createElement("div", {
    id: "tab-content"
  }, canRenderMap && /*#__PURE__*/React.createElement(NavLink, {
    className: "list-item",
    to: {
      pathname: '/map',
      search: location.search
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "material-icons",
    "aria-hidden": "true"
  }, "map"), /*#__PURE__*/React.createElement("span", {
    className: "tab-label"
  }, "Map")), /*#__PURE__*/React.createElement(NavLink, {
    className: "list-item",
    to: {
      pathname: '/ranking',
      search: location.search
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "material-icons",
    "aria-hidden": "true"
  }, "view_list"), /*#__PURE__*/React.createElement("span", {
    className: "tab-label"
  }, "Areas")), /*#__PURE__*/React.createElement(NavLink, {
    className: "list-item",
    to: {
      pathname: '/info',
      search: location.search
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "material-icons",
    "aria-hidden": "true"
  }, "info"), /*#__PURE__*/React.createElement("span", {
    className: "tab-label"
  }, "About"))));
});