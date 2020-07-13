import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { max as d3Max } from 'd3-array';
import { scaleLinear } from 'd3-scale';

import { getTooltipPosition } from '../helpers/graph';
import { scaleMillionsShort } from '../helpers/formatting';
import { dispatchApplication } from '../store';
import {
  useCurrentZoneHistory,
  useCurrentZoneHistoryStartTime,
  useCurrentZoneHistoryEndTime,
} from '../hooks/redux';

import AreaGraph from './graph/areagraph';
import Tooltip from './tooltip';

const ThisTooltip = ({
  position, zoneData, intensity, valueAxisLabel,
}) => {
  if (!zoneData) return null;

  const { year } = zoneData;

  return (
    <Tooltip id="price-tooltip" position={position}>
      {year}
:
      <b>{Math.round(intensity * 10) / 10}</b>
      {' '}
      {valueAxisLabel}
    </Tooltip>
  );
};

const prepareGraphData = (historyData) => {
  if (!historyData || !historyData[0]) return {};

  // const currencySymbol = getSymbolFromCurrency(((first(historyData) || {}).price || {}).currency);

  const priceMaxValue = d3Max(historyData.map(d => d.kaya.energyIntensityWhPerCurrentUSD));
  const colorScale = scaleLinear()
    .domain([0, priceMaxValue])
    .range(['yellow', 'red']);


  const format = scaleMillionsShort(priceMaxValue / 1e6);
  const valueAxisLabel = `${format.unit}Wh per $`;
  const valueFactor = format.formattingFactor * 1e6;

  const data = historyData.map(d => ({
    intensity: d.kaya.energyIntensityWhPerCurrentUSD / valueFactor,
    datetime: moment(d.year.toString()).toDate(),
    // Keep a pointer to original data
    meta: d,
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
    valueAxisLabel,
  };
};

const mapStateToProps = state => ({
  isMobile: state.application.isMobile,
  selectedTimeIndex: state.application.selectedZoneTimeIndex,
});

const CountryHistoryEnergyIntensity = ({
  isMobile,
  selectedTimeIndex,
}) => {
  const [tooltip, setTooltip] = useState(null);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(null);

  const historyData = useCurrentZoneHistory();
  const startTime = useCurrentZoneHistoryStartTime();
  const endTime = useCurrentZoneHistoryEndTime();

  // Recalculate graph data only when the history data is changed
  const {
    data,
    layerKeys,
    layerStroke,
    layerFill,
    markerFill,
    valueAxisLabel,
  } = useMemo(
    () => prepareGraphData(historyData),
    [historyData],
  );

  // Mouse action handlers
  const mouseMoveHandler = useMemo(
    () => (timeIndex) => {
      dispatchApplication('selectedZoneTimeIndex', timeIndex);
      setSelectedLayerIndex(0); // Select the first (and only) layer even when hovering over graph background.
    },
    [setSelectedLayerIndex],
  );
  const mouseOutHandler = useMemo(
    () => () => {
      dispatchApplication('selectedZoneTimeIndex', null);
      setSelectedLayerIndex(null);
    },
    [setSelectedLayerIndex],
  );
  // Graph marker callbacks
  const markerUpdateHandler = useMemo(
    () => (position, datapoint) => {
      setTooltip({
        position: getTooltipPosition(isMobile, position),
        zoneData: datapoint.meta,
        intensity: datapoint.intensity,
      });
    },
    [setTooltip, isMobile],
  );
  const markerHideHandler = useMemo(
    () => () => {
      setTooltip(null);
    },
    [setTooltip],
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
        backgroundMouseMoveHandler={mouseMoveHandler}
        backgroundMouseOutHandler={mouseOutHandler}
        layerMouseMoveHandler={mouseMoveHandler}
        layerMouseOutHandler={mouseOutHandler}
        markerUpdateHandler={markerUpdateHandler}
        markerHideHandler={markerHideHandler}
        selectedTimeIndex={selectedTimeIndex}
        selectedLayerIndex={selectedLayerIndex}
        isMobile={isMobile}
        height="6em"
      />
      {tooltip && (
        <ThisTooltip
          position={tooltip.position}
          zoneData={tooltip.zoneData}
          valueAxisLabel={valueAxisLabel}
          intensity={tooltip.intensity}
        />
      )}
    </React.Fragment>
  );
};

export default connect(mapStateToProps)(CountryHistoryEnergyIntensity);
