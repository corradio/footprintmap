import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { max as d3Max } from 'd3-array';
import { scaleLinear } from 'd3-scale';

import { getTooltipPosition } from '../helpers/graph';
import { scaleGdp } from '../helpers/formatting';
import { dispatchApplication } from '../store';
import {
  useCurrentZoneHistory,
  useCurrentZoneHistoryStartTime,
  useCurrentZoneHistoryEndTime,
} from '../hooks/redux';

import AreaGraph from './graph/areagraph';
import Tooltip from './tooltip';

const GdpTooltip = ({ position, zoneData }) => {
  if (!zoneData) return null;

  const { year } = zoneData;
  const value = zoneData.gdpMillionsCurrentUSD;
  const format = scaleGdp(value);
  const valueAxisLabel = `${format.unit} (current)`;
  const valueFactor = format.formattingFactor;

  return (
    <Tooltip id="price-tooltip" position={position}>
      {year}: {Math.round(value / valueFactor)} {valueAxisLabel}
    </Tooltip>
  );
};

const prepareGraphData = (historyData) => {
  if (!historyData || !historyData[0]) return {};

  // const currencySymbol = getSymbolFromCurrency(((first(historyData) || {}).price || {}).currency);

  const priceMaxValue = d3Max(historyData.map(d => d.gdpMillionsCurrentUSD));
  const colorScale = scaleLinear()
    .domain([0, priceMaxValue])
    .range(['yellow', 'red']);


  const format = scaleGdp(priceMaxValue);
  const valueAxisLabel = `${format.unit} (current)`;
  const valueFactor = format.formattingFactor;

  const data = historyData.map(d => ({
    gdp: d.gdpMillionsCurrentUSD / valueFactor,
    datetime: moment(d.year.toString()).toDate(),
    // Keep a pointer to original data
    meta: d,
  }));

  const layerKeys = ['gdp'];
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
  displayByEmissions: state.application.tableDisplayEmissions,
  electricityMixMode: state.application.electricityMixMode,
  isMobile: state.application.isMobile,
  selectedTimeIndex: state.application.selectedZoneTimeIndex,
  carbonIntensityDomain: state.application.carbonIntensityDomain,
});

const CountryHistoryPricesGraph = ({
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
        <GdpTooltip
          position={tooltip.position}
          zoneData={tooltip.zoneData}
        />
      )}
    </React.Fragment>
  );
};

export default connect(mapStateToProps)(CountryHistoryPricesGraph);
