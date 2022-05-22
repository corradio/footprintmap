import React from "../../pkg/react.js";
import {connect} from "../../pkg/react-redux.js";
import {useCo2ColorScale} from "../../hooks/theme.js";
import {useCarbonIntensityDomain} from "../../hooks/redux.js";
import {getZoneCarbonIntensity, getRenewableRatio, getLowcarbonRatio} from "../../helpers/zonedata.js";
import {formatCarbonIntensityUnit, formatCarbonIntensityDescription} from "../../helpers/formatting.js";
import CircularGauge from "../circulargauge.js";
import Tooltip from "../tooltip.js";
import {ZoneName} from "./common.js";
const mapStateToProps = (state) => ({
  electricityMixMode: state.application.electricityMixMode
});
const MapCountryTooltip = ({electricityMixMode, position, zoneData, onClose}) => {
  const co2ColorScale = useCo2ColorScale();
  const carbonIntensityDomain = useCarbonIntensityDomain();
  if (!zoneData) {
    return null;
  }
  const co2intensity = getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, zoneData);
  const lowCarbonRatio = getLowcarbonRatio(electricityMixMode, zoneData);
  const lowCarbonPercentage = lowCarbonRatio !== null ? Math.round(100 * lowCarbonRatio) : "?";
  const renewableRatio = getRenewableRatio(electricityMixMode, zoneData);
  const renewablePercentage = renewableRatio !== null ? Math.round(100 * renewableRatio) : "?";
  return /* @__PURE__ */ React.createElement(Tooltip, {
    id: "country-tooltip",
    position,
    onClose
  }, /* @__PURE__ */ React.createElement("div", {
    className: "zone-name-header"
  }, /* @__PURE__ */ React.createElement(ZoneName, {
    zone: zoneData.countryCode
  })), co2intensity ? /* @__PURE__ */ React.createElement("div", {
    className: "zone-details"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "country-table-header-inner"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "country-col country-emission-intensity-wrap"
  }, /* @__PURE__ */ React.createElement("div", {
    id: "country-emission-rect",
    className: "country-col-box emission-rect emission-rect-overview",
    style: {backgroundColor: co2ColorScale(co2intensity)}
  }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", {
    className: "country-emission-intensity"
  }, co2intensity != null ? Math.round(co2intensity) : "?"), /* @__PURE__ */ React.createElement("div", {
    className: "country-col-subtext"
  }, formatCarbonIntensityUnit(carbonIntensityDomain)))), /* @__PURE__ */ React.createElement("div", {
    className: "country-col-headline"
  }, formatCarbonIntensityDescription(carbonIntensityDomain, electricityMixMode))), /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    className: "country-col country-lowcarbon-wrap"
  }, /* @__PURE__ */ React.createElement("div", {
    id: "tooltip-country-lowcarbon-gauge",
    className: "country-gauge-wrap"
  }, /* @__PURE__ */ React.createElement(CircularGauge, {
    percentage: lowCarbonPercentage
  })), /* @__PURE__ */ React.createElement("div", {
    className: "country-col-headline"
  }, "Low-carbon"), /* @__PURE__ */ React.createElement("div", {
    className: "country-col-subtext"
  })), /* @__PURE__ */ React.createElement("div", {
    className: "country-col country-renewable-wrap"
  }, /* @__PURE__ */ React.createElement("div", {
    id: "tooltip-country-renewable-gauge",
    className: "country-gauge-wrap"
  }, /* @__PURE__ */ React.createElement(CircularGauge, {
    percentage: renewablePercentage
  })), /* @__PURE__ */ React.createElement("div", {
    className: "country-col-headline"
  }, "Renewable"))))) : /* @__PURE__ */ React.createElement("div", {
    className: "temporary-outage-text"
  }, "No data available"));
};
export default connect(mapStateToProps)(MapCountryTooltip);
