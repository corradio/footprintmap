import {isFinite} from "../pkg/lodash.js";
export function getRatioPercent(value, total) {
  if (value === 0 && total === 0) {
    return 0;
  }
  if (!isFinite(value) || !isFinite(total)) {
    return "?";
  }
  return Math.round(value / total * 1e4) / 100;
}
export function tonsPerHourToGramsPerMinute(value) {
  return value / 1e6 / 60;
}
