/* eslint-disable react/jsx-no-target-blank */

/* eslint-disable jsx-a11y/anchor-is-valid */
// TODO(olc): re-enable this rule
import React from '../pkg/react.js';
import { connect, useDispatch, useSelector } from '../pkg/react-redux.js';
import { useLocation } from '../pkg/react-router-dom.js'; // Layout

import Header from './header.js';
import LayerButtons from './layerbuttons.js';
import LeftPanel from './leftpanel/index.js';
import Legend from './legend.js';
import Tabs from './tabs.js';
import Map from './map.js'; // Modules

import { isNewClientVersion } from '../helpers/environment.js';
import { useCustomDatetime } from '../hooks/router.js';
import { useLoadingOverlayVisible, useCarbonIntensityDomain, useCurrentZoneData } from '../hooks/redux.js';
import { useClientVersionFetch, useGridDataPolling, useConditionalWindDataPolling, useConditionalSolarDataPolling } from '../hooks/fetch.js';
import { dispatchApplication } from '../store.js';
import OnboardingModal from '../components/onboardingmodal.js';
import LoadingOverlay from '../components/loadingoverlay.js';
import Toggle from '../components/toggle.js';
import { CARBON_INTENSITY_DOMAIN } from '../helpers/constants.js'; // TODO: Move all styles from styles.css to here
// TODO: Remove all unecessary id and class tags

const mapStateToProps = state => ({
  brightModeEnabled: state.application.brightModeEnabled,
  hasConnectionWarning: state.data.hasConnectionWarning,
  version: state.application.version
});

const Main = ({
  brightModeEnabled,
  hasConnectionWarning,
  version
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const datetime = useCustomDatetime();
  const showLoadingOverlay = useLoadingOverlayVisible();
  const carbonIntensityDomain = useCarbonIntensityDomain();
  const data = useCurrentZoneData();
  const currentGridData = useSelector(state => state.data.grid.datetime);
  const currentYear = data ? data.year : currentGridData; // Check for the latest client version once initially.

  useClientVersionFetch(); // Start grid data polling as soon as the app is mounted.

  useGridDataPolling(); // Poll wind data if the toggle is enabled.

  useConditionalWindDataPolling(); // Poll solar data if the toggle is enabled.

  useConditionalSolarDataPolling();
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',

      /* This is done in order to ensure that dragging will not affect the body */
      width: '100vw',
      height: 'inherit',
      display: 'flex',
      flexDirection: 'column',

      /* children will be stacked vertically */
      alignItems: 'stretch'
      /* force children to take 100% width */

    }
  }, /*#__PURE__*/React.createElement(Header, null), /*#__PURE__*/React.createElement("div", {
    id: "inner"
  }, /*#__PURE__*/React.createElement(LoadingOverlay, {
    visible: showLoadingOverlay
  }), /*#__PURE__*/React.createElement(LeftPanel, null), /*#__PURE__*/React.createElement("div", {
    id: "map-container",
    className: location.pathname !== '/map' ? 'small-screen-hidden' : ''
  }, /*#__PURE__*/React.createElement(Map, null), /*#__PURE__*/React.createElement("div", {
    id: "watermark",
    className: `watermark small-screen-hidden ${brightModeEnabled ? 'brightmode' : ''}`
  }, /*#__PURE__*/React.createElement("a", {
    href: "http://www.tmrow.com/mission?utm_source=footprintmap.org&utm_medium=referral&utm_campaign=watermark",
    target: "_blank"
  }, /*#__PURE__*/React.createElement("div", {
    id: "built-by-tomorrow"
  }))), /*#__PURE__*/React.createElement(Legend, null), /*#__PURE__*/React.createElement("div", {
    className: "controls-container"
  }, /*#__PURE__*/React.createElement(Toggle, {
    onChange: value => dispatchApplication('carbonIntensityDomain', value),
    options: [{
      value: CARBON_INTENSITY_DOMAIN.POPULATION,
      label: 'per capita'
    }, {
      value: CARBON_INTENSITY_DOMAIN.GDP,
      label: 'per gdp'
    }, {
      value: CARBON_INTENSITY_DOMAIN.ENERGY,
      label: 'per energy'
    }],
    value: carbonIntensityDomain
  })), /*#__PURE__*/React.createElement(LayerButtons, null), /*#__PURE__*/React.createElement("div", {
    className: "text-title",
    style: {
      color: brightModeEnabled ? '#000' : '#fff'
    }
  }, currentYear))), /*#__PURE__*/React.createElement(Tabs, null)), /*#__PURE__*/React.createElement(OnboardingModal, null));
};

export default connect(mapStateToProps)(Main);