import React, {useEffect, useRef} from "../pkg/react.js";
import {noop} from "../pkg/lodash.js";
const SearchBar = ({className, documentKeyUpHandler, placeholder, searchHandler}) => {
  const ref = useRef(null);
  useEffect(() => {
    const keyUpHandler = documentKeyUpHandler ? (ev) => documentKeyUpHandler(ev.key, ref) : noop;
    document.addEventListener("keyup", keyUpHandler);
    return () => {
      document.removeEventListener("keyup", keyUpHandler);
    };
  });
  const handleKeyUp = (ev) => {
    if (searchHandler) {
      searchHandler(ev.target.value.toLowerCase());
    }
  };
  return /* @__PURE__ */ React.createElement("div", {
    className
  }, /* @__PURE__ */ React.createElement("input", {
    ref,
    placeholder,
    onKeyUp: handleKeyUp
  }));
};
export default SearchBar;
