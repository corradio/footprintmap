import React from "../../pkg/react.js";
import moment from "../../pkg/moment.js";
import {range} from "../../pkg/lodash.js";
const renderTickValue = (v) => moment(v).format("YYYY");
const roundUp = (number, base) => Math.ceil(number / base) * base;
const getTicksValuesFromTimeScale = (scale, count) => {
  const startTime = scale.domain()[0].valueOf();
  const endTime = scale.domain()[1].valueOf();
  const precision = moment.duration(1, "year").valueOf();
  const step = (endTime - startTime) / (count - 1);
  return range(count).map((ind) => moment(ind === count - 1 ? endTime : roundUp(startTime + ind * step, precision)).toDate());
};
const TimeAxis = React.memo(({className, scale, transform}) => {
  const [x1, x2] = scale.range();
  return /* @__PURE__ */ React.createElement("g", {
    className,
    transform,
    fill: "none",
    fontSize: "10",
    fontFamily: "sans-serif",
    textAnchor: "middle",
    style: {pointerEvents: "none"}
  }, /* @__PURE__ */ React.createElement("path", {
    className: "domain",
    stroke: "currentColor",
    d: `M${x1 + 0.5},6V0.5H${x2 + 0.5}V6`
  }), getTicksValuesFromTimeScale(scale, 5).map((v) => /* @__PURE__ */ React.createElement("g", {
    key: `tick-${v}`,
    className: "tick",
    opacity: 1,
    transform: `translate(${scale(v)},0)`
  }, /* @__PURE__ */ React.createElement("line", {
    stroke: "currentColor",
    y2: "6"
  }), /* @__PURE__ */ React.createElement("text", {
    fill: "currentColor",
    y: "9",
    x: "5",
    dy: "0.71em"
  }, renderTickValue(v)))));
});
export default TimeAxis;
