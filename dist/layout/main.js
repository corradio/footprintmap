import React from "../pkg/react.js";
import {connect, useSelector} from "../pkg/react-redux.js";
import {useLocation} from "../pkg/react-router-dom.js";
import Header from "./header.js";
import LayerButtons from "./layerbuttons.js";
import LeftPanel from "./leftpanel/index.js";
import Legend from "./legend.js";
import Tabs from "./tabs.js";
import Map from "./map.js";
import {useLoadingOverlayVisible, useCarbonIntensityDomain, useCurrentZoneData} from "../hooks/redux.js";
import {dispatchApplication} from "../store.js";
import OnboardingModal from "../components/onboardingmodal.js";
import LoadingOverlay from "../components/loadingoverlay.js";
import Toggle from "../components/toggle.js";
import {CARBON_INTENSITY_DOMAIN} from "../helpers/constants.js";
const mapStateToProps = (state) => ({
  brightModeEnabled: state.application.brightModeEnabled,
  hasConnectionWarning: state.data.hasConnectionWarning,
  electricityMixMode: state.application.electricityMixMode,
  version: state.application.version
});
const Main = ({brightModeEnabled, electricityMixMode}) => {
  const location = useLocation();
  const showLoadingOverlay = useLoadingOverlayVisible();
  const carbonIntensityDomain = useCarbonIntensityDomain();
  const data = useCurrentZoneData();
  const currentGridData = useSelector((state) => state.data.grid.datetime);
  const currentYear = data ? data.year : currentGridData;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    style: {
      position: "fixed",
      width: "100vw",
      height: "inherit",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch"
    }
  }, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement("div", {
    id: "inner"
  }, /* @__PURE__ */ React.createElement(LoadingOverlay, {
    visible: showLoadingOverlay
  }), /* @__PURE__ */ React.createElement(LeftPanel, null), /* @__PURE__ */ React.createElement("div", {
    id: "map-container",
    className: location.pathname !== "/map" ? "small-screen-hidden" : ""
  }, /* @__PURE__ */ React.createElement(Map, null), /* @__PURE__ */ React.createElement(Legend, null), /* @__PURE__ */ React.createElement("div", {
    className: "controls-container"
  }, /* @__PURE__ */ React.createElement(Toggle, {
    onChange: (value) => dispatchApplication("carbonIntensityDomain", value),
    options: [
      {value: CARBON_INTENSITY_DOMAIN.POPULATION, label: "per capita"},
      {value: CARBON_INTENSITY_DOMAIN.GDP, label: "per gdp"},
      {value: CARBON_INTENSITY_DOMAIN.ENERGY, label: "per energy"}
    ],
    value: carbonIntensityDomain,
    style: {marginBottom: ".5em"}
  }), /* @__PURE__ */ React.createElement(Toggle, {
    onChange: (value) => dispatchApplication("electricityMixMode", value),
    options: [
      {value: "production", label: "territorial"},
      {value: "consumption", label: "with imports"}
    ],
    value: electricityMixMode
  })), /* @__PURE__ */ React.createElement(LayerButtons, null), /* @__PURE__ */ React.createElement("div", {
    className: "text-title",
    style: {color: brightModeEnabled ? "#000" : "#fff"}
  }, currentYear))), /* @__PURE__ */ React.createElement(Tabs, null)), /* @__PURE__ */ React.createElement(OnboardingModal, null));
};
export default connect(mapStateToProps)(Main);
