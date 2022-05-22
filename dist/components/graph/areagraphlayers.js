import React from '../../pkg/react.js';
import { noop, isFunction } from '../../pkg/lodash.js';
import { area } from '../../pkg/d3-shape.js';
import { detectHoveredDatapointIndex } from '../../helpers/graph.js';
const AreaGraphLayers = /*#__PURE__*/React.memo(({
  layers,
  datetimes,
  timeScale,
  valueScale,
  mouseMoveHandler,
  mouseOutHandler,
  isMobile,
  svgRef
}) => {
  const [x1, x2] = timeScale.range();
  const [y2, y1] = valueScale.range();
  if (x1 >= x2 || y1 >= y2) return null; // Generate layer paths

  const layerArea = area().x(d => timeScale(d.data.datetime)).y0(d => valueScale(d[0])).y1(d => valueScale(d[1])).defined(d => Number.isFinite(d[1])); // Mouse hover events

  let mouseOutTimeout;

  const handleLayerMouseMove = (ev, layerIndex) => {
    if (mouseOutTimeout) {
      clearTimeout(mouseOutTimeout);
      mouseOutTimeout = undefined;
    }

    const timeIndex = detectHoveredDatapointIndex(ev, datetimes, timeScale, svgRef);

    if (mouseMoveHandler) {
      mouseMoveHandler(timeIndex, layerIndex);
    }
  };

  const handleLayerMouseOut = () => {
    if (mouseOutHandler) {
      mouseOutHandler();
    }
  };

  return /*#__PURE__*/React.createElement("g", null, layers.map((layer, ind) => {
    const isGradient = isFunction(layer.fill);
    const gradientId = `areagraph-gradient-${layer.key}`;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: layer.key
    }, /*#__PURE__*/React.createElement("path", {
      className: `area layer ${layer.key}`,
      style: {
        cursor: 'pointer'
      },
      stroke: layer.stroke,
      fill: isGradient ? `url(#${gradientId})` : layer.fill,
      d: layerArea(layer.datapoints)
      /* Support only click events in mobile mode, otherwise react to mouse hovers */
      ,
      onClick: isMobile ? ev => handleLayerMouseMove(ev, ind) : noop,
      onFocus: !isMobile ? ev => handleLayerMouseMove(ev, ind) : noop,
      onMouseOver: !isMobile ? ev => handleLayerMouseMove(ev, ind) : noop,
      onMouseMove: !isMobile ? ev => handleLayerMouseMove(ev, ind) : noop,
      onMouseOut: handleLayerMouseOut,
      onBlur: handleLayerMouseOut
    }), isGradient && /*#__PURE__*/React.createElement("linearGradient", {
      id: gradientId,
      gradientUnits: "userSpaceOnUse",
      x1: x1,
      x2: x2
    }, layer.datapoints.map(d => /*#__PURE__*/React.createElement("stop", {
      key: d.data.datetime,
      offset: `${(timeScale(d.data.datetime) - x1) / (x2 - x1) * 100.0}%`,
      stopColor: layer.fill(d)
    }))));
  }));
});
export default AreaGraphLayers;