import React, {useState, useEffect} from "../pkg/react.js";
import {Link, useLocation, useHistory} from "../pkg/react-router-dom.js";
import {connect} from "../pkg/react-redux.js";
import {ascending} from "../pkg/d3-array.js";
import {dispatchApplication} from "../store.js";
import {useCo2ColorScale} from "../hooks/theme.js";
import {getCenteredZoneViewport} from "../helpers/map.js";
import {getFullZoneName} from "../helpers/language.js";
import {flagUri} from "../helpers/flags.js";
import {getZoneCarbonIntensity} from "../helpers/zonedata.js";
function withZoneRankings(zones) {
  return zones.map((zone) => {
    const ret = Object.assign({}, zone);
    ret.ranking = zones.indexOf(zone) + 1;
    return ret;
  });
}
function getCo2IntensityAccessor(electricityMixMode, carbonIntensityDomain) {
  return (d) => getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, d);
}
function sortAndValidateZones(zones, accessor) {
  return zones.filter(accessor).sort((x, y) => {
    if (!x.co2intensity && !x.countryCode) {
      return ascending(x.shortname || x.countryCode, y.shortname || y.countryCode);
    }
    return ascending(accessor(x) || Infinity, accessor(y) || Infinity);
  });
}
function processZones(zonesData, accessor) {
  const zones = Object.values(zonesData);
  const validatedAndSortedZones = sortAndValidateZones(zones, accessor);
  return withZoneRankings(validatedAndSortedZones);
}
function zoneMatchesQuery(zone, queryString) {
  if (!queryString) {
    return true;
  }
  const queries = queryString.split(" ");
  return queries.every((query) => (getFullZoneName(zone.countryCode) || "").toLowerCase().indexOf(query.toLowerCase()) !== -1);
}
const mapStateToProps = (state) => ({
  electricityMixMode: state.application.electricityMixMode,
  gridZones: state.data.grid.zones,
  searchQuery: state.application.searchQuery,
  carbonIntensityDomain: state.application.carbonIntensityDomain
});
const ZoneList = ({
  electricityMixMode,
  gridZones,
  searchQuery,
  carbonIntensityDomain
}) => {
  const co2ColorScale = useCo2ColorScale();
  const co2IntensityAccessor = getCo2IntensityAccessor(electricityMixMode, carbonIntensityDomain);
  const zones = processZones(gridZones, co2IntensityAccessor).filter((z) => zoneMatchesQuery(z, searchQuery));
  const ref = React.createRef();
  const history = useHistory();
  const location = useLocation();
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const zonePage = (zone) => ({
    pathname: `/zone/${zone.countryCode}`,
    search: location.search
  });
  const enterZone = (zone) => {
    dispatchApplication("mapViewport", getCenteredZoneViewport(zone));
    history.push(zonePage(zone));
  };
  useEffect(() => {
    const scrollToItemIfNeeded = (index) => {
      const item = ref.current && ref.current.children[index];
      if (!item) {
        return;
      }
      const parent = item.parentNode;
      const parentComputedStyle = window.getComputedStyle(parent, null);
      const parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue("border-top-width"), 10);
      const overTop = item.offsetTop - parent.offsetTop < parent.scrollTop;
      const overBottom = item.offsetTop - parent.offsetTop + item.clientHeight - parentBorderTopWidth > parent.scrollTop + parent.clientHeight;
      const alignWithTop = overTop && !overBottom;
      if (overTop || overBottom) {
        item.scrollIntoView(alignWithTop);
      }
    };
    const keyHandler = (e) => {
      if (e.key) {
        if (e.key === "Enter" && zones[selectedItemIndex]) {
          enterZone(zones[selectedItemIndex]);
        } else if (e.key === "ArrowUp") {
          const prevItemIndex = selectedItemIndex === null ? 0 : Math.max(0, selectedItemIndex - 1);
          scrollToItemIfNeeded(prevItemIndex);
          setSelectedItemIndex(prevItemIndex);
        } else if (e.key === "ArrowDown") {
          const nextItemIndex = selectedItemIndex === null ? 0 : Math.min(zones.length - 1, selectedItemIndex + 1);
          scrollToItemIfNeeded(nextItemIndex);
          setSelectedItemIndex(nextItemIndex);
        } else if (e.key.match(/^[A-z]$/)) {
          scrollToItemIfNeeded(0);
          setSelectedItemIndex(0);
        }
      }
    };
    document.addEventListener("keyup", keyHandler);
    return () => {
      document.removeEventListener("keyup", keyHandler);
    };
  });
  return /* @__PURE__ */ React.createElement("div", {
    className: "zone-list",
    ref
  }, zones.map((zone, ind) => /* @__PURE__ */ React.createElement(Link, {
    to: zonePage(zone),
    onClick: () => enterZone(zone),
    className: selectedItemIndex === ind ? "selected" : "",
    key: zone.countryCode
  }, /* @__PURE__ */ React.createElement("div", {
    className: "ranking"
  }, zone.ranking), /* @__PURE__ */ React.createElement("img", {
    className: "flag",
    src: flagUri(zone.countryCode, 32),
    alt: zone.countryCode
  }), /* @__PURE__ */ React.createElement("div", {
    className: "name"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "zone-name"
  }, getFullZoneName(zone.countryCode) || zone.countryCode)), /* @__PURE__ */ React.createElement("div", {
    className: "co2-intensity-tag",
    style: {backgroundColor: co2ColorScale(co2IntensityAccessor(zone))}
  }))));
};
export default connect(mapStateToProps)(ZoneList);
