import React from "../../pkg/react.js";
import {useSelector} from "../../pkg/react-redux.js";
import moment from "../../pkg/moment.js";
import {dispatchApplication} from "../../store.js";
import SearchBar from "../../components/searchbar.js";
import ZoneList from "../../components/zonelist.js";
import InfoText from "./infotext.js";
import {useCarbonIntensityDomain} from "../../hooks/redux.js";
import {formatCarbonIntensityDescription} from "../../helpers/formatting.js";
const documentSearchKeyUpHandler = (key, searchRef) => {
  if (key === "/") {
    if (searchRef.current) {
      searchRef.current.value = "";
      searchRef.current.focus();
    }
  } else if (key && key.match(/^[A-z]$/)) {
    if (searchRef.current && searchRef.current !== document.activeElement) {
      searchRef.current.value += key;
      searchRef.current.focus();
    }
  }
};
const ZoneListPanel = () => /* @__PURE__ */ React.createElement("div", {
  className: "left-panel-zone-list"
}, /* @__PURE__ */ React.createElement("div", {
  className: "zone-list-header"
}, /* @__PURE__ */ React.createElement("div", {
  className: "title"
}, " Climate Impact by Area"), /* @__PURE__ */ React.createElement("div", {
  className: "subtitle"
}, `Ranked by ${formatCarbonIntensityDescription(useCarbonIntensityDomain(), useSelector((state) => state.application.electricityMixMode)).toLowerCase()} in ${moment(useSelector((state) => state.data.grid.datetime)).format("YYYY")}`)), /* @__PURE__ */ React.createElement(SearchBar, {
  className: "zone-search-bar",
  placeholder: "Search areas",
  documentKeyUpHandler: documentSearchKeyUpHandler,
  searchHandler: (query) => dispatchApplication("searchQuery", query)
}), /* @__PURE__ */ React.createElement(ZoneList, null), /* @__PURE__ */ React.createElement(InfoText, null));
export default ZoneListPanel;
