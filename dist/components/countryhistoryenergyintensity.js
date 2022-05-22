import moment from '../pkg/moment.js';
import React, { useMemo, useState } from '../pkg/react.js';
import { connect } from '../pkg/react-redux.js';
import { max as d3Max } from '../pkg/d3-array.js';
import { scaleLinear } from '../pkg/d3-scale.js';
import { getTooltipPosition } from '../helpers/graph.js';
import { scaleMillionsShort } from '../helpers/formatting.js';
import { dispatchApplication } from '../store.js';
import { useCurrentZoneHistory, useCurrentZoneHistoryStartTime, useCurrentZoneHistoryEndTime } from '../hooks/redux.js';
import AreaGraph from './graph/areagraph.js';
import Tooltip from './tooltip.js';

const ThisTooltip = ({
  position,
  zoneData,
  intensity,
  valueAxisLabel
}) => {
  if (!zoneData) return null;
  const {
    year
  } = zoneData;
  return /*#__PURE__*/React.createElement(Tooltip, {
    id: "price-tooltip",
    position: position
  }, year, ":", /*#__PURE__*/React.createElement("b", null, Math.round(intensity * 10) / 10), ' ', valueAxisLabel);
};

const prepareGraphData = historyData => {
  if (!historyData || !historyData[0]) return {}; // const currencySymbol = getSymbolFromCurrency(((first(historyData) || {}).price || {}).currency);

  const priceMaxValue = d3Max(historyData.map(d => d.kaya.energyIntensityWhPerCurrentUSD));
  const colorScale = scaleLinear().domain([0, priceMaxValue]).range(['yellow', 'red']);
  const format = scaleMillionsShort(priceMaxValue / 1e6);
  const valueAxisLabel = `${format.unit}Wh per $`;
  const valueFactor = format.formattingFactor * 1e6;
  const data = historyData.map(d => ({
    intensity: d.kaya.energyIntensityWhPerCurrentUSD / valueFactor,
    datetime: moment(d.year.toString()).toDate(),
    // Keep a pointer to original data
    meta: d
  }));
  const layerKeys = ['intensity'];

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
  selectedTimeIndex: state.application.selectedZoneTimeIndex
});

const CountryHistoryEnergyIntensity = ({
  isMobile,
  selectedTimeIndex
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
  } = useMemo(() => prepareGraphData(historyData), [historyData]); // Mouse action handlers

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
      zoneData: datapoint.meta,
      intensity: datapoint.intensity
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
    height: "6em"
  }), tooltip && /*#__PURE__*/React.createElement(ThisTooltip, {
    position: tooltip.position,
    zoneData: tooltip.zoneData,
    valueAxisLabel: valueAxisLabel,
    intensity: tooltip.intensity
  }));
};

export default connect(mapStateToProps)(CountryHistoryEnergyIntensity);