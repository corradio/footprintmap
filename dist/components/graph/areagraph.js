import React, {useRef, useMemo} from "../../pkg/react.js";
import {first, last, max, min, filter, flattenDeep, isFinite, isEmpty} from "../../pkg/lodash.js";
import {scaleTime, scaleLinear} from "../../pkg/d3-scale.js";
import {stack, stackOffsetDiverging} from "../../pkg/d3-shape.js";
import moment from "../../pkg/moment.js";
import AreaGraphLayers from "./areagraphlayers.js";
import GraphBackground from "./graphbackground.js";
import GraphHoverLine from "./graphhoverline.js";
import ValueAxis from "./valueaxis.js";
import TimeAxis from "./timeaxis.js";
import {useWidthObserver, useHeightObserver} from "../../hooks/viewport.js";
const X_AXIS_HEIGHT = 20;
const Y_AXIS_WIDTH = 40;
const Y_AXIS_PADDING = 4;
const getDatetimes = (data) => (data || []).map((d) => d.datetime);
const getTimeScale = (width, datetimes, startTime, endTime) => scaleTime().domain([
  startTime ? moment(startTime).toDate() : first(datetimes),
  endTime ? moment(endTime).toDate() : last(datetimes)
]).range([0, width]);
const getTotalValues = (layers, valueAxisMax) => {
  const values = filter(flattenDeep(layers.map((layer) => layer.datapoints.map((d) => d[1]))), isFinite);
  return {
    min: min(values) || 0,
    max: valueAxisMax || max(values) || 0
  };
};
const getValueScale = (height, totalValues) => scaleLinear().domain([Math.min(0, 1.1 * totalValues.min), Math.max(0, 1.1 * totalValues.max)]).range([height, Y_AXIS_PADDING]);
const getLayers = (data, layerKeys, layerStroke, layerFill, markerFill) => {
  if (!data || !data[0]) {
    return [];
  }
  const stackedData = stack().offset(stackOffsetDiverging).keys(layerKeys)(data);
  return layerKeys.map((key, ind) => ({
    key,
    stroke: layerStroke ? layerStroke(key) : "none",
    fill: layerFill(key),
    markerFill: markerFill ? markerFill(key) : layerFill(key),
    datapoints: stackedData[ind]
  }));
};
const AreaGraph = React.memo(({
  data,
  layerKeys,
  layerStroke,
  layerFill,
  markerFill,
  startTime,
  endTime,
  valueAxisLabel,
  valueAxisMax,
  backgroundMouseMoveHandler,
  backgroundMouseOutHandler,
  layerMouseMoveHandler,
  layerMouseOutHandler,
  markerUpdateHandler,
  markerHideHandler,
  selectedTimeIndex,
  selectedLayerIndex,
  isMobile,
  height = "10em"
}) => {
  const ref = useRef(null);
  const containerWidth = useWidthObserver(ref, Y_AXIS_WIDTH);
  const containerHeight = useHeightObserver(ref, X_AXIS_HEIGHT);
  const layers = useMemo(() => getLayers(data, layerKeys, layerStroke, layerFill, markerFill), [data, layerKeys, layerStroke, layerFill, markerFill]);
  const totalValues = useMemo(() => getTotalValues(layers, valueAxisMax), [layers, valueAxisMax]);
  const valueScale = useMemo(() => getValueScale(containerHeight, totalValues), [containerHeight, totalValues]);
  const datetimes = useMemo(() => getDatetimes(data), [data]);
  const timeScale = useMemo(() => getTimeScale(containerWidth, datetimes, startTime, endTime), [containerWidth, datetimes, startTime, endTime]);
  if (isEmpty(layers)) {
    return null;
  }
  return /* @__PURE__ */ React.createElement("svg", {
    height,
    ref,
    style: {overflow: "visible"}
  }, /* @__PURE__ */ React.createElement(TimeAxis, {
    scale: timeScale,
    transform: `translate(-1 ${containerHeight - 1})`,
    className: "x axis"
  }), /* @__PURE__ */ React.createElement(ValueAxis, {
    scale: valueScale,
    label: valueAxisLabel,
    width: containerWidth,
    height: containerHeight
  }), /* @__PURE__ */ React.createElement(GraphBackground, {
    timeScale,
    valueScale,
    datetimes,
    mouseMoveHandler: backgroundMouseMoveHandler,
    mouseOutHandler: backgroundMouseOutHandler,
    isMobile,
    svgRef: ref
  }), /* @__PURE__ */ React.createElement(AreaGraphLayers, {
    layers,
    datetimes,
    timeScale,
    valueScale,
    mouseMoveHandler: layerMouseMoveHandler,
    mouseOutHandler: layerMouseOutHandler,
    isMobile,
    svgRef: ref
  }), /* @__PURE__ */ React.createElement(GraphHoverLine, {
    layers,
    timeScale,
    valueScale,
    datetimes,
    markerUpdateHandler,
    markerHideHandler,
    selectedLayerIndex,
    selectedTimeIndex,
    svgRef: ref
  }));
});
export default AreaGraph;
