import React, {useRef} from "../pkg/react.js";
import {Portal} from "../pkg/react-portal.js";
import {useSelector} from "../pkg/react-redux.js";
import styled from "../pkg/styled-components.js";
import {useWidthObserver, useHeightObserver} from "../hooks/viewport.js";
const MARGIN = 16;
const FadedOverlay = styled.div`
  background: rgba(0, 0, 0, 0.25);
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
`;
const Tooltip = ({id, children, position, onClose}) => {
  const isMobile = useSelector((state) => state.application.isMobile);
  const ref = useRef(null);
  const width = useWidthObserver(ref);
  const height = useHeightObserver(ref);
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  if (!position) {
    return null;
  }
  const style = {};
  let x = 0;
  let y = 0;
  if (2 * MARGIN + width >= screenWidth || position.x + width + MARGIN >= screenWidth && position.x - width - MARGIN <= 0) {
    style.width = "100%";
  } else {
    x = position.x + MARGIN;
    if (width + x >= screenWidth) {
      x = position.x - width - MARGIN;
    }
  }
  y = position.y - MARGIN - height;
  if (y < 0) {
    y = position.y + MARGIN;
  }
  if (y + height + MARGIN >= screenHeight) {
    y = position.y - height - MARGIN;
  }
  style.transform = `translate(${x}px,${y}px)`;
  style.opacity = width && height ? 1 : 0;
  return /* @__PURE__ */ React.createElement(Portal, null, isMobile && /* @__PURE__ */ React.createElement(FadedOverlay, {
    onClick: () => setTimeout(onClose, 0)
  }), /* @__PURE__ */ React.createElement("div", {
    id,
    className: "tooltip panel",
    style,
    ref
  }, children));
};
export default Tooltip;
