import React from 'react';
import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';

const Overlay = styled.div`
  background-position: calc(50% - 64px) center, center center;
  background-repeat: no-repeat, no-repeat;
  background-size: 36px, 10rem;
  background-color: #fafafa;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  transition: opacity ${(props) => props.fadeTimeout}ms ease-in-out;
  z-index: 500;
  align-items: center;
  justify-content: center;
  display: flex;
`;

export default ({ fadeTimeout = 500, visible }) => (
  <CSSTransition in={visible} timeout={fadeTimeout} classNames="fade">
    <Overlay fadeTimeout={fadeTimeout}>Loading..</Overlay>
  </CSSTransition>
);
