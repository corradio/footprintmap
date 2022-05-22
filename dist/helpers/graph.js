import {bisectLeft} from "../pkg/d3-array.js";
import {touches} from "../pkg/d3-selection.js";
export const detectHoveredDatapointIndex = (ev, datetimes, timeScale, svgRef) => {
  if (!datetimes.length) {
    return null;
  }
  const dx = ev.pageX ? ev.pageX - svgRef.current.getBoundingClientRect().left : touches(this)[0][0];
  const datetime = timeScale.invert(dx);
  let i = bisectLeft(datetimes, datetime);
  if (i > 0 && datetime - datetimes[i - 1] < datetimes[i] - datetime) {
    i -= 1;
  }
  if (i > datetimes.length - 1) {
    i = datetimes.length - 1;
  }
  return i;
};
export const getTooltipPosition = (isMobile, marker) => isMobile ? {x: 0, y: 0} : marker;
