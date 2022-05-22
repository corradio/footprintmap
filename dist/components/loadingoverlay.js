import React from '../pkg/react.js';
import styled from '../pkg/styled-components.js';
import { CSSTransition } from '../pkg/react-transition-group.js';
const Overlay = styled.div`
  background-position: calc(50% - 64px) center , center center;
  background-repeat: no-repeat, no-repeat;
  background-size: 36px , 10rem;
  background-color: #fafafa;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  transition: opacity ${props => props.fadeTimeout}ms ease-in-out;
  z-index: 500;
  align-items: center;
  justify-content: center;
  display: flex;
`;
export default (({
  fadeTimeout = 500,
  visible
}) => /*#__PURE__*/React.createElement(CSSTransition, {
  in: visible,
  timeout: fadeTimeout,
  classNames: "fade"
}, /*#__PURE__*/React.createElement(Overlay, {
  fadeTimeout: fadeTimeout
}, "Loading..")));