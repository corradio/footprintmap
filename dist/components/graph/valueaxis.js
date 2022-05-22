import React from '../../pkg/react.js';
const ValueAxis = /*#__PURE__*/React.memo(({
  scale,
  label,
  width,
  height
}) => {
  const [y1, y2] = scale.range();
  return /*#__PURE__*/React.createElement("g", {
    className: "y axis",
    transform: `translate(${width - 1} -1)`,
    fill: "none",
    fontSize: "10",
    fontFamily: "sans-serif",
    textAnchor: "start",
    style: {
      pointerEvents: 'none'
    }
  }, label && /*#__PURE__*/React.createElement("text", {
    className: "label",
    textAnchor: "middle",
    transform: `translate(37, ${height / 2}) rotate(-90)`
  }, label), /*#__PURE__*/React.createElement("path", {
    className: "domain",
    stroke: "currentColor",
    d: `M6,${y1 + 0.5}H0.5V${y2 + 0.5}H6`
  }), scale.ticks(5).map(v => /*#__PURE__*/React.createElement("g", {
    key: `tick-${v}`,
    className: "tick",
    opacity: 1,
    transform: `translate(0,${scale(v)})`
  }, /*#__PURE__*/React.createElement("line", {
    stroke: "currentColor",
    x2: "6"
  }), /*#__PURE__*/React.createElement("text", {
    fill: "currentColor",
    x: "6",
    y: "3",
    dx: "0.32em"
  }, v))));
});
export default ValueAxis;