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
  })));
};
export default connect(mapStateToProps)(ZoneDetailsPanel);
