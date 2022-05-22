import React, {useRef} from "../pkg/react.js";
import {range, isFinite} from "../pkg/lodash.js";
import {scaleLinear} from "../pkg/d3-scale.js";
import {extent} from "../pkg/d3-array.js";
import {useWidthObserver, useHeightObserver} from "../hooks/viewport.js";
const PADDING_X = 13;
const PADDING_Y = 10;
const spreadOverDomain = (scale, count) => {
  const [x1, x2] = extent(scale.domain());
  return range(count).map((v) => x1 + (x2 - x1) * v / (count - 1));
};
const HorizontalColorbar = ({colorScale, currentValue, id, markerColor, ticksCount = 5}) => {
  const ref = useRef(null);
  const width = useWidthObserver(ref, 2 * PADDING_X);
  const height = useHeightObserver(ref, 2 * PADDING_Y);
  const className = `${id} colorbar`;
  const linearScale = scaleLinear().domain(extent(colorScale.domain())).range([0, width]);
  if (width <= 0 || height <= 0) {
    return /* @__PURE__ */ React.createElement("svg", {
      className,
      ref
    });
  }
  return /* @__PURE__ */ React.createElement("svg", {
    className,
    ref
  }, /* @__PURE__ */ React.createElement("g", {
    transform: `translate(${PADDING_X},0)`
  }, /* @__PURE__ */ React.createElement("linearGradient", {
    id: `${id}-gradient`,
    x2: "100%"
  }, spreadOverDomain(colorScale, 10).map((value, index) => /* @__PURE__ */ React.createElement("stop", {
    key: value,
    offset: index / 9,
    stopColor: colorScale(value)
  }))), /* @__PURE__ */ React.createElement("rect", {
    className: "gradient",
    fill: `url(#${id}-gradient)`,
    width,
    height
  }), isFinite(currentValue) && /* @__PURE__ */ React.createElement("line", {
    className: "marker",
    stroke: markerColor,
    strokeWidth: "2",
    x1: linearScale(currentValue),
    x2: linearScale(currentValue),
    y2: height
  }), /* @__PURE__ */ React.createElement("rect", {
    className: "border",
    shapeRendering: "crispEdges",
    strokeWidth: "1",
    fill: "none",
    width,
    height
  }), /* @__PURE__ */ React.createElement("g", {
    className: "x axis",
    transform: `translate(0,${height})`,
    fill: "none",
    fontSize: "10",
    fontFamily: "sans-serif",
    textAnchor: "middle"
  }, spreadOverDomain(linearScale, ticksCount).map((t) => /* @__PURE__ */ React.createElement("g", {
    key: `tick-${t}`,
    className: "tick",
    transform: `translate(${linearScale(t)},0)`
  }, /* @__PURE__ */ React.createElement("text", {
    fill: "currentColor",
    y: "8",
    dy: "0.81em"
  }, Math.round(t)))))));
};
export default HorizontalColorbar;
