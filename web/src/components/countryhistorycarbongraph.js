import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { getTooltipPosition } from '../helpers/graph';
import { useCo2ColorScale } from '../hooks/theme';
import { useCurrentZoneHistory, useCurrentZoneHistoryStartTime, useCurrentZoneHistoryEndTime } from '../hooks/redux';
import { dispatchApplication } from '../store';

import MapCountryTooltip from './tooltips/mapcountrytooltip';
import { formatCarbonIntensityUnit } from '../helpers/formatting';
import AreaGraph from './graph/areagraph';
import { getZoneCarbonIntensity } from '../helpers/zonedata';

const prepareGraphData = (historyData, co2ColorScale, electricityMixMode, carbonIntensityDomain) => {
  if (!historyData || !historyData[0]) {
    return {};
  }

  const data = historyData.map((d) => ({
    carbonIntensity: getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, d),
    datetime: moment(d.year.toString()).toDate(),
    // Keep a pointer to original data
    meta: d,
  }));
  const layerKeys = ['carbonIntensity'];
  const layerFill = (key) => (d) => co2ColorScale(d.data[key]);
  return { data, layerKeys, layerFill };
};

const mapStateToProps = (state) => ({
  electricityMixMode: state.application.electricityMixMode,
  isMobile: state.application.isMobile,
  selectedTimeIndex: state.application.selectedZoneTimeIndex,
  carbonIntensityDomain: state.application.carbonIntensityDomain,
});

const CountryHistoryCarbonGraph = ({
  electricityMixMode,
  isMobile,
  selectedTimeIndex,

  carbonIntensityDomain,
}) => {
  const [tooltip, setTooltip] = useState(null);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(null);
  const co2ColorScale = useCo2ColorScale();

  const historyData = useCurrentZoneHistory();
  const startTime = useCurrentZoneHistoryStartTime();
  const endTime = useCurrentZoneHistoryEndTime();

  // Recalculate graph data only when the history data is changed
  const { data, layerKeys, layerFill } = useMemo(
    () => prepareGraphData(historyData, co2ColorScale, electricityMixMode, carbonIntensityDomain),
    [historyData, co2ColorScale, electricityMixMode, carbonIntensityDomain]
  );

  // Mouse action handlers
  const mouseMoveHandler = useMemo(
    () => (timeIndex) => {
      dispatchApplication('selectedZoneTimeIndex', timeIndex);
      setSelectedLayerIndex(0); // Select the first (and only) layer even when hovering over graph background.
    },
    [setSelectedLayerIndex]
  );
  const mouseOutHandler = useMemo(
    () => () => {
      dispatchApplication('selectedZoneTimeIndex', null);
      setSelectedLayerIndex(null);
    },
    [setSelectedLayerIndex]
  );
  // Graph marker callbacks
  const markerUpdateHandler = useMemo(
    () => (position, datapoint) => {
      setTooltip({
        position: getTooltipPosition(isMobile, position),
        zoneData: datapoint.meta,
      });
    },
    [setTooltip, isMobile]
  );
  const markerHideHandler = useMemo(
    () => () => {
      setTooltip(null);
    },
    [setTooltip]
  );

  return (
    <React.Fragment>
      <AreaGraph
        data={data}
        layerKeys={layerKeys}
        layerFill={layerFill}
        startTime={startTime}
        endTime={endTime}
        valueAxisLabel={formatCarbonIntensityUnit(carbonIntensityDomain)}
        backgroundMouseMoveHandler={mouseMoveHandler}
        backgroundMouseOutHandler={mouseOutHandler}
        layerMouseMoveHandler={mouseMoveHandler}
        layerMouseOutHandler={mouseOutHandler}
        markerUpdateHandler={markerUpdateHandler}
        markerHideHandler={markerHideHandler}
        selectedTimeIndex={selectedTimeIndex}
        selectedLayerIndex={selectedLayerIndex}
        isMobile={isMobile}
        height="8em"
      />
      {tooltip && (
        <MapCountryTooltip
          position={tooltip.position}
          zoneData={tooltip.zoneData}
          onClose={() => {
            setSelectedLayerIndex(null);
            setTooltip(null);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default connect(mapStateToProps)(CountryHistoryCarbonGraph);
