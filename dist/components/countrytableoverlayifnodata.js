import React from '../pkg/react.js';
import { connect } from '../pkg/react-redux.js';
import { useParams } from '../pkg/react-router-dom.js';
import { useCurrentZoneData } from '../hooks/redux.js';

const mapStateToProps = state => ({
  zoneTimeIndex: state.application.selectedZoneTimeIndex
});

const __ = () => 'X';

const CountryTableOverlayIfNoData = ({
  zoneTimeIndex
}) => {
  const {
    zoneId
  } = useParams();
  const zoneData = useCurrentZoneData(); // TODO: Shouldn't be hardcoded

  const zonesThatCanHaveZeroProduction = ['AX', 'DK-BHM', 'CA-PE', 'ES-IB-FO'];
  const zoneHasNotProductionDataAtTimestamp = (!zoneData.production || !Object.keys(zoneData.production).length) && !zonesThatCanHaveZeroProduction.includes(zoneId);
  const zoneIsMissingParser = !zoneData.hasParser;
  const zoneHasData = zoneHasNotProductionDataAtTimestamp && !zoneIsMissingParser;
  const isRealtimeData = zoneTimeIndex === null;
  if (!zoneHasData) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "no-data-overlay visible"
  }, /*#__PURE__*/React.createElement("div", {
    className: "no-data-overlay-background"
  }), /*#__PURE__*/React.createElement("div", {
    className: "no-data-overlay-message"
  }, __(isRealtimeData ? 'country-panel.noLiveData' : 'country-panel.noDataAtTimestamp'), !isRealtimeData ? null : /*#__PURE__*/React.createElement(React.Fragment, null, '. ', 'Help us identify the problem by taking a look at the ', /*#__PURE__*/React.createElement("a", {
    href: `https://kibana.electricitymap.org/app/kibana#/discover/10af54f0-0c4a-11e9-85c1-1d63df8c862c?_g=(refreshInterval:('$$hashKey':'object:232',display:'5%20minutes',pause:!f,section:2,value:300000),time:(from:now-24h,mode:quick,to:now))&_a=(columns:!(message,extra.key,level),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!t,index:'96f67170-0c49-11e9-85c1-1d63df8c862c',key:level,negate:!f,params:(query:ERROR,type:phrase),type:phrase,value:ERROR),query:(match:(level:(query:ERROR,type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'96f67170-0c49-11e9-85c1-1d63df8c862c',key:extra.key,negate:!f,params:(query:${zoneId},type:phrase),type:phrase,value:${zoneId}),query:(match:(extra.key:(query:${zoneId},type:phrase))))),index:'96f67170-0c49-11e9-85c1-1d63df8c862c',interval:auto,query:(language:lucene,query:''),sort:!('@timestamp',desc))`,
    target: "_blank",
    rel: "noopener noreferrer"
  }, "runtime logs"), ", or contact our data provider.")));
};

export default connect(mapStateToProps)(CountryTableOverlayIfNoData);