import React, { useEffect, useState, useMemo, useRef } from '../../pkg/react.js';
import { useSelector } from '../../pkg/react-redux.js';
import styled from '../../pkg/styled-components.js';
import { dispatchApplication } from '../../store.js';
import { useExchangeArrowsData } from '../../hooks/layers.js';
import { useWidthObserver, useHeightObserver } from '../../hooks/viewport.js';
import MapExchangeTooltip from '../tooltips/mapexchangetooltip.js';
import ExchangeArrow from '../exchangearrow.js';
const Layer = styled.div`
  pointer-events: none;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;
export default /*#__PURE__*/React.memo(({
  project
}) => {
  const ref = useRef();
  const arrows = useExchangeArrowsData();
  const width = useWidthObserver(ref);
  const height = useHeightObserver(ref);
  const isMoving = useSelector(state => state.application.isMovingMap);
  const [tooltip, setTooltip] = useState(null); // Mouse interaction handlers

  const handleArrowMouseMove = useMemo(() => (exchangeData, x, y) => {
    dispatchApplication('isHoveringExchange', true);
    dispatchApplication('co2ColorbarValue', exchangeData.co2intensity);
    setTooltip({
      exchangeData,
      position: {
        x,
        y
      }
    });
  }, []);
  const handleArrowMouseOut = useMemo(() => () => {
    dispatchApplication('isHoveringExchange', false);
    dispatchApplication('co2ColorbarValue', null);
    setTooltip(null);
  }, []); // Call mouse out handler immidiately if moving the map.

  useEffect(() => {
    if (isMoving && tooltip) {
      handleArrowMouseOut();
    }
  }, [isMoving, tooltip]);
  return /*#__PURE__*/React.createElement(Layer, {
    id: "exchange",
    ref: ref
  }, tooltip && /*#__PURE__*/React.createElement(MapExchangeTooltip, {
    exchangeData: tooltip.exchangeData,
    position: tooltip.position,
    onClose: () => setTooltip(null)
  }), !isMoving && arrows.map(arrow => /*#__PURE__*/React.createElement(ExchangeArrow, {
    data: arrow,
    key: arrow.sortedCountryCodes,
    mouseMoveHandler: handleArrowMouseMove,
    mouseOutHandler: handleArrowMouseOut,
    project: project,
    viewportWidth: width,
    viewportHeight: height
  })));
});