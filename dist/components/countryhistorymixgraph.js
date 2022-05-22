import moment from '../pkg/moment.js';
import React, { useState, useMemo } from '../pkg/react.js';
import { connect } from '../pkg/react-redux.js';
import { max as d3Max } from '../pkg/d3-array.js';
import { scaleEnergy } from '../helpers/formatting.js';
import { useCo2ColorScale } from '../hooks/theme.js';
import { getTooltipPosition } from '../helpers/graph.js';
import { modeOrder, modeColor } from '../helpers/constants.js';
import { useCurrentZoneHistory, useCurrentZoneHistoryStartTime, useCurrentZoneHistoryEndTime, useCurrentZoneExchangeKeys } from '../hooks/redux.js';
import { dispatchApplication } from '../store.js';
import CountryPanelProductionTooltip from './tooltips/countrypanelproductiontooltip.js';
import CountryPanelExchangeTooltip from './tooltips/countrypanelexchangetooltip.js';
import AreaGraph from './graph/areagraph.js';

const getValuesInfo = historyData => {
  const maxTotalValue = d3Max(historyData, d => d3Max([d.totalPrimaryEnergyConsumptionTWh, d.totalPrimaryEnergyProductionTWh]));
  const format = scaleEnergy(maxTotalValue);
  const valueAxisLabel = format.unit;
  const valueFactor = format.formattingFactor;
  return {
    valueAxisLabel,
    valueFactor,
    maxTotalValue
  };
};

const prepareGraphData = (historyData, co2ColorScale, displayByEmissions, electricityMixMode, exchangeKeys = []) => {
  if (!historyData || !historyData[0]) return {};
  const {
    valueAxisLabel,
    valueFactor,
    maxTotalValue
  } = getValuesInfo(historyData);
  const key = electricityMixMode === 'consumption' ? 'primaryEnergyConsumptionTWh' : 'primaryEnergyProductionTWh'; // Format history data received by the API
  // TODO: Simplify this function and make it more readable

  const data = historyData.map(d => {
    const obj = {
      datetime: moment(d.year.toString()).toDate()
    }; // Add production

    modeOrder.forEach(k => {
      const isStorage = k.indexOf('storage') !== -1;
      const value = isStorage ? -1 * Math.min(0, (d.storage || {})[k.replace(' storage', '')]) : (d[key] || {})[k]; // in GW or MW

      obj[k] = value / valueFactor;

      if (Number.isFinite(value) && displayByEmissions && obj[k] != null) {// in tCO₂eq/min
        // if (isStorage && obj[k] >= 0) {
        //   obj[k] *= (d.dischargeCo2Intensities || {})[k.replace(' storage', '')] / 1e3 / 60.0;
        // } else {
        //   obj[k] *= (d.productionCo2Intensities || {})[k] / 1e3 / 60.0;
        // }
      }
    });

    if (electricityMixMode === 'consumption') {// Add exchange
      // forEach(d.exchange, (value, key) => {
      //   // in GW or MW
      //   obj[key] = Math.max(0, value / valueFactor);
      //   if (Number.isFinite(value) && displayByEmissions && obj[key] != null) {
      //     // in tCO₂eq/min
      //     obj[key] *= (d.exchangeCo2Intensities || {})[key] / 1e3 / 60.0;
      //   }
      // });
    } // Keep a pointer to original data


    obj.meta = d;
    return obj;
  }); // Show the exchange layers (if they exist) on top of the standard sources.

  const layerKeys = modeOrder.concat(exchangeKeys);

  const layerFill = k => {
    // If exchange layer, set the horizontal gradient by using a different fill for each datapoint.
    if (exchangeKeys.includes(k)) {
      return d => co2ColorScale((d.data.meta.exchangeCo2Intensities || {})[k]);
    } // Otherwise use regular production fill.


    return modeColor[k];
  };

  return {
    data,
    layerKeys,
    layerFill,
    valueAxisLabel,
    maxTotalValue: maxTotalValue / valueFactor
  };
};

