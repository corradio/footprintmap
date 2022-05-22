import React from "../../pkg/react.js";
import {connect} from "../../pkg/react-redux.js";
import {dispatchApplication} from "../../store.js";
import {
  useCurrentZoneHistoryDatetimes,
  useCurrentZoneHistoryStartTime,
  useCurrentZoneHistoryEndTime
} from "../../hooks/redux.js";
import TimeSlider from "../../components/timeslider.js";
import CountryPanel from "./countrypanel.js";
const handleZoneTimeIndexChange = (timeIndex) => {
  dispatchApplication("selectedZoneTimeIndex", timeIndex);
};
const mapStateToProps = (state) => ({
  selectedZoneTimeIndex: state.application.selectedZoneTimeIndex
});
const ZoneDetailsPanel = ({selectedZoneTimeIndex}) => {
  const datetimes = useCurrentZoneHistoryDatetimes();
  const startTime = useCurrentZoneHistoryStartTime();
  const endTime = useCurrentZoneHistoryEndTime();
  return /* @__PURE__ */ React.createElement("div", {
    className: "left-panel-zone-details"
  }, /* @__PURE__ */ React.createElement(CountryPanel, null), /* @__PURE__ */ React.createElement("div", {
    className: "detail-bottom-section"
  }, /* @__PURE__ */ React.createElement(TimeSlider, {
    className: "zone-time-slider",
    onChange: handleZoneTimeIndexChange,
    selectedTimeIndex: selectedZoneTimeIndex,
    datetimes,
    startTime,
    endTime
  }), /* @__PURE__ */ React.createElement("div", {
    className: "social-buttons small-screen-hidden"
  }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", {
    className: "fb-share-button",
    "data-href": "https://www.electricitymap.org/",
    "data-layout": "button_count"
  }), /* @__PURE__ */ React.createElement("a", {
    className: "twitter-share-button",
    "data-url": "https://www.electricitymap.org",
    "data-via": "electricitymap"
  }), /* @__PURE__ */ React.createElement("span", {
    className: "slack-button"
  }, /* @__PURE__ */ React.createElement("a", {
    href: "https://slack.tmrow.com",
    target: "_blank",
    className: "slack-btn"
  }, /* @__PURE__ */ React.createElement("span", {
    className: "slack-ico"
  }), /* @__PURE__ */ React.createElement("span", {
    className: "slack-text"
  }, "Slack")))))));
};
export default connect(mapStateToProps)(ZoneDetailsPanel);
