import React from 'react';
import { connect } from 'react-redux';
import { isFinite } from 'lodash';
import { vsprintf } from 'sprintf-js';

import { formatCo2, formatPower } from '../../helpers/formatting';
import { flagUri } from '../../helpers/flags';
import { getRatioPercent } from '../../helpers/math';
import { getFullZoneName } from '../../helpers/language';

import Tooltip from '../tooltip';
import { CarbonIntensity, MetricRatio } from './common';
import { getElectricityProductionValue, getProductionCo2Intensity, getTotalElectricity } from '../../helpers/zonedata';

const mapStateToProps = (state) => ({
  displayByEmissions: state.application.tableDisplayEmissions,
});

const localeConfig = {
  electricityComesFrom: '<b>%1$s %%</b> of energy %2$s in <img id="country-flag"></img> <b>%3$s</b> comes from %4$s',
  electricityExportedTo:
    '<b>%1$s %%</b> of energy %2$s in <img id="country-flag"></img> <b>%3$s</b> is exported to <img id="country-exchange-flag"></img> <b>%4$s</b>',
  electricityImportedFrom:
    '<b>%1$s %%</b> of energy %2$s in <img id="country-flag"></img> <b>%3$s</b> is imported from <img id="country-exchange-flag"></img> <b>%4$s</b>',
  electricityStoredUsing:
    '<b>%1$s %%</b> of energy %2$s in <img id="country-flag"></img> <b>%3$s</b> is stored using %4$s',
  emissionsComeFrom:
    '<b>%1$s %%</b> of emissions from energy %2$s in <img id="country-flag"></img> <b>%3$s</b> come from %4$s',
  emissionsExportedTo:
    '<b>%1$s %%</b> of emissions from energy %2$s in <img id="country-flag"></img> <b>%3$s</b> are exported to <img id="country-exchange-flag"></img> <b>%4$s</b>',
  emissionsImportedFrom:
    '<b>%1$s %%</b> of emissions from energy %2$s in <img id="country-flag"></img> <b>%3$s</b> are imported from <img id="country-exchange-flag"></img> <b>%4$s</b>',
  emissionsStoredUsing:
    '<b>%1$s %%</b> of emissions from energy %2$s in <img id="country-flag"></img> <b>%3$s</b> are stored using %4$s',
};
function __(keyStr) {
  const result = localeConfig[keyStr];
  const formatArgs = Array.prototype.slice.call(arguments).slice(1); // remove first
  return result && vsprintf(result, formatArgs);
}

const CountryPanelProductionTooltip = ({
  displayByEmissions,
  mode,
  position,
  zoneData,
  onClose,

  electricityMixMode,
}) => {
  if (!zoneData) {
    return null;
  }

  const co2Intensity = getProductionCo2Intensity(mode, zoneData);

  const format = displayByEmissions ? formatCo2 : formatPower;

  const isStorage = mode.indexOf('storage') !== -1;
  const resource = mode.replace(' storage', '');

  const key = electricityMixMode === 'consumption' ? 'primaryEnergyConsumptionTWh' : 'primaryEnergyProductionTWh';

  const capacity = (zoneData.capacity || {})[mode];
  const production = (zoneData[key] || {})[resource];
  const storage = (zoneData.storage || {})[resource];

  const electricity = getElectricityProductionValue({
    capacity,
    isStorage,
    storage,
    production,
  });
  const isExport = electricity < 0;

  const usage = Math.abs(displayByEmissions ? electricity * co2Intensity * 1000 : electricity);
  const totalElectricity = getTotalElectricity(zoneData, displayByEmissions, electricityMixMode);

  const co2IntensitySource = isStorage
    ? (zoneData.dischargeCo2IntensitySources || {})[resource]
    : (zoneData.productionCo2IntensitySources || {})[resource];

  let headline = __(
    // eslint-disable-next-line no-nested-ternary
    isExport
      ? displayByEmissions
        ? 'emissionsStoredUsing'
        : 'electricityStoredUsing'
      : displayByEmissions
      ? 'emissionsComeFrom'
      : 'electricityComesFrom',
    getRatioPercent(usage, totalElectricity),
    electricityMixMode === 'consumption' ? 'consumed' : 'produced',
    getFullZoneName(zoneData.countryCode),
    __(mode)
  );
  headline = headline.replace('id="country-flag"', `class="flag" src="${flagUri(zoneData.countryCode)}"`);

  return (
    <Tooltip id="countrypanel-production-tooltip" position={position} onClose={onClose}>
      <span dangerouslySetInnerHTML={{ __html: `${zoneData.year}: ${headline}` }} />
      <br />
      <MetricRatio value={usage} total={totalElectricity} format={format} />
      {null && (
        <React.Fragment>
          <br />
          <br />
          {__('tooltips.utilizing')} <b>{getRatioPercent(usage, capacity)} %</b> {__('tooltips.ofinstalled')}
          <br />
          <MetricRatio value={usage} total={capacity} format={format} />
        </React.Fragment>
      )}
      {/* Don't show carbon intensity if we know for sure the zone doesn't use this resource */}
      {null && !displayByEmissions && (isFinite(co2Intensity) || usage !== 0) && (
        <React.Fragment>
          <br />
          <br />
          {__('tooltips.withcarbonintensity')}
          <br />
          <CarbonIntensity intensity={co2Intensity} />
          <small>
            {' '}
            ({__('country-panel.source')}: {co2IntensitySource || '?'})
          </small>
        </React.Fragment>
      )}
    </Tooltip>
  );
};

export default connect(mapStateToProps)(CountryPanelProductionTooltip);
