import React from "../pkg/react.js";
import {useSelector} from "../pkg/react-redux.js";
import {dispatchApplication} from "../store.js";
import {saveKey} from "../helpers/storage.js";
const ColorBlindCheckbox = () => {
  const colorBlindModeEnabled = useSelector((state) => state.application.colorBlindModeEnabled);
  const toggleColorBlindMode = () => {
    dispatchApplication("colorBlindModeEnabled", !colorBlindModeEnabled);
    saveKey("colorBlindModeEnabled", !colorBlindModeEnabled);
  };
  return /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("label", {
    className: "checkbox-container"
  }, "color blind mode", /* @__PURE__ */ React.createElement("input", {
    type: "checkbox",
    id: "checkbox-colorblind",
    checked: colorBlindModeEnabled,
    onChange: toggleColorBlindMode
  }), /* @__PURE__ */ React.createElement("span", {
    className: "checkmark"
  })));
};
export default ColorBlindCheckbox;
