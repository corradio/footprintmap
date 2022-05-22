import React from "../pkg/react.js";
import {Motion, spring} from "../pkg/react-motion.js";
import {arc} from "../pkg/d3-shape.js";
const CircularGauge = React.memo(({
  fontSize = "1rem",
  onClick,
  onMouseMove,
  onMouseOut,
  onMouseOver,
  percentage = 0,
  radius = 32,
  thickness = 6
}) => {
  const percentageFill = (p) => arc().startAngle(0).outerRadius(radius).innerRadius(radius - thickness).endAngle(p / 100 * 2 * Math.PI)();
  return /* @__PURE__ */ React.createElement("div", {
    onClick: (e) => onClick && onClick(e.clientX, e.clientY),
    onMouseOver: () => onMouseOver && onMouseOver(),
    onMouseOut: () => onMouseOut && onMouseOut(),
    onMouseMove: (e) => onMouseMove && onMouseMove(e.clientX, e.clientY)
  }, /* @__PURE__ */ React.createElement("svg", {
    style: {pointerEvents: "none"},
    width: radius * 2,
    height: radius * 2
  }, /* @__PURE__ */ React.createElement("g", {
    transform: `translate(${radius},${radius})`
  }, /* @__PURE__ */ React.createElement("g", {
    className: "circular-gauge"
  }, /* @__PURE__ */ React.createElement("path", {
    className: "background",
    d: percentageFill(100)
  }), /* @__PURE__ */ React.createElement(Motion, {
    defaultStyle: {percentage: 0},
    style: {percentage: spring(Number.isFinite(percentage) ? percentage : 0)}
  }, (interpolated) => /* @__PURE__ */ React.createElement("path", {
    className: "foreground",
    d: percentageFill(interpolated.percentage)
  })), /* @__PURE__ */ React.createElement("text", {
    style: {textAnchor: "middle", fontWeight: "bold", fontSize},
    dy: "0.4em"
  }, Number.isFinite(percentage) ? `${Math.round(percentage)}%` : "?")))));
});
export default CircularGauge;
