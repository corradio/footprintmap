function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/* eslint-disable jsx-a11y/anchor-has-content */

/* eslint-disable jsx-a11y/mouse-events-have-key-events */

/* eslint-disable react/jsx-no-target-blank */
// TODO: re-enable rules
import React, { useEffect, useState } from '../../pkg/react.js';
import { Redirect, Link, useLocation, useParams, useHistory } from '../../pkg/react-router-dom.js';
import { connect, useSelector } from '../../pkg/react-redux.js';
import moment from '../../pkg/moment.js'; // Components

import LowCarbonInfoTooltip from '../../components/tooltips/lowcarboninfotooltip.js';
import CircularGauge from '../../components/circulargauge.js';
import CountryHistoryCarbonGraph from '../../components/countryhistorycarbongraph.js';
import CountryHistoryEmissionsGraph from '../../components/countryhistoryemissionsgraph.js';
import CountryHistoryMixGraph from '../../components/countryhistorymixgraph.js';
import CountryHistoryGdpGraph from '../../components/countryhistorygdpgraph.js';
import CountryHistoryPopulationGraph from '../../components/countryhistorypopulationgraph.js';
import CountryHistoryEnergyIntensity from '../../components/countryhistoryenergyintensity.js';
import CountryTable from '../../components/countrytable.js'; // Modules

import { useCurrentZoneData } from '../../hooks/redux.js';
import { useCo2ColorScale } from '../../hooks/theme.js';
import { flagUri } from '../../helpers/flags.js';
import { getFullZoneName } from '../../helpers/language.js';
import { getZoneCarbonIntensity, getRenewableRatio, getLowcarbonRatio } from '../../helpers/zonedata.js';
import { formatCarbonIntensityUnit, formatCarbonIntensityDescription } from '../../helpers/formatting.js';
import { CARBON_INTENSITY_DOMAIN } from '../../helpers/constants.js'; // TODO: Move all styles from styles.css to here
// TODO: Remove all unecessary id and class tags

const CountryLowCarbonGauge = props => {
  const electricityMixMode = useSelector(state => state.application.electricityMixMode);
  const d = useCurrentZoneData();

  if (!d) {
    return /*#__PURE__*/React.createElement(CircularGauge, props);
  }

  const countryLowCarbonPercentage = getLowcarbonRatio(electricityMixMode, d) * 100;
  return /*#__PURE__*/React.createElement(CircularGauge, _extends({
    percentage: countryLowCarbonPercentage
  }, props));
};

const CountryRenewableGauge = props => {
  const electricityMixMode = useSelector(state => state.application.electricityMixMode);
  const d = useCurrentZoneData();

  if (!d) {
    return /*#__PURE__*/React.createElement(CircularGauge, props);
  }

  const countryRenewablePercentage = getRenewableRatio(electricityMixMode, d) * 100;
  return /*#__PURE__*/React.createElement(CircularGauge, _extends({
    percentage: countryRenewablePercentage
  }, props));
};

const mapStateToProps = state => ({
  electricityMixMode: state.application.electricityMixMode,
  isMobile: state.application.isMobile,
  tableDisplayEmissions: state.application.tableDisplayEmissions,
  zones: state.data.grid.zones,
  carbonIntensityDomain: state.application.carbonIntensityDomain
});

