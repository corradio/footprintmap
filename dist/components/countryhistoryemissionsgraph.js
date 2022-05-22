import moment from '../pkg/moment.js';
import React, { useMemo, useState } from '../pkg/react.js';
import { connect } from '../pkg/react-redux.js';
import { scaleLinear } from '../pkg/d3-scale.js';
import { max as d3Max } from '../pkg/d3-array.js';
import { getTooltipPosition } from '../helpers/graph.js';
import { useCurrentZoneHistory, useCurrentZoneHistoryStartTime, useCurrentZoneHistoryEndTime } from '../hooks/redux.js';
import { dispatchApplication } from '../store.js';
import CountryPanelEmissionsTooltip from './tooltips/countrypanelemissionstooltip.js';
import AreaGraph from './graph/areagraph.js';
import { scaleMillionsShort } from '../helpers/formatting.js';

const prepareGraphData = (historyData, electricityMixMode) => {
  if (!historyData || !historyData[0]) return {};

  const computeEmissions = d => electricityMixMode === 'consumption' ? d.totalFootprintMegatonsCO2 : d.totalEmissionsMegatonsCO2;

  const maxEmissions = d3Max(historyData.map(d => computeEmissions(d)));
  const colorScale = scaleLinear().domain([0, maxEmissions]).range(['yellow', 'red']);
  const format = scaleMillionsShort(maxEmissions, true);
  const valueAxisLabel = `${format.unit}tCO₂`;
  const valueFactor = format.formattingFactor;
  const data = historyData.map(d => ({
    emissions: computeEmissions(d) / valueFactor,
    datetime: moment(d.year.toString()).toDate(),
    // Keep a pointer to original data
    meta: d
  }));
  const layerKeys = ['emissions'];

  const layerStroke = () => 'darkgray';

  const layerFill = () => '#616161';

  const markerFill = key => d => colorScale(d.data[key]);

  return {
    data,
    layerKeys,
    layerStroke,
    layerFill,
    markerFill,
    valueAxisLabel
  };
};

const mapStateToProps = state => ({
  isMobile: state.application.isMobile,
  selectedTimeIndex: state.application.selectedZoneTimeIndex,
  carbonIntensityDomain: state.application.carbonIntensityDomain
});

const CountryHistoryEmissionsGraph = ({
  isMobile,
  selectedTimeIndex,
  electricityMixMode
}) => {
  const [tooltip, setTooltip] = useState(null);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(null);
  const historyData = useCurrentZoneHistory();
  const startTime = useCurrentZoneHistoryStartTime();
  const endTime = useCurrentZoneHistoryEndTime(); // Recalculate graph data only when the history data is changed

  const {
    data,
    layerKeys,
    layerStroke,
    layerFill,
    markerFill,
    valueAxisLabel
  } = useMemo(() => prepareGraphData(historyData, electricityMixMode), [historyData, electricityMixMode]); // Mouse action handlers

  const mouseMoveHandler = useMemo(() => timeIndex => {
    dispatchApplication('selectedZoneTimeIndex', timeIndex);
    setSelectedLayerIndex(0); // Select the first (and only) layer even when hovering over graph background.
  }, [setSelectedLayerIndex]);
  const mouseOutHandler = useMemo(() => () => {
    dispatchApplication('selectedZoneTimeIndex', null);
    setSelectedLayerIndex(null);
  }, [setSelectedLayerIndex]); // Graph marker callbacks

  const markerUpdateHandler = useMemo(() => (position, datapoint) => {
    setTooltip({
      position: getTooltipPosition(isMobile, position),
      data: datapoint
    });
  }, [setTooltip, isMobile]);
  const markerHideHandler = useMemo(() => () => {
    setTooltip(null);
  }, [setTooltip]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(AreaGraph, {
    data: data,
    layerKeys: layerKeys,
    layerStroke: layerStroke,
    layerFill: layerFill,
    markerFill: markerFill,
    startTime: startTime,
    endTime: endTime,
    valueAxisLabel: valueAxisLabel,
    backgroundMouseMoveHandler: mouseMoveHandler,
    backgroundMouseOutHandler: mouseOutHandler,
    layerMouseMoveHandler: mouseMoveHandler,
    layerMouseOutHandler: mouseOutHandler,
    markerUpdateHandler: markerUpdateHandler,
    markerHideHandler: markerHideHandler,
    selectedTimeIndex: selectedTimeIndex,
    selectedLayerIndex: selectedLayerIndex,
    isMobile: isMobile,
    height: "8em"
  }), tooltip && /*#__PURE__*/React.createElement(CountryPanelEmissionsTooltip, {
    position: tooltip.position,
    data: tooltip.data,
    unit: valueAxisLabel,
    zoneData: tooltip.zoneData,
    onClose: () => {
      setSelectedLayerIndex(null);
      setTooltip(null);
    }
  }));
};

export default connect(mapStateToProps)(CountryHistoryEmissionsGraph);