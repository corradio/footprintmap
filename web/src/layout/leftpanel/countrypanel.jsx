/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable react/jsx-no-target-blank */
// TODO: re-enable rules

import React, { useEffect, useState, useMemo } from 'react';
import { Redirect, Link, useLocation, useParams, useHistory } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import moment from 'moment';

// Components
import LowCarbonInfoTooltip from '../../components/tooltips/lowcarboninfotooltip';
import CircularGauge from '../../components/circulargauge';
import CountryHistoryCarbonGraph from '../../components/countryhistorycarbongraph';
import CountryHistoryEmissionsGraph from '../../components/countryhistoryemissionsgraph';
import CountryHistoryMixGraph from '../../components/countryhistorymixgraph';
import CountryHistoryGdpGraph from '../../components/countryhistorygdpgraph';
import CountryHistoryPopulationGraph from '../../components/countryhistorypopulationgraph';
import CountryHistoryEnergyIntensity from '../../components/countryhistoryenergyintensity';
import CountryTable from '../../components/countrytable';

// Modules
import { useCurrentZoneData } from '../../hooks/redux';
import { useCo2ColorScale } from '../../hooks/theme';
import { flagUri } from '../../helpers/flags';
import { getFullZoneName } from '../../helpers/language';
import { getZoneCarbonIntensity, getRenewableRatio, getLowcarbonRatio } from '../../helpers/zonedata';
import { formatCarbonIntensityUnit, formatCarbonIntensityDescription } from '../../helpers/formatting';
// import { CARBON_INTENSITY_DOMAIN } from '../../helpers/constants';

// TODO: Move all styles from styles.css to here
// TODO: Remove all unecessary id and class tags

const CountryLowCarbonGauge = (props) => {
  const electricityMixMode = useSelector((state) => state.application.electricityMixMode);

  const d = useCurrentZoneData();
  if (!d) {
    return <CircularGauge {...props} />;
  }

  const countryLowCarbonPercentage = getLowcarbonRatio(electricityMixMode, d) * 100;

  return <CircularGauge percentage={countryLowCarbonPercentage} {...props} />;
};

const CountryRenewableGauge = (props) => {
  const electricityMixMode = useSelector((state) => state.application.electricityMixMode);

  const d = useCurrentZoneData();
  if (!d) {
    return <CircularGauge {...props} />;
  }

  const countryRenewablePercentage = getRenewableRatio(electricityMixMode, d) * 100;

  return <CircularGauge percentage={countryRenewablePercentage} {...props} />;
};

const mapStateToProps = (state) => ({
  electricityMixMode: state.application.electricityMixMode,
  tableDisplayEmissions: state.application.tableDisplayEmissions,
  zones: state.data.grid.zones,

  carbonIntensityDomain: state.application.carbonIntensityDomain,
});

