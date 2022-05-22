import moment from "../pkg/moment.js";
import React, {useState, useMemo} from "../pkg/react.js";
import {connect} from "../pkg/react-redux.js";
import {max as d3Max} from "../pkg/d3-array.js";
import {scaleEnergy} from "../helpers/formatting.js";
import {useCo2ColorScale} from "../hooks/theme.js";
import {getTooltipPosition} from "../helpers/graph.js";
import {modeOrder, modeColor} from "../helpers/constants.js";
import {useCurrentZoneHistory, useCurrentZoneHistoryStartTime, useCurrentZoneHistoryEndTime} from "../hooks/redux.js";
import {dispatchApplication} from "../store.js";
import CountryPanelProductionTooltip from "./tooltips/countrypanelproductiontooltip.js";
import AreaGraph from "./graph/areagraph.js";
const getValuesInfo = (historyData) => {
  const maxTotalValue = d3Max(historyData, (d) => d3Max([d.totalPrimaryEnergyConsumptionTWh, d.totalPrimaryEnergyProductionTWh]));
  const format = scaleEnergy(maxTotalValue);
  const valueAxisLabel = format.unit;
  const valueFactor = format.formattingFactor;
  return {valueAxisLabel, valueFactor, maxTotalValue};
};
const prepareGraphData = (historyData, co2ColorScale, displayByEmissions, electricityMixMode, exchangeKeys = []) => {
  if (!historyData || !historyData[0]) {
    return {};
  }
  const {valueAxisLabel, valueFactor, maxTotalValue} = getValuesInfo(historyData);
  const key = electricityMixMode === "consumption" ? "primaryEnergyConsumptionTWh" : "primaryEnergyProductionTWh";
  const data = historyData.map((d) => {
    const obj = {
      datetime: moment(d.year.toString()).toDate()
    };
    modeOrder.forEach((k) => {
      const isStorage = k.indexOf("storage") !== -1;
      const value = isStorage ? -1 * Math.min(0, (d.storage || {})[k.replace(" storage", "")]) : (d[key] || {})[k];
      obj[k] = value / valueFactor;
      if (Number.isFinite(value) && displayByEmissions && obj[k] != null) {
      }
    });
    if (electricityMixMode === "consumption") {
    }
    obj.meta = d;
    return obj;
  });
  const layerKeys = modeOrder.concat(exchangeKeys);
  const layerFill = (k) => {
    if (exchangeKeys.includes(k)) {
      return (d) => co2ColorScale((d.data.meta.exchangeCo2Intensities || {})[k]);
    }
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
const mapStateToProps = (state) => ({
  displayByEmissions: state.application.tableDisplayEmissions,
  isMobile: state.application.isMobile,
  selectedTimeIndex: state.application.selectedZoneTimeIndex,
  carbonIntensityDomain: state.application.carbonIntensityDomain
});
const CountryHistoryMixGraph = ({displayByEmissions, electricityMixMode, isMobile, selectedTimeIndex}) => {
  const [tooltip, setTooltip] = useState(null);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(null);
  const co2ColorScale = useCo2ColorScale();
  const historyData = useCurrentZoneHistory();
  const startTime = useCurrentZoneHistoryStartTime();
  const endTime = useCurrentZoneHistoryEndTime();
  const {data, layerKeys, layerFill, valueAxisLabel, maxTotalValue} = useMemo(() => prepareGraphData(historyData, co2ColorScale, displayByEmissions, electricityMixMode), [historyData, co2ColorScale, displayByEmissions, electricityMixMode]);
  const backgroundMouseMoveHandler = useMemo(() => (timeIndex) => {
    dispatchApplication("selectedZoneTimeIndex", timeIndex);
  }, []);
  const backgroundMouseOutHandler = useMemo(() => () => {
    dispatchApplication("selectedZoneTimeIndex", null);
  }, []);
  const layerMouseMoveHandler = useMemo(() => (timeIndex, layerIndex) => {
    dispatchApplication("selectedZoneTimeIndex", timeIndex);
    setSelectedLayerIndex(layerIndex);
  }, [setSelectedLayerIndex]);
  const layerMouseOutHandler = useMemo(() => () => {
    dispatchApplication("selectedZoneTimeIndex", null);
    setSelectedLayerIndex(null);
  }, [setSelectedLayerIndex]);
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
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(AreaGraph, {
    data,
    layerKeys,
    layerFill,
    startTime,
    endTime,
    valueAxisLabel,
    backgroundMouseMoveHandler,
    backgroundMouseOutHandler,
    layerMouseMoveHandler,
    layerMouseOutHandler,
    markerUpdateHandler,
    markerHideHandler,
    selectedTimeIndex,
    selectedLayerIndex,
    isMobile,
    height: "10em",
    valueAxisMax: maxTotalValue
  }), tooltip && /* @__PURE__ */ React.createElement(CountryPanelProductionTooltip, {
    mode: tooltip.mode,
    position: tooltip.position,
    zoneData: tooltip.zoneData,
    electricityMixMode,
    onClose: () => {
      setSelectedLayerIndex(null);
      setTooltip(null);
    }
  }));
};
export default connect(mapStateToProps)(CountryHistoryMixGraph);
