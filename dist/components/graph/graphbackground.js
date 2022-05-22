import React from "../../pkg/react.js";
import {noop} from "../../pkg/lodash.js";
import {detectHoveredDatapointIndex} from "../../helpers/graph.js";
const GraphBackground = React.memo(({timeScale, valueScale, datetimes, mouseMoveHandler, mouseOutHandler, isMobile, svgRef}) => {
  const [x1, x2] = timeScale.range();
  const [y2, y1] = valueScale.range();
  const width = x2 - x1;
  const height = y2 - y1;
  let mouseOutRectTimeout;
  const handleRectMouseMove = (ev) => {
    if (mouseOutRectTimeout) {
      clearTimeout(mouseOutRectTimeout);
      mouseOutRectTimeout = void 0;
    }
    const timeIndex = detectHoveredDatapointIndex(ev, datetimes, timeScale, svgRef);
    if (mouseMoveHandler) {
      mouseMoveHandler(timeIndex);
    }
  };
  const handleRectMouseOut = () => {
    if (mouseOutHandler) {
      mouseOutHandler();
    }
  };
  if (width <= 0 || height <= 0) {
    return null;
  }
  return /* @__PURE__ */ React.createElement("rect", {
    x: x1,
    y: y1,
    width,
    height,
    style: {cursor: "pointer", opacity: 0},
    onClick: isMobile ? handleRectMouseMove : noop,
    onFocus: !isMobile ? handleRectMouseMove : noop,
    onMouseOver: !isMobile ? handleRectMouseMove : noop,
    onMouseMove: !isMobile ? handleRectMouseMove : noop,
    onMouseOut: handleRectMouseOut,
    onBlur: handleRectMouseOut
  });
});
export default GraphBackground;
