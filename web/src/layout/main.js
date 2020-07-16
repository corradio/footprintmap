/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
// TODO(olc): re-enable this rule

import React from 'react';
import moment from 'moment';
import { connect, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

// Layout
import Header from './header';
import LayerButtons from './layerbuttons';
import LeftPanel from './leftpanel';
import Legend from './legend';
import Tabs from './tabs';
import Map from './map';

// Modules
import { __ } from '../helpers/translation';
import { isNewClientVersion } from '../helpers/environment';
import { useCustomDatetime } from '../hooks/router';
import { useLoadingOverlayVisible, useCarbonIntensityDomain } from '../hooks/redux';
import {
  useClientVersionFetch,
  useGridDataPolling,
  useConditionalWindDataPolling,
  useConditionalSolarDataPolling,
} from '../hooks/fetch';
import { dispatchApplication } from '../store';
import OnboardingModal from '../components/onboardingmodal';
import LoadingOverlay from '../components/loadingoverlay';
import Toggle from '../components/toggle';
import { CARBON_INTENSITY_DOMAIN } from '../helpers/constants';

// TODO: Move all styles from styles.css to here
// TODO: Remove all unecessary id and class tags

const mapStateToProps = state => ({
  brightModeEnabled: state.application.brightModeEnabled,
  hasConnectionWarning: state.data.hasConnectionWarning,
  version: state.application.version,
  currentGridYear: state.data.grid.datetime,
});

const Main = ({
  brightModeEnabled,
  hasConnectionWarning,
  version,
  currentGridYear,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const datetime = useCustomDatetime();

  const showLoadingOverlay = useLoadingOverlayVisible();
  const carbonIntensityDomain = useCarbonIntensityDomain();

  // Check for the latest client version once initially.
  useClientVersionFetch();

  // Start grid data polling as soon as the app is mounted.
  useGridDataPolling();

  // Poll wind data if the toggle is enabled.
  useConditionalWindDataPolling();

  // Poll solar data if the toggle is enabled.
  useConditionalSolarDataPolling();

  return (
    <React.Fragment>
      <div
        style={{
          position: 'fixed', /* This is done in order to ensure that dragging will not affect the body */
          width: '100vw',
          height: 'inherit',
          display: 'flex',
          flexDirection: 'column', /* children will be stacked vertically */
          alignItems: 'stretch', /* force children to take 100% width */
        }}
      >
        <Header />
        <div id="inner">
          <LoadingOverlay visible={showLoadingOverlay} />
          <LeftPanel />
          <div id="map-container" className={location.pathname !== '/map' ? 'small-screen-hidden' : ''}>
            <Map />
            <div id="watermark" className={`watermark small-screen-hidden ${brightModeEnabled ? 'brightmode' : ''}`}>
              <a href="http://www.tmrow.com/mission?utm_source=footprintmap.org&utm_medium=referral&utm_campaign=watermark" target="_blank">
                <div id="built-by-tomorrow" />
              </a>
            </div>
            <Legend />
            <div className="controls-container">
              <Toggle
                onChange={value => dispatchApplication('carbonIntensityDomain', value)}
                options={[
                  { value: CARBON_INTENSITY_DOMAIN.POPULATION, label: 'per capita' },
                  { value: CARBON_INTENSITY_DOMAIN.GDP, label: 'per gdp' },
                  { value: CARBON_INTENSITY_DOMAIN.ENERGY, label: 'per energy' },
                ]}
                value={carbonIntensityDomain}
              />
            </div>
            <LayerButtons />
            <div className="text-title" style={{ color: brightModeEnabled ? '#000' : '#fff' }}>
              {moment(currentGridYear.toString()).format('YYYY')}
            </div>
          </div>

          <div id="connection-warning" className={`flash-message ${hasConnectionWarning ? 'active' : ''}`}>
            <div className="inner">
              {__('misc.oops')}
              {' '}
              <a
                href=""
                onClick={(e) => {
                  dispatch({ type: 'GRID_DATA_FETCH_REQUESTED', payload: { datetime } });
                  e.preventDefault();
                }}
              >
                {__('misc.retrynow')}
              </a>
              .
            </div>
          </div>
          <div id="new-version" className={`flash-message ${isNewClientVersion(version) ? 'active' : ''}`}>
            <div className="inner">
              {__('misc.newversion')}
            </div>
          </div>

          { /* end #inner */}
        </div>
        <Tabs />
      </div>
      <OnboardingModal />
    </React.Fragment>
  );
};

export default connect(mapStateToProps)(Main);
