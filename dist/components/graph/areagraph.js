import React, { useRef, useMemo } from '../../pkg/react.js';
import { first, last, max, min, filter, flattenDeep, isFinite, isEmpty } from '../../pkg/lodash.js';
import { scaleTime, scaleLinear } from '../../pkg/d3-scale.js';
import { stack, stackOffsetDiverging } from '../../pkg/d3-shape.js';
import moment from '../../pkg/moment.js';
import AreaGraphLayers from './areagraphlayers.js';
import GraphBackground from './graphbackground.js';
import GraphHoverLine from './graphhoverline.js';
import ValueAxis from './valueaxis.js';
import TimeAxis from './timeaxis.js';
import { useWidthObserver, useHeightObserver } from '../../hooks/viewport.js';
const X_AXIS_HEIGHT = 20;
const Y_AXIS_WIDTH = 40;
const Y_AXIS_PADDING = 4;

const getDatetimes = data => (data || []).map(d => d.datetime);

const getTimeScale = (width, datetimes, startTime, endTime) => scaleTime().domain([startTime ? moment(startTime).toDate() : first(datetimes), endTime ? moment(endTime).toDate() : last(datetimes)]).range([0, width]);

const getTotalValues = (layers, valueAxisMax) => {
  const values = filter(flattenDeep(layers.map(layer => layer.datapoints.map(d => d[1]))), isFinite);
  return {
    min: min(values) || 0,
    max: valueAxisMax || max(values) || 0
  };
};

const getValueScale = (height, totalValues) => scaleLinear().domain([Math.min(0, 1.1 * totalValues.min), Math.max(0, 1.1 * totalValues.max)]).range([height, Y_AXIS_PADDING]);

const getLayers = (data, layerKeys, layerStroke, layerFill, markerFill) => {
  if (!data || !data[0]) return [];
  const stackedData = stack().offset(stackOffsetDiverging).keys(layerKeys)(data);
  return layerKeys.map((key, ind) => ({
    key,
    stroke: layerStroke ? layerStroke(key) : 'none',
    fill: layerFill(key),
    markerFill: markerFill ? markerFill(key) : layerFill(key),
    datapoints: stackedData[ind]
  }));
};

const AreaGraph = /*#__PURE__*/React.memo(({
  /*
    `data` should be an array of objects, each containing:
      * a numerical value for every key appearing in `layerKeys`
      * `datetime` timestamp
  */
  data,

  /*
    `layerKey` should be an array of strings denoting the graph layers (in bottom-to-top order).
  */
  layerKeys,

  /*
    `layerStroke` should be a function mapping each layer key into a string value representing the layer's stroke color.
  */
  layerStroke,

  /*
    `layerFill` should be a function that maps each layer key into one of the following:
      * a string value representing the layer's fill color if it's homogenous
      * a function mapping each layer's data point to a string color value, rendering a horizontal gradient
  */
  layerFill,

  /*
    `markerFill` is an optional prop of that same format that overrides `layerFill` for the graph focal point fill.
  */
  markerFill,

  /*
    `startTime` and `endTime` are timestamps denoting the time interval of the rendered part of the graph.
    If not provided, they'll be inferred from timestamps of the first/last datapoints.
  */
  startTime,
  endTime,

  /*
    `valueAxisLabel` is a string label for the values (Y-axis) scale.
  */
  valueAxisLabel,

  /*
    `valueAxisMax` is an optional integer for the max value (Y-axis) scale.
  */
  valueAxisMax,

  /*
    Mouse event callbacks for the graph background and individual layers respectively.
  */
  backgroundMouseMoveHandler,
  backgroundMouseOutHandler,
  layerMouseMoveHandler,
  layerMouseOutHandler,

  /*
    Marker hooks that get called when the marker selection gets updated or hidden
  */
  markerUpdateHandler,
  markerHideHandler,

  /*
    `selectedTimeIndex` is am integer value representing the time index of the datapoint in focus.
  */
  selectedTimeIndex,

  /*
    `selectedLayerIndex` is an integer value representing the layer index of the datapoint in focus.
  */
  selectedLayerIndex,

  /*
    If `isMobile` is true, the mouse hover events are triggered by clicks only.
  */
  isMobile,

  /*
    Height of the area graph canvas.
  */
  height = '10em'
}) => {
  const ref = useRef(null);
  const containerWidth = useWidthObserver(ref, Y_AXIS_WIDTH);
  const containerHeight = useHeightObserver(ref, X_AXIS_HEIGHT); // Build layers

  const layers = useMemo(() => getLayers(data, layerKeys, layerStroke, layerFill, markerFill), [data, layerKeys, layerStroke, layerFill, markerFill]); // Generate graph scales

  const totalValues = useMemo(() => getTotalValues(layers, valueAxisMax), [layers, valueAxisMax]);
  const valueScale = useMemo(() => getValueScale(containerHeight, totalValues), [containerHeight, totalValues]);
  const datetimes = useMemo(() => getDatetimes(data), [data]);
  const timeScale = useMemo(() => getTimeScale(containerWidth, datetimes, startTime, endTime), [containerWidth, datetimes, startTime, endTime]); // Don't render the graph at all if no layers are present

  if (isEmpty(layers)) return null;
  return /*#__PURE__*/React.createElement("svg", {
    height: height,
    ref: ref,
    style: {
      overflow: 'visible'
    }
  }, /*#__PURE__*/React.createElement(TimeAxis, {
    scale: timeScale,
    transform: `translate(-1 ${containerHeight - 1})`,
    className: "x axis"
  }), /*#__PURE__*/React.createElement(ValueAxis, {
    scale: valueScale,
    label: valueAxisLabel,
    width: containerWidth,
    height: containerHeight
  }), /*#__PURE__*/React.createElement(GraphBackground, {
    timeScale: timeScale,
    valueScale: valueScale,
    datetimes: datetimes,
    mouseMoveHandler: backgroundMouseMoveHandler,
    mouseOutHandler: backgroundMouseOutHandler,
    isMobile: isMobile,
    svgRef: ref
  }), /*#__PURE__*/React.createElement(AreaGraphLayers, {
    layers: layers,
    datetimes: datetimes,
    timeScale: timeScale,
    valueScale: valueScale,
    mouseMoveHandler: layerMouseMoveHandler,
    mouseOutHandler: layerMouseOutHandler,
    isMobile: isMobile,
    svgRef: ref
  }), /*#__PURE__*/React.createElement(GraphHoverLine, {
    layers: layers,
    timeScale: timeScale,
    valueScale: valueScale,
    datetimes: datetimes,
    markerUpdateHandler: markerUpdateHandler,
    markerHideHandler: markerHideHandler,
    selectedLayerIndex: selectedLayerIndex,
    selectedTimeIndex: selectedTimeIndex,
    svgRef: ref
  }));
});
export default AreaGraph;