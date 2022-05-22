import {createBrowserHistory, createHashHistory} from "../pkg/history.js";
export const history = window.isCordova ? createHashHistory() : createBrowserHistory();
export function getZoneId() {
  return history.location.pathname.split("/")[2];
}
export function hideLanguageSearchParam() {
  const searchParams = new URLSearchParams(history.location.search);
  searchParams.delete("lang");
  history.replace(`?${searchParams.toString()}`);
}
hideLanguageSearchParam();
