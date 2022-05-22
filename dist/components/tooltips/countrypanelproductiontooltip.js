import React from "../../pkg/react.js";
import {connect} from "../../pkg/react-redux.js";
import {isFinite} from "../../pkg/lodash.js";
import {vsprintf} from "../../pkg/sprintf-js.js";
import {formatCo2, formatPower} from "../../helpers/formatting.js";
import {flagUri} from "../../helpers/flags.js";
import {getRatioPercent} from "../../helpers/math.js";
import {getFullZoneName} from "../../helpers/language.js";
import Tooltip from "../tooltip.js";
import {CarbonIntensity, MetricRatio} from "./common.js";
import {getElectricityProductionValue, getProductionCo2Intensity, getTotalElectricity} from "../../helpers/zonedata.js";
const mapStateToProps = (state) => ({
  displayByEmissions: state.application.tableDisplayEmissions
});
const localeConfig = {
  electricityComesFrom: '<b>%1$s %%</b> of energy %2$s in <img id="country-flag"></img> <b>%3$s</b> comes from %4$s',
  electricityExportedTo: '<b>%1$s %%</b> of energy %2$s in <img id="country-flag"></img> <b>%3$s</b> is exported to <img id="country-exchange-flag"></img> <b>%4$s</b>',
  electricityImportedFrom: '<b>%1$s %%</b> of energy %2$s in <img id="country-flag"></img> <b>%3$s</b> is imported from <img id="country-exchange-flag"></img> <b>%4$s</b>',
  electricityStoredUsing: '<b>%1$s %%</b> of energy %2$s in <img id="country-flag"></img> <b>%3$s</b> is stored using %4$s',
  emissionsComeFrom: '<b>%1$s %%</b> of emissions from energy %2$s in <img id="country-flag"></img> <b>%3$s</b> come from %4$s',
  emissionsExportedTo: '<b>%1$s %%</b> of emissions from energy %2$s in <img id="country-flag"></img> <b>%3$s</b> are exported to <img id="country-exchange-flag"></img> <b>%4$s</b>',
  emissionsImportedFrom: '<b>%1$s %%</b> of emissions from energy %2$s in <img id="country-flag"></img> <b>%3$s</b> are imported from <img id="country-exchange-flag"></img> <b>%4$s</b>',
  emissionsStoredUsing: '<b>%1$s %%</b> of emissions from energy %2$s in <img id="country-flag"></img> <b>%3$s</b> are stored using %4$s'
};
function __(keyStr) {
  const result = localeConfig[keyStr];
  const formatArgs = Array.prototype.slice.call(arguments).slice(1);
  return result && vsprintf(result, formatArgs);
}
const CountryPanelProductionTooltip = ({
  displayByEmissions,
  mode,
  position,
  zoneData,
  onClose,
  electricityMixMode
}) => {
  if (!zoneData) {
    return null;
  }
  const co2Intensity = getProductionCo2Intensity(mode, zoneData);
  const format = displayByEmissions ? formatCo2 : formatPower;
  const isStorage = mode.indexOf("storage") !== -1;
  const resource = mode.replace(" storage", "");
  const key = electricityMixMode === "consumption" ? "primaryEnergyConsumptionTWh" : "primaryEnergyProductionTWh";
  const capacity = (zoneData.capacity || {})[mode];
  const production = (zoneData[key] || {})[resource];
  const storage = (zoneData.storage || {})[resource];
  const electricity = getElectricityProductionValue({
    capacity,
    isStorage,
    storage,
    production
  });
  const isExport = electricity < 0;
  const usage = Math.abs(displayByEmissions ? electricity * co2Intensity * 1e3 : electricity);
  const totalElectricity = getTotalElectricity(zoneData, displayByEmissions, electricityMixMode);
  const co2IntensitySource = isStorage ? (zoneData.dischargeCo2IntensitySources || {})[resource] : (zoneData.productionCo2IntensitySources || {})[resource];
  let headline = __(isExport ? displayByEmissions ? "emissionsStoredUsing" : "electricityStoredUsing" : displayByEmissions ? "emissionsComeFrom" : "electricityComesFrom", getRatioPercent(usage, totalElectricity), electricityMixMode === "consumption" ? "consumed" : "produced", getFullZoneName(zoneData.countryCode), __(mode));
  headline = headline.replace('id="country-flag"', `class="flag" src="${flagUri(zoneData.countryCode)}"`);
  return /* @__PURE__ */ React.createElement(Tooltip, {
    id: "countrypanel-production-tooltip",
    position,
    onClose
  }, /* @__PURE__ */ React.createElement("span", {
    dangerouslySetInnerHTML: {__html: `${zoneData.year}: ${headline}`}
  }), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement(MetricRatio, {
    value: usage,
    total: totalElectricity,
    format
  }), null, null);
};
export default connect(mapStateToProps)(CountryPanelProductionTooltip);
