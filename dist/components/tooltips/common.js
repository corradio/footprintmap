import React from "../../pkg/react.js";
import {isFinite} from "../../pkg/lodash.js";
import {getFullZoneName} from "../../helpers/language.js";
import {useCo2ColorScale} from "../../hooks/theme.js";
import {flagUri} from "../../helpers/flags.js";
export const CarbonIntensity = ({intensity}) => {
  const co2ColorScale = useCo2ColorScale();
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    className: "emission-rect",
    style: {backgroundColor: co2ColorScale(intensity)}
  }), " ", /* @__PURE__ */ React.createElement("b", null, Math.round(intensity) || "?"), " gCO₂eq/kWh");
};
export const MetricRatio = ({value, total, format}) => /* @__PURE__ */ React.createElement("small", null, `(${isFinite(value) ? format(value) : "?"} / ${isFinite(total) ? format(total) : "?"})`);
export const ZoneName = ({zone}) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("img", {
  className: "flag",
  alt: "",
  src: flagUri(zone)
}), " ", getFullZoneName(zone));
