import React from "../../pkg/react.js";
import Tooltip from "../tooltip.js";
const LowCarbonInfoTooltip = ({position, onClose}) => /* @__PURE__ */ React.createElement(Tooltip, {
  id: "lowcarb-info-tooltip",
  position,
  onClose
}, /* @__PURE__ */ React.createElement("b", null, "Low carbon"), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("small", null, "Includes renewables and nuclear"), /* @__PURE__ */ React.createElement("br", null));
export default LowCarbonInfoTooltip;