const CountryPanel = ({
  electricityMixMode,
  isMobile,
  zones,
  carbonIntensityDomain
}) => {
  const [tooltip, setTooltip] = useState(null);
  const co2ColorScale = useCo2ColorScale();
  const history = useHistory();
  const location = useLocation();
  const {
    zoneId
  } = useParams();
  const data = useCurrentZoneData() || {};
  const parentPage = {
    pathname: isMobile ? '/ranking' : '/map',
    search: location.search
  }; // Back button keyboard navigation

  useEffect(() => {
    const keyHandler = e => {
      if (e.key === 'Backspace' || e.key === '/') {
        history.push(parentPage);
      }
    };

    document.addEventListener('keyup', keyHandler);
    return () => {
      document.removeEventListener('keyup', keyHandler);
    };
  }, [history]); // Redirect to the parent page if the zone is invalid.

  if (!zones[zoneId]) {
    return /*#__PURE__*/React.createElement(Redirect, {
      to: parentPage
    });
  }

  const datetime = data.year && data.year.toString();
  const co2Intensity = getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, data);
  const [energyMixMode, setEnergyMixMode] = useState(electricityMixMode);
  return /*#__PURE__*/React.createElement("div", {
    className: "country-panel"
  }, /*#__PURE__*/React.createElement("div", {
    id: "country-table-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "left-panel-zone-details-toolbar"
  }, /*#__PURE__*/React.createElement(Link, {
    to: parentPage
  }, /*#__PURE__*/React.createElement("span", {
    className: "left-panel-back-button"
  }, /*#__PURE__*/React.createElement("i", {
    className: "material-icons",
    "aria-hidden": "true"
  }, "arrow_back"))), /*#__PURE__*/React.createElement("div", {
    className: "country-name-time"
  }, /*#__PURE__*/React.createElement("div", {
    className: "country-name-time-table"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'table-cell'
    }
  }, /*#__PURE__*/React.createElement("img", {
    id: "country-flag",
    className: "flag",
    alt: "",
    src: flagUri(zoneId, 24)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'table-cell'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "country-name"
  }, getFullZoneName(zoneId)), /*#__PURE__*/React.createElement("div", {
    className: "country-time"
  }, datetime ? moment(datetime).format('YYYY') : ''))))), data && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "country-table-header-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "country-col country-emission-intensity-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    id: "country-emission-rect",
    className: "country-col-box emission-rect emission-rect-overview",
    style: {
      backgroundColor: co2ColorScale(co2Intensity)
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "country-emission-intensity"
  }, co2Intensity != null ? Math.round(co2Intensity) : '?'), /*#__PURE__*/React.createElement("div", {
    className: "country-col-subtext"
  }, formatCarbonIntensityUnit(carbonIntensityDomain)))), /*#__PURE__*/React.createElement("div", {
    className: "country-col-headline"
  }, "Carbon footprint")), true ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "country-col country-lowcarbon-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    id: "country-lowcarbon-gauge",
    className: "country-gauge-wrap"
  }, /*#__PURE__*/React.createElement(CountryLowCarbonGauge, {
    onMouseMove: (x, y) => setTooltip({
      position: {
        x,
        y
      }
    }),
    onMouseOut: () => setTooltip(null)
  }), tooltip && /*#__PURE__*/React.createElement(LowCarbonInfoTooltip, {
    position: tooltip.position
  })), /*#__PURE__*/React.createElement("div", {
    className: "country-col-headline"
  }, "Low-carbon"), /*#__PURE__*/React.createElement("div", {
    className: "country-col-subtext"
  })), /*#__PURE__*/React.createElement("div", {
    className: "country-col country-renewable-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    id: "country-renewable-gauge",
    className: "country-gauge-wrap"
  }, /*#__PURE__*/React.createElement(CountryRenewableGauge, null)), /*#__PURE__*/React.createElement("div", {
    className: "country-col-headline"
  }, "Renewable"))) : null))), /*#__PURE__*/React.createElement("div", {
    className: "country-panel-wrap"
  }, data && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "country-history"
  }, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "country-history-title"
  }, formatCarbonIntensityDescription(carbonIntensityDomain, electricityMixMode)), /*#__PURE__*/React.createElement(CountryHistoryCarbonGraph, {
    electricityMixMode: energyMixMode
  }), /*#__PURE__*/React.createElement("span", {
    className: "country-history-title"
  }, `Total carbon emissions (${electricityMixMode === 'consumption' ? 'incl. imported' : 'territorial'})`), /*#__PURE__*/React.createElement(CountryHistoryEmissionsGraph, {
    electricityMixMode: energyMixMode
  }), true ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "country-history-title"
  }, "Origin of energy"), /*#__PURE__*/React.createElement("div", {
    className: "country-show-emissions-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu"
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => setEnergyMixMode('consumption'),
    className: energyMixMode === 'consumption' ? 'selected' : null
  }, "consumed"), "|", /*#__PURE__*/React.createElement("a", {
    onClick: () => setEnergyMixMode('production'),
    className: energyMixMode !== 'consumption' ? 'selected' : null
  }, "produced"))), /*#__PURE__*/React.createElement(CountryHistoryMixGraph, {
    electricityMixMode: energyMixMode
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Note: energy from electricity does not account for electricity imported")), /*#__PURE__*/React.createElement("br", null), null && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "country-history-title"
  }, "by source"), /*#__PURE__*/React.createElement(CountryTable, null))) : null, true ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "country-history-title"
  }, "Gross domestic product"), /*#__PURE__*/React.createElement(CountryHistoryGdpGraph, null)) : null, true ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "country-history-title"
  }, "Energy intensity of the economy"), /*#__PURE__*/React.createElement(CountryHistoryEnergyIntensity, null)) : null, true ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "country-history-title"
  }, "Population"), /*#__PURE__*/React.createElement(CountryHistoryPopulationGraph, null)) : null)), /*#__PURE__*/React.createElement("p", null, "This project is", ' ', /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/corradio/carbonmap",
    target: "_blank"
  }, "Open Source"), ' ', "(See", ' ', /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/corradio/carbonmap#data-sources",
    target: "_blank"
  }, "data sources"), ").", ' '), /*#__PURE__*/React.createElement("p", null, "Found bugs or have ideas? Report them ", /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/corradio/carbonmap/issues/new",
    target: "_blank"
  }, "here"), ".", /*#__PURE__*/React.createElement("br", null)), /*#__PURE__*/React.createElement("div", {
    className: "social-buttons large-screen-hidden"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "fb-share-button",
    "data-href": "https://www.electricitymap.org/",
    "data-layout": "button_count"
  }), /*#__PURE__*/React.createElement("a", {
    className: "twitter-share-button",
    "data-url": "https://www.electricitymap.org",
    "data-via": "electricitymap",
    "data-lang": locale
  }), /*#__PURE__*/React.createElement("span", {
    className: "slack-button"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://slack.tmrow.com",
    target: "_blank",
    className: "slack-btn"
  }, /*#__PURE__*/React.createElement("span", {
    className: "slack-ico"
  }), /*#__PURE__*/React.createElement("span", {
    className: "slack-text"
  }, "Slack")))))));
};

export default connect(mapStateToProps)(CountryPanel);