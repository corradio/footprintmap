/* eslint-disable react/jsx-no-target-blank */

/* eslint-disable jsx-a11y/anchor-is-valid */

/* eslint-disable jsx-a11y/anchor-has-content */
// TODO: re-enable rules
import React from '../../pkg/react.js';
import { connect } from '../../pkg/react-redux.js';
import { Switch, Route, Redirect, useLocation } from '../../pkg/react-router-dom.js';
import { dispatchApplication } from '../../store.js';
import { useSearchParams } from '../../hooks/router.js';
import { usePageViewsTracker } from '../../hooks/tracking.js';
import MobileInfoTab from './mobileinfotab.js';
import ZoneDetailsPanel from './zonedetailspanel.js';
import ZoneListPanel from './zonelistpanel.js';

const HandleLegacyRoutes = () => {
  const searchParams = useSearchParams();
  const page = (searchParams.get('page') || 'map').replace('country', 'zone').replace('highscore', 'ranking');
  searchParams.delete('page');
  const zoneId = searchParams.get('countryCode');
  searchParams.delete('countryCode');
  return /*#__PURE__*/React.createElement(Redirect, {
    to: {
      pathname: zoneId ? `/zone/${zoneId}` : `/${page}`,
      search: searchParams.toString()
    }
  });
}; // TODO: Move all styles from styles.css to here


const mapStateToProps = state => ({
  isLeftPanelCollapsed: state.application.isLeftPanelCollapsed,
  isMobile: state.application.isMobile
});

const LeftPanel = ({
  isLeftPanelCollapsed,
  isMobile
}) => {
  const location = useLocation();
  usePageViewsTracker(); // Hide the panel completely if looking at the map on mobile.
  // TODO: Do this better when <Switch> is pulled up the hierarchy.

  const panelHidden = isMobile && location.pathname === '/map';
  return /*#__PURE__*/React.createElement("div", {
    className: `panel left-panel ${isLeftPanelCollapsed ? 'collapsed' : ''}`,
    style: panelHidden ? {
      display: 'none'
    } : {}
  }, /*#__PURE__*/React.createElement("div", {
    id: "mobile-header",
    className: "large-screen-hidden brightmode"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo"
  }, "footprintMap"))), /*#__PURE__*/React.createElement("div", {
    id: "left-panel-collapse-button",
    className: `small-screen-hidden ${isLeftPanelCollapsed ? 'collapsed' : ''}`,
    onClick: () => dispatchApplication('isLeftPanelCollapsed', !isLeftPanelCollapsed),
    role: "button",
    tabIndex: "0"
  }, /*#__PURE__*/React.createElement("i", {
    className: "material-icons"
  }, "arrow_drop_down")), /*#__PURE__*/React.createElement(Switch, null, /*#__PURE__*/React.createElement(Route, {
    exact: true,
    path: "/",
    component: HandleLegacyRoutes
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/map",
    component: ZoneListPanel
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/ranking",
    component: ZoneListPanel
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/zone/:zoneId",
    component: ZoneDetailsPanel
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/info",
    component: MobileInfoTab
  })));
};

export default connect(mapStateToProps)(LeftPanel);