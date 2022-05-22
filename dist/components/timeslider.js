import React, {useRef, useMemo, useState} from "../pkg/react.js";
import {first, last, sortedIndex, isNumber} from "../pkg/lodash.js";
import {connect} from "../pkg/react-redux.js";
import {scaleTime} from "../pkg/d3-scale.js";
import moment from "../pkg/moment.js";
import TimeAxis from "./graph/timeaxis.js";
import {useWidthObserver} from "../hooks/viewport.js";
const AXIS_HORIZONTAL_MARGINS = 12;
const getTimeScale = (width, datetimes, startTime, endTime) => scaleTime().domain([
  startTime ? moment(startTime).toDate() : first(datetimes),
  endTime ? moment(endTime).toDate() : last(datetimes)
]).range([0, width]);
const createChangeAndInputHandler = (datetimes, onChange, setAnchoredTimeIndex) => (ev) => {
  const value = parseInt(ev.target.value, 10);
  let index = sortedIndex(datetimes.map((t) => t.valueOf()), value);
  if (index >= datetimes.length) {
    index = null;
  }
  setAnchoredTimeIndex(index);
  if (onChange) {
    onChange(index);
  }
};
const TimeSlider = ({className, onChange, selectedTimeIndex, datetimes, startTime, endTime, datetime}) => {
  const ref = useRef(null);
  const width = useWidthObserver(ref, 2 * AXIS_HORIZONTAL_MARGINS);
  const [anchoredTimeIndex, setAnchoredTimeIndex] = useState(null);
  const timeScale = useMemo(() => getTimeScale(width, datetimes, startTime, endTime), [width, datetimes, startTime, endTime]);
  const handleChangeAndInput = useMemo(() => createChangeAndInputHandler(datetimes, onChange, setAnchoredTimeIndex), [datetimes, onChange, setAnchoredTimeIndex]);
  if (!datetimes || datetimes.length === 0) {
    return null;
  }
  const selectedTimeValue = isNumber(selectedTimeIndex) ? datetimes[selectedTimeIndex].valueOf() : moment(datetime).toDate().valueOf();
  const anchoredTimeValue = isNumber(anchoredTimeIndex) ? datetimes[anchoredTimeIndex].valueOf() : null;
  const startTimeValue = timeScale.domain()[0].valueOf();
  const endTimeValue = timeScale.domain()[1].valueOf();
  return /* @__PURE__ */ React.createElement("div", {
    className
  }, /* @__PURE__ */ React.createElement("input", {
    type: "range",
    className: "time-slider-input",
    onChange: handleChangeAndInput,
    onInput: handleChangeAndInput,
    value: selectedTimeValue || anchoredTimeValue || endTimeValue,
    min: startTimeValue,
    max: endTimeValue
  }), /* @__PURE__ */ React.createElement("svg", {
    className: "time-slider-axis-container",
    ref
  }, /* @__PURE__ */ React.createElement(TimeAxis, {
    scale: timeScale,
    transform: `translate(${AXIS_HORIZONTAL_MARGINS}, 0)`,
    className: "time-slider-axis"
  })));
};
export default connect((state) => ({datetime: state.data.grid.datetime}))(TimeSlider);