const mapStateToProps = state => ({
  displayByEmissions: state.application.tableDisplayEmissions,
  isMobile: state.application.isMobile,
  selectedTimeIndex: state.application.selectedZoneTimeIndex,
  carbonIntensityDomain: state.application.carbonIntensityDomain
});

const CountryHistoryMixGraph = ({
  displayByEmissions,
  electricityMixMode,
  isMobile,
  selectedTimeIndex
}) => {
  const [tooltip, setTooltip] = useState(null);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(null);
  const co2ColorScale = useCo2ColorScale();
  const historyData = useCurrentZoneHistory();
  const exchangeKeys = useCurrentZoneExchangeKeys();
  const startTime = useCurrentZoneHistoryStartTime();
  const endTime = useCurrentZoneHistoryEndTime(); // Recalculate graph data only when the history data is changed

  const {
    data,
    layerKeys,
    layerFill,
    valueAxisLabel,
    maxTotalValue
  } = useMemo(() => prepareGraphData(historyData, co2ColorScale, displayByEmissions, electricityMixMode), [historyData, co2ColorScale, displayByEmissions, electricityMixMode]); // Mouse action handlers

  const backgroundMouseMoveHandler = useMemo(() => timeIndex => {
    dispatchApplication('selectedZoneTimeIndex', timeIndex);
  }, []);
  const backgroundMouseOutHandler = useMemo(() => () => {
    dispatchApplication('selectedZoneTimeIndex', null);
  }, []);
  const layerMouseMoveHandler = useMemo(() => (timeIndex, layerIndex) => {
    dispatchApplication('selectedZoneTimeIndex', timeIndex);
    setSelectedLayerIndex(layerIndex);
  }, [setSelectedLayerIndex]);
  const layerMouseOutHandler = useMemo(() => () => {
    dispatchApplication('selectedZoneTimeIndex', null);
    setSelectedLayerIndex(null);
  }, [setSelectedLayerIndex]); // Graph marker callbacks

  const markerUpdateHandler = useMemo(() => (position, datapoint, layerKey) => {
    setTooltip({
      mode: layerKey,
      position: getTooltipPosition(isMobile, position),
      zoneData: datapoint.meta
    });
  }, [setTooltip, isMobile]);
  const markerHideHandler = useMemo(() => () => {
    setTooltip(null);
  }, [setTooltip]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(AreaGraph, {
    data: data,
    layerKeys: layerKeys,
    layerFill: layerFill,
    startTime: startTime,
    endTime: endTime,
    valueAxisLabel: valueAxisLabel,
    backgroundMouseMoveHandler: backgroundMouseMoveHandler,
    backgroundMouseOutHandler: backgroundMouseOutHandler,
    layerMouseMoveHandler: layerMouseMoveHandler,
    layerMouseOutHandler: layerMouseOutHandler,
    markerUpdateHandler: markerUpdateHandler,
    markerHideHandler: markerHideHandler,
    selectedTimeIndex: selectedTimeIndex,
    selectedLayerIndex: selectedLayerIndex,
    isMobile: isMobile,
    height: "10em",
    valueAxisMax: maxTotalValue
  }), tooltip && (exchangeKeys.includes(tooltip.mode) ? /*#__PURE__*/React.createElement(CountryPanelExchangeTooltip, {
    exchangeKey: tooltip.mode,
    position: tooltip.position,
    zoneData: tooltip.zoneData,
    onClose: () => {
      setSelectedLayerIndex(null);
      setTooltip(null);
    }
  }) : /*#__PURE__*/React.createElement(CountryPanelProductionTooltip, {
    mode: tooltip.mode,
    position: tooltip.position,
    zoneData: tooltip.zoneData,
    electricityMixMode: electricityMixMode,
    onClose: () => {
      setSelectedLayerIndex(null);
      setTooltip(null);
    }
  })));
};

export default connect(mapStateToProps)(CountryHistoryMixGraph);