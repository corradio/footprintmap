import moment from 'moment';
import React, { useMemo, useState } from 'react';
import getSymbolFromCurrency from 'currency-symbol-map';
import { max as d3Max } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { connect } from 'react-redux';
import { first } from 'lodash';

import { GDP_GRAPH_LAYER_KEY } from '../helpers/constants';
import formatting from '../helpers/formatting';

import AreaGraph from './graph/areagraph';
import Tooltip from './tooltip';

const GdpTooltip = connect((state) => {
  const { tooltipData, tooltipDisplayMode } = state.application;
  const visible = tooltipDisplayMode === GDP_GRAPH_LAYER_KEY;
  if (!visible) return { visible };
  const { year } = tooltipData;
  const value = tooltipData.gdpMillionsCurrentUSD;
  const format = formatting.scaleGdp(value);
  const valueAxisLabel = `${format.unit} (current)`;
  const valueFactor = format.formattingFactor;
  return { visible, value: `${year}: ${Math.round(value / valueFactor)} ${valueAxisLabel}` };
})(({ visible, value }) => (visible ? <Tooltip>{value}</Tooltip> : null));

const prepareGraphData = (historyData, colorBlindModeEnabled, electricityMixMode) => {
  if (!historyData || !historyData[0]) return {};

  // const currencySymbol = getSymbolFromCurrency(((first(historyData) || {}).price || {}).currency);

  const priceMaxValue = d3Max(historyData.map(d => d.gdpMillionsCurrentUSD));
  const priceColorScale = scaleLinear()
    .domain([0, priceMaxValue])
    .range(['yellow', 'red']);


  const format = formatting.scaleGdp(priceMaxValue);
  const valueAxisLabel = `${format.unit} (current)`;
  const valueFactor = format.formattingFactor;

  const data = historyData.map(d => ({
    [GDP_GRAPH_LAYER_KEY]: d.gdpMillionsCurrentUSD / valueFactor,
    datetime: moment(d.year.toString()).toDate(),
    // Keep a pointer to original data
    _countryData: d,
  }));

  const layerKeys = [GDP_GRAPH_LAYER_KEY];
  const layerStroke = () => 'darkgray';
  const layerFill = () => '#616161';
  const markerFill = key => d => priceColorScale(d.data[key]);

  return {
    data,
    layerKeys,
    layerStroke,
    layerFill,
    markerFill,
    valueAxisLabel,
  };
};

const mapStateToProps = state => ({
  colorBlindModeEnabled: state.application.colorBlindModeEnabled,
  electricityMixMode: state.application.electricityMixMode,
  startTime: getZoneHistoryStartTime(state),
  endTime: getZoneHistoryEndTime(state),
  historyData: getSelectedZoneHistory(state),
  isMobile: state.application.isMobile,
  selectedTimeIndex: state.application.selectedZoneTimeIndex,
});

const CountryHistoryPricesGraph = ({
  colorBlindModeEnabled,
  electricityMixMode,
  startTime,
  endTime,
  historyData,
  isMobile,
  selectedTimeIndex,
}) => {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(null);

  // Recalculate graph data only when the history data is changed
  const {
    data,
    layerKeys,
    layerStroke,
    layerFill,
    markerFill,
    valueAxisLabel,
  } = useMemo(
    () => prepareGraphData(historyData, colorBlindModeEnabled, electricityMixMode),
    [historyData, colorBlindModeEnabled, electricityMixMode]
  );

  // Mouse action handlers
  const backgroundMouseMoveHandler = useMemo(
    () => createSingleLayerGraphBackgroundMouseMoveHandler(isMobile, setSelectedLayerIndex),
    [isMobile, setSelectedLayerIndex]
  );
  const backgroundMouseOutHandler = useMemo(
    () => createSingleLayerGraphBackgroundMouseOutHandler(setSelectedLayerIndex),
    [setSelectedLayerIndex]
  );
  const layerMouseMoveHandler = useMemo(
    () => createGraphLayerMouseMoveHandler(isMobile, setSelectedLayerIndex),
    [isMobile, setSelectedLayerIndex]
  );
  const layerMouseOutHandler = useMemo(
    () => createGraphLayerMouseOutHandler(setSelectedLayerIndex),
    [setSelectedLayerIndex]
  );

  return (
    <React.Fragment>
      <AreaGraph
        data={data}
        layerKeys={layerKeys}
        layerStroke={layerStroke}
        layerFill={layerFill}
        markerFill={markerFill}
        startTime={startTime}
        endTime={endTime}
        valueAxisLabel={valueAxisLabel}
        backgroundMouseMoveHandler={backgroundMouseMoveHandler}
        backgroundMouseOutHandler={backgroundMouseOutHandler}
        layerMouseMoveHandler={layerMouseMoveHandler}
        layerMouseOutHandler={layerMouseOutHandler}
        selectedTimeIndex={selectedTimeIndex}
        selectedLayerIndex={selectedLayerIndex}
        isMobile={isMobile}
        height="6em"
      />
      <GdpTooltip />
    </React.Fragment>
  );
};

export default connect(mapStateToProps)(CountryHistoryPricesGraph);
