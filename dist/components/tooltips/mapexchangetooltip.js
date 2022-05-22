import React from '../../pkg/react.js';
import Tooltip from '../tooltip.js';
import { CarbonIntensity, ZoneName } from './common.js';

const MapExchangeTooltip = ({
  exchangeData,
  position,
  onClose
}) => {
  if (!exchangeData) return null;
  const isExporting = exchangeData.netFlow > 0;
  const netFlow = Math.abs(Math.round(exchangeData.netFlow));
  const zoneFrom = exchangeData.countryCodes[isExporting ? 0 : 1];
  const zoneTo = exchangeData.countryCodes[isExporting ? 1 : 0];
  return /*#__PURE__*/React.createElement(Tooltip, {
    id: "exchange-tooltip",
    position: position,
    onClose: onClose
  }, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(ZoneName, {
    zone: zoneFrom
  }), " \u2192 ", /*#__PURE__*/React.createElement(ZoneName, {
    zone: zoneTo
  }), ": ", /*#__PURE__*/React.createElement("b", null, netFlow), " MW", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(CarbonIntensity, {
    intensity: exchangeData.co2intensity
  }));
};

export default MapExchangeTooltip;