const CountryPanel = ({
  electricityMixMode,
  zones,

  carbonIntensityDomain,
}) => {
  const [tooltip, setTooltip] = useState(null);

  const co2ColorScale = useCo2ColorScale();

  const history = useHistory();
  const location = useLocation();
  const { zoneId } = useParams();

  const data = useCurrentZoneData() || {};

  const parentPage = useMemo(
    () => ({
      pathname: '/map',
      search: location.search,
    }),
    [location.search]
  );

  // Back button keyboard navigation
  useEffect(() => {
    const keyHandler = (e) => {
      if (e.key === 'Backspace' || e.key === '/') {
        history.push(parentPage);
      }
    };
    document.addEventListener('keyup', keyHandler);
    return () => {
      document.removeEventListener('keyup', keyHandler);
    };
  }, [history, parentPage]);

  const [energyMixMode, setEnergyMixMode] = useState(electricityMixMode);

  // Redirect to the parent page if the zone is invalid.
  if (!zones[zoneId]) {
    return <Redirect to={parentPage} />;
  }

  const datetime = data.year && data.year.toString();
  const co2Intensity = getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, data);

  return (
    <div className="country-panel">
      <div id="country-table-header">
        <div className="left-panel-zone-details-toolbar">
          <Link to={parentPage}>
            <span className="left-panel-back-button">
              <i className="material-icons" aria-hidden="true">
                arrow_back
              </i>
            </span>
          </Link>
          <div className="country-name-time">
            <div className="country-name-time-table">
              <div style={{ display: 'table-cell' }}>
                <img id="country-flag" className="flag" alt="" src={flagUri(zoneId, 24)} />
              </div>

              <div style={{ display: 'table-cell' }}>
                <div className="country-name">{getFullZoneName(zoneId)}</div>
                <div className="country-time">{datetime ? moment(datetime).format('YYYY') : ''}</div>
              </div>
            </div>
          </div>
        </div>

        {data && (
          <React.Fragment>
            <div className="country-table-header-inner">
              <div className="country-col country-emission-intensity-wrap">
                <div
                  id="country-emission-rect"
                  className="country-col-box emission-rect emission-rect-overview"
                  style={{ backgroundColor: co2ColorScale(co2Intensity) }}
                >
                  <div>
                    <span className="country-emission-intensity">
                      {co2Intensity != null ? Math.round(co2Intensity) : '?'}
                    </span>
                    <div className="country-col-subtext">{formatCarbonIntensityUnit(carbonIntensityDomain)}</div>
                  </div>
                </div>
                <div className="country-col-headline">Carbon footprint</div>
              </div>

              <React.Fragment>
                <div className="country-col country-lowcarbon-wrap">
                  <div id="country-lowcarbon-gauge" className="country-gauge-wrap">
                    <CountryLowCarbonGauge
                      onMouseMove={(x, y) => setTooltip({ position: { x, y } })}
                      onMouseOut={() => setTooltip(null)}
                    />
                    {tooltip && <LowCarbonInfoTooltip position={tooltip.position} />}
                  </div>
                  <div className="country-col-headline">Low-carbon</div>
                  <div className="country-col-subtext" />
                </div>
                <div className="country-col country-renewable-wrap">
                  <div id="country-renewable-gauge" className="country-gauge-wrap">
                    <CountryRenewableGauge />
                  </div>
                  <div className="country-col-headline">Renewable</div>
                </div>
              </React.Fragment>
            </div>
          </React.Fragment>
        )}
      </div>

      <div className="country-panel-wrap">
        {data && (
          <React.Fragment>
            <div className="country-history">
              <br />
              <span className="country-history-title">
                {formatCarbonIntensityDescription(carbonIntensityDomain, electricityMixMode)}
              </span>
              <CountryHistoryCarbonGraph electricityMixMode={energyMixMode} />

              <span className="country-history-title">
                {`Total carbon emissions (${electricityMixMode === 'consumption' ? 'incl. imported' : 'territorial'})`}
              </span>
              <CountryHistoryEmissionsGraph electricityMixMode={energyMixMode} />

              <React.Fragment>
                <span className="country-history-title">Origin of energy</span>
                <div className="country-show-emissions-wrap">
                  <div className="menu">
                    <a
                      onClick={() => setEnergyMixMode('consumption')}
                      className={energyMixMode === 'consumption' ? 'selected' : null}
                    >
                      consumed
                    </a>
                    |
                    <a
                      onClick={() => setEnergyMixMode('production')}
                      className={energyMixMode !== 'consumption' ? 'selected' : null}
                    >
                      produced
                    </a>
                  </div>
                </div>
                <CountryHistoryMixGraph electricityMixMode={energyMixMode} />
                <div>
                  <small>Note: energy from electricity does not account for electricity imported</small>
                </div>
                <br />
                {null && (
                  <React.Fragment>
                    <span className="country-history-title">by source</span>
                    <CountryTable />
                  </React.Fragment>
                )}
              </React.Fragment>

              <React.Fragment>
                <span className="country-history-title">Gross domestic product</span>
                <CountryHistoryGdpGraph />
              </React.Fragment>

              <React.Fragment>
                <span className="country-history-title">Energy intensity of the economy</span>
                <CountryHistoryEnergyIntensity />
              </React.Fragment>

              <React.Fragment>
                <span className="country-history-title">Population</span>
                <CountryHistoryPopulationGraph />
              </React.Fragment>
            </div>
          </React.Fragment>
        )}

        <p>
          This project is{' '}
          <a href="https://github.com/corradio/carbonmap" target="_blank">
            Open Source
          </a>{' '}
          (See{' '}
          <a href="https://github.com/corradio/carbonmap#data-sources" target="_blank">
            data sources
          </a>
          ).{' '}
        </p>
        <p>
          Found bugs or have ideas? Report them{' '}
          <a href="https://github.com/corradio/carbonmap/issues/new" target="_blank">
            here
          </a>
          .<br />
        </p>

        <div className="social-buttons large-screen-hidden">
          <div>
            {/* Facebook share */}
            <div className="fb-share-button" data-href="https://www.electricitymap.org/" data-layout="button_count" />
            {/* Twitter share */}
            <a className="twitter-share-button" data-url="https://www.electricitymap.org" data-via="electricitymap" />
            {/* Slack */}
            <span className="slack-button">
              <a href="https://slack.tmrow.com" target="_blank" className="slack-btn">
                <span className="slack-ico" />
                <span className="slack-text">Slack</span>
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps)(CountryPanel);
