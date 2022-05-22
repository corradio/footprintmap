import React from "../../pkg/react.js";
import Tooltip from "../tooltip.js";
const CountryPanelEmissionsTooltip = ({position, data, unit, onClose}) => {
  if (!data) {
    return null;
  }
  const value = Math.round(data.emissions);
  return /* @__PURE__ */ React.createElement(Tooltip, {
    id: "countrypanel-emissions-tooltip",
    position,
    onClose
  }, data.meta.year, ": ", /* @__PURE__ */ React.createElement("b", null, value), " ", unit);
};
export default CountryPanelEmissionsTooltip;
