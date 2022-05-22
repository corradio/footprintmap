import React from "../pkg/react.js";
import styled, {css} from "../pkg/styled-components.js";
const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  position: absolute;
  transition: all 0.4s;

  ${(props) => props.visible ? css`
          opacity: 1;
          transform: translateX(0px);
          visibility: visible;
        ` : css`
          opacity: 0;
          transform: translateX(10px);
          visibility: hidden;
        `}
`;
const Content = styled.div`
  background-color: #efefef;
  border-radius: 4px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.15);
  color: black;
  font-size: 0.9rem;
  padding: 5px 10px;
  text-align: center;
`;
const InfoTooltip = ({htmlContent, style, visible}) => /* @__PURE__ */ React.createElement(Wrapper, {
  style,
  visible
}, /* @__PURE__ */ React.createElement(Content, {
  dangerouslySetInnerHTML: {__html: htmlContent}
}));
export default InfoTooltip;
