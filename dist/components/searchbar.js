import React, { useEffect, useRef } from '../pkg/react.js';
import { noop } from '../pkg/lodash.js';

const SearchBar = ({
  className,
  documentKeyUpHandler,
  placeholder,
  searchHandler
}) => {
  const ref = useRef(null); // Set up global key up handlers that apply to this search bar

  useEffect(() => {
    const keyUpHandler = documentKeyUpHandler ? ev => documentKeyUpHandler(ev.key, ref) : noop;
    document.addEventListener('keyup', keyUpHandler);
    return () => {
      document.removeEventListener('keyup', keyUpHandler);
    };
  }); // Apply the search query after every key press

  const handleKeyUp = ev => {
    if (searchHandler) {
      searchHandler(ev.target.value.toLowerCase());
    }
  };

  return /*#__PURE__*/React.createElement("div", {
    className: className
  }, /*#__PURE__*/React.createElement("input", {
    ref: ref,
    placeholder: placeholder,
    onKeyUp: handleKeyUp
  }));
};

export default SearchBar;