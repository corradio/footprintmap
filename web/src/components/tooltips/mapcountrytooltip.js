import React from 'react';
import { connect } from 'react-redux';

import { useCo2ColorScale } from '../../hooks/theme';
import { useCarbonIntensityDomain } from '../../hooks/redux';
import { getZoneCarbonIntensity, getRenewableRatio, getLowcarbonRatio } from '../../helpers/zonedata';
import { formatCarbonIntensityUnit, formatCarbonIntensityDescription } from '../../helpers/formatting';

import CircularGauge from '../circulargauge';
import Tooltip from '../tooltip';
import { ZoneName } from './common';

const mapStateToProps = (state) => ({
  electricityMixMode: state.application.electricityMixMode,
});

const MapCountryTooltip = ({ electricityMixMode, position, zoneData, onClose }) => {
  const co2ColorScale = useCo2ColorScale();
  const carbonIntensityDomain = useCarbonIntensityDomain();

  if (!zoneData) {
    return null;
  }

  const co2intensity = getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, zoneData);

  const lowCarbonRatio = getLowcarbonRatio(electricityMixMode, zoneData);
  const lowCarbonPercentage = lowCarbonRatio !== null ? Math.round(100 * lowCarbonRatio) : '?';

  const renewableRatio = getRenewableRatio(electricityMixMode, zoneData);
  const renewablePercentage = renewableRatio !== null ? Math.round(100 * renewableRatio) : '?';

  return (
    <Tooltip id="country-tooltip" position={position} onClose={onClose}>
      <div className="zone-name-header">
        <ZoneName zone={zoneData.countryCode} />
      </div>
      {co2intensity ? (
        <div className="zone-details">
          <div className="country-table-header-inner">
            <div className="country-col country-emission-intensity-wrap">
              <div
                id="country-emission-rect"
                className="country-col-box emission-rect emission-rect-overview"
                style={{ backgroundColor: co2ColorScale(co2intensity) }}
              >
                <div>
                  <span className="country-emission-intensity">
                    {co2intensity != null ? Math.round(co2intensity) : '?'}
                  </span>
                  <div className="country-col-subtext">{formatCarbonIntensityUnit(carbonIntensityDomain)}</div>
                </div>
              </div>
              <div className="country-col-headline">
                {formatCarbonIntensityDescription(carbonIntensityDomain, electricityMixMode)}
              </div>
            </div>
            <React.Fragment>
              <div className="country-col country-lowcarbon-wrap">
                <div id="tooltip-country-lowcarbon-gauge" className="country-gauge-wrap">
                  <CircularGauge percentage={lowCarbonPercentage} />
                </div>
                <div className="country-col-headline">Low-carbon</div>
                <div className="country-col-subtext" />
              </div>
              <div className="country-col country-renewable-wrap">
                <div id="tooltip-country-renewable-gauge" className="country-gauge-wrap">
                  <CircularGauge percentage={renewablePercentage} />
                </div>
                <div className="country-col-headline">Renewable</div>
              </div>
            </React.Fragment>
          </div>
        </div>
      ) : (
        <div className="temporary-outage-text">No data available</div>
      )}
    </Tooltip>
  );
};

export default connect(mapStateToProps)(MapCountryTooltip);
