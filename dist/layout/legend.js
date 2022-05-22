import React from "../pkg/react.js";
import {connect} from "../pkg/react-redux.js";
import {dispatchApplication} from "../store.js";
import {formatCarbonIntensityUnit} from "../helpers/formatting.js";
import HorizontalColorbar from "../components/horizontalcolorbar.js";
import {useCo2ColorScale} from "../hooks/theme.js";
import {useCarbonIntensityDomain} from "../hooks/redux.js";
const mapStateToProps = (state) => ({
  co2ColorbarValue: state.application.co2ColorbarValue,
  legendVisible: state.application.legendVisible,
  solarColorbarValue: state.application.solarColorbarValue,
  windColorbarValue: state.application.windColorbarValue
});
const Legend = ({co2ColorbarValue, legendVisible}) => {
  const co2ColorScale = useCo2ColorScale();
  const carbonIntensityDomain = useCarbonIntensityDomain();
  const mobileCollapsedClass = !legendVisible ? "mobile-collapsed" : "";
  const toggleLegend = () => {
    dispatchApplication("legendVisible", !legendVisible);
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: `floating-legend-container ${mobileCollapsedClass}`
  }, /* @__PURE__ */ React.createElement("div", {
    className: "floating-legend-mobile-header"
  }, /* @__PURE__ */ React.createElement("span", null, "Legend"), /* @__PURE__ */ React.createElement("i", {
    className: "material-icons toggle-legend-button",
    onClick: toggleLegend
  }, legendVisible ? "call_received" : "call_made")), legendVisible && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    className: `co2-legend floating-legend ${mobileCollapsedClass}`
  }, /* @__PURE__ */ React.createElement("div", {
    className: "legend-header"
  }, "Carbon intensity ", /* @__PURE__ */ React.createElement("small", null, `(${formatCarbonIntensityUnit(carbonIntensityDomain)})`)), /* @__PURE__ */ React.createElement(HorizontalColorbar, {
    id: "carbon-intensity-bar",
    colorScale: co2ColorScale,
    currentValue: co2ColorbarValue,
    markerColor: "white",
    ticksCount: 5
  }))));
};
export default connect(mapStateToProps)(Legend);
