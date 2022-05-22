import moment from "../pkg/moment.js";
import React, {useMemo, useState} from "../pkg/react.js";
import {connect} from "../pkg/react-redux.js";
import {max as d3Max} from "../pkg/d3-array.js";
import {scaleLinear} from "../pkg/d3-scale.js";
import {getTooltipPosition} from "../helpers/graph.js";
import {scaleMillions} from "../helpers/formatting.js";
import {dispatchApplication} from "../store.js";
import {useCurrentZoneHistory, useCurrentZoneHistoryStartTime, useCurrentZoneHistoryEndTime} from "../hooks/redux.js";
import AreaGraph from "./graph/areagraph.js";
import Tooltip from "./tooltip.js";
const GdpTooltip = ({position, zoneData, onClose}) => {
  if (!zoneData) {
    return null;
  }
  const {year} = zoneData;
  const value = zoneData.gdpMillionsCurrentUSD;
  const format = scaleMillions(value);
  const valueAxisLabel = `${format.unit} $ (current)`;
  const valueFactor = format.formattingFactor;
  return /* @__PURE__ */ React.createElement(Tooltip, {
    id: "price-tooltip",
    position,
    onClose
  }, year, ": ", /* @__PURE__ */ React.createElement("b", null, Math.round(value / valueFactor)), " ", valueAxisLabel);
};
const prepareGraphData = (historyData) => {
  if (!historyData || !historyData[0]) {
    return {};
  }
  const priceMaxValue = d3Max(historyData.map((d) => d.gdpMillionsCurrentUSD));
  const colorScale = scaleLinear().domain([0, priceMaxValue]).range(["yellow", "red"]);
  const format = scaleMillions(priceMaxValue);
  const valueAxisLabel = `${format.unit} $ (current)`;
  const valueFactor = format.formattingFactor;
  const data = historyData.map((d) => ({
    gdp: d.gdpMillionsCurrentUSD / valueFactor,
    datetime: moment(d.year.toString()).toDate(),
    meta: d
  }));
  const layerKeys = ["gdp"];
  const layerStroke = () => "darkgray";
  const layerFill = () => "#616161";
  const markerFill = (key) => (d) => colorScale(d.data[key]);
  return {
    data,
    layerKeys,
    layerStroke,
    layerFill,
    markerFill,
    valueAxisLabel
  };
};
const mapStateToProps = (state) => ({
  isMobile: state.application.isMobile,
  selectedTimeIndex: state.application.selectedZoneTimeIndex
});
const CountryHistoryPricesGraph = ({isMobile, selectedTimeIndex}) => {
  const [tooltip, setTooltip] = useState(null);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(null);
  const historyData = useCurrentZoneHistory();
  const startTime = useCurrentZoneHistoryStartTime();
  const endTime = useCurrentZoneHistoryEndTime();
  const {data, layerKeys, layerStroke, layerFill, markerFill, valueAxisLabel} = useMemo(() => prepareGraphData(historyData), [historyData]);
  const mouseMoveHandler = useMemo(() => (timeIndex) => {
    dispatchApplication("selectedZoneTimeIndex", timeIndex);
    setSelectedLayerIndex(0);
  }, [setSelectedLayerIndex]);
  const mouseOutHandler = useMemo(() => () => {
    dispatchApplication("selectedZoneTimeIndex", null);
    setSelectedLayerIndex(null);
  }, [setSelectedLayerIndex]);
  const markerUpdateHandler = useMemo(() => (position, datapoint) => {
    setTooltip({
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
    layerStroke,
    layerFill,
    markerFill,
    startTime,
    endTime,
    valueAxisLabel,
    backgroundMouseMoveHandler: mouseMoveHandler,
    backgroundMouseOutHandler: mouseOutHandler,
    layerMouseMoveHandler: mouseMoveHandler,
    layerMouseOutHandler: mouseOutHandler,
    markerUpdateHandler,
    markerHideHandler,
    selectedTimeIndex,
    selectedLayerIndex,
    isMobile,
    height: "6em"
  }), tooltip && /* @__PURE__ */ React.createElement(GdpTooltip, {
    position: tooltip.position,
    zoneData: tooltip.zoneData,
    onClose: () => {
      setSelectedLayerIndex(null);
      setTooltip(null);
    }
  }));
};
export default connect(mapStateToProps)(CountryHistoryPricesGraph);
