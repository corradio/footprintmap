import React from '../../pkg/react.js';
import { connect } from '../../pkg/react-redux.js';
import { getFullZoneName } from '../../helpers/language.js';
import { formatCo2, formatPower } from '../../helpers/formatting.js';
import { flagUri } from '../../helpers/flags.js';
import { getRatioPercent } from '../../helpers/math.js';
import Tooltip from '../tooltip.js';
import { CarbonIntensity, MetricRatio, ZoneName } from './common.js';
import { getExchangeCo2Intensity, getTotalElectricity } from '../../helpers/zonedata.js';

const mapStateToProps = state => ({
  displayByEmissions: state.application.tableDisplayEmissions,
  electricityMixMode: state.application.electricityMixMode
});

const __ = () => 'X';

const CountryPanelExchangeTooltip = ({
  displayByEmissions,
  electricityMixMode,
  exchangeKey,
  position,
  zoneData,
  onClose
}) => {
  if (!zoneData) return null;
  const co2Intensity = getExchangeCo2Intensity(exchangeKey, zoneData, electricityMixMode);
  const format = displayByEmissions ? formatCo2 : formatPower;
  const exchangeCapacityRange = (zoneData.exchangeCapacities || {})[exchangeKey];
  const exchange = (zoneData.exchange || {})[exchangeKey];
  const isExport = exchange < 0;
  const usage = Math.abs(displayByEmissions ? exchange * 1000 * co2Intensity : exchange);
  const totalElectricity = getTotalElectricity(zoneData, displayByEmissions);
  const totalCapacity = Math.abs((exchangeCapacityRange || [])[isExport ? 0 : 1]);

  let headline = __(isExport ? displayByEmissions ? 'emissionsExportedTo' : 'electricityExportedTo' : displayByEmissions ? 'emissionsImportedFrom' : 'electricityImportedFrom', getRatioPercent(usage, totalElectricity), getFullZoneName(zoneData.countryCode), getFullZoneName(exchangeKey));

  headline = headline.replace('id="country-flag"', `class="flag" src="${flagUri(zoneData.countryCode)}"`);
  headline = headline.replace('id="country-exchange-flag"', `class="flag" src="${flagUri(exchangeKey)}"`);
  return /*#__PURE__*/React.createElement(Tooltip, {
    id: "countrypanel-exchange-tooltip",
    position: position,
    onClose: onClose
  }, /*#__PURE__*/React.createElement("span", {
    dangerouslySetInnerHTML: {
      __html: headline
    }
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(MetricRatio, {
    value: usage,
    total: totalElectricity,
    format: format
  }), !displayByEmissions && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), __('tooltips.utilizing'), " ", /*#__PURE__*/React.createElement("b", null, getRatioPercent(usage, totalCapacity), " %"), " ", __('tooltips.ofinstalled'), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(MetricRatio, {
    value: usage,
    total: totalCapacity,
    format: format
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), __('tooltips.withcarbonintensity'), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("b", null, /*#__PURE__*/React.createElement(ZoneName, {
    zone: isExport ? zoneData.countryCode : exchangeKey
  })), ": ", /*#__PURE__*/React.createElement(CarbonIntensity, {
    intensity: co2Intensity
  })));
};

export default connect(mapStateToProps)(CountryPanelExchangeTooltip);