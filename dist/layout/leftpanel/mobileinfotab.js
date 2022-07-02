import React from "../../pkg/react.js";
import {Redirect, useLocation} from "../../pkg/react-router-dom.js";
import {useIsMediumUpScreen} from "../../hooks/viewport.js";
import ColorBlindCheckbox from "../../components/colorblindcheckbox.js";
const MobileInfoTab = () => {
  const isMediumUpScreen = useIsMediumUpScreen();
  const location = useLocation();
  if (isMediumUpScreen) {
    return /* @__PURE__ */ React.createElement(Redirect, {
      to: {pathname: "/map", search: location.search}
    });
  }
  return /* @__PURE__ */ React.createElement("div", {
    className: "mobile-info-tab"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "info-text"
  }, /* @__PURE__ */ React.createElement(ColorBlindCheckbox, null), /* @__PURE__ */ React.createElement("p", null, "This project is", " ", /* @__PURE__ */ React.createElement("a", {
    href: "https://github.com/corradio/footprintmap",
    target: "_blank"
  }, "Open Source"), " ", "(See", " ", /* @__PURE__ */ React.createElement("a", {
    href: "https://github.com/corradio/footprintmap#data-sources",
    target: "_blank"
  }, "data sources"), ")."), /* @__PURE__ */ React.createElement("p", null, "Found bugs or have ideas? Report them", " ", /* @__PURE__ */ React.createElement("a", {
    href: "https://github.com/corradio/footprintmap/issues/new",
    target: "_blank"
  }, "here"), ".", /* @__PURE__ */ React.createElement("br", null))));
};
export default MobileInfoTab;
