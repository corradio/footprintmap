import React from 'react';
import { connect } from 'react-redux';

import { __ } from '../../helpers/translation';
import { useCo2ColorScale } from '../../hooks/theme';
import { useCarbonIntensityDomain } from '../../hooks/redux';
import { getZoneCarbonIntensity, getRenewableRatio, getLowcarbonRatio } from '../../helpers/zonedata';
import { formatCarbonIntensityShortUnit, formatCarbonIntensityDescription } from '../../helpers/formatting';
import { CARBON_INTENSITY_DOMAIN } from '../../helpers/constants';

import CircularGauge from '../circulargauge';
import Tooltip from '../tooltip';
import { ZoneName } from './common';

const mapStateToProps = state => ({
  electricityMixMode: state.application.electricityMixMode,
});

const MapCountryTooltip = ({
  electricityMixMode,
  position,
  zoneData,
}) => {
  const co2ColorScale = useCo2ColorScale();
  const carbonIntensityDomain = useCarbonIntensityDomain();

  if (!zoneData) return null;

  const co2intensity = getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, zoneData);

  const lowCarbonRatio = getLowcarbonRatio(electricityMixMode, zoneData);
  const lowCarbonPercentage = lowCarbonRatio !== null
    ? Math.round(100 * lowCarbonRatio)
    : '?';

  const renewableRatio = getRenewableRatio(electricityMixMode, zoneData);
  const renewablePercentage = renewableRatio !== null
    ? Math.round(100 * renewableRatio)
    : '?';

  return (
    <Tooltip id="country-tooltip" position={position}>
      <div className="zone-name-header">
        <ZoneName zone={zoneData.countryCode} />
      </div>
      {true ? (
        co2intensity ? (
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
                    {formatCarbonIntensityShortUnit(carbonIntensityDomain)}
                  </div>
                </div>
                <div className="country-col-headline">{ formatCarbonIntensityDescription(carbonIntensityDomain, electricityMixMode) }</div>
              </div>
              {true ? (
                <React.Fragment>
                  <div className="country-col country-lowcarbon-wrap">
                    <div id="tooltip-country-lowcarbon-gauge" className="country-gauge-wrap">
                      <CircularGauge percentage={lowCarbonPercentage} />
                    </div>
                    <div className="country-col-headline">{__('country-panel.lowcarbon')}</div>
                    <div className="country-col-subtext" />
                  </div>
                  <div className="country-col country-renewable-wrap">
                    <div id="tooltip-country-renewable-gauge" className="country-gauge-wrap">
                      <CircularGauge percentage={renewablePercentage} />
                    </div>
                    <div className="country-col-headline">{__('country-panel.renewable')}</div>
                  </div>
                </React.Fragment>
              ) : null}
              </div>
          </div>
        ) : (
          <div className="temporary-outage-text">
            No data available
          </div>
        )
      ) : (
        <div className="no-parser-text">
          <span dangerouslySetInnerHTML={{ __html: __('tooltips.noParserInfo', 'https://github.com/tmrowco/electricitymap-contrib#adding-a-new-region') }} />
        </div>
      )}
    </Tooltip>
  );
};

export default connect(mapStateToProps)(MapCountryTooltip);
