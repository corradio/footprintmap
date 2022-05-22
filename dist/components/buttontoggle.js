import React, { useState } from '../pkg/react.js';
import { useSelector } from '../pkg/react-redux.js';
import styled from '../pkg/styled-components.js';
import { isEmpty, noop } from '../pkg/lodash.js';
const Wrapper = styled.div`
  position: relative;
`;
const Button = styled.button`
  background-color: #FFFFFF;
  background-image: url(${props => props.active ? `/images/${props.icon}_active.svg` : `/images/${props.icon}.svg`});
`;

const ButtonToggle = ({
  active,
  icon,
  onChange,
  tooltip
}) => {
  const isMobile = useSelector(state => state.application.isMobile);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const showTooltip = () => {
    setTooltipVisible(true);
  };

  const hideTooltip = () => {
    setTooltipVisible(false);
  };

  return /*#__PURE__*/React.createElement(Wrapper, null, /*#__PURE__*/React.createElement(Button, {
    type: "button",
    className: "layer-button",
    onFocus: isMobile ? noop : showTooltip,
    onMouseOver: isMobile ? noop : showTooltip,
    onMouseOut: isMobile ? noop : hideTooltip,
    onBlur: isMobile ? noop : hideTooltip,
    onClick: onChange,
    active: active,
    icon: icon
  }), tooltipVisible && !isEmpty(tooltip) && /*#__PURE__*/React.createElement("div", {
    className: "layer-button-tooltip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tooltip-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tooltip-text"
  }, tooltip), /*#__PURE__*/React.createElement("div", {
    className: "arrow"
  }))));
};

export default ButtonToggle;