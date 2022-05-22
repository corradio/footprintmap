import React from '../pkg/react.js';
import { useSelector } from '../pkg/react-redux.js';
import { saveKey } from '../helpers/storage.js';
import { dispatchApplication } from '../store.js';
import ButtonToggle from '../components/buttontoggle.js';
export default (() => {
  const brightModeEnabled = useSelector(state => state.application.brightModeEnabled);

  const toggleBrightMode = () => {
    dispatchApplication('brightModeEnabled', !brightModeEnabled);
    saveKey('brightModeEnabled', !brightModeEnabled);
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "layer-buttons-container"
  }, /*#__PURE__*/React.createElement(ButtonToggle, {
    active: brightModeEnabled,
    onChange: toggleBrightMode,
    tooltip: "Toggle dark-mode",
    icon: "brightmode"
  }));
});