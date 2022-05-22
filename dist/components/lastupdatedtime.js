import React, {useEffect, useState} from "../pkg/react.js";
import moment from "../pkg/moment.js";
import {useCurrentZoneHistoryEndTime} from "../hooks/redux.js";
const LastUpdatedTime = () => {
  const [style, setStyle] = useState({});
  const timestamp = useCurrentZoneHistoryEndTime();
  useEffect(() => {
    setStyle({color: "darkred"});
    setTimeout(() => {
      setStyle({transition: "color 800ms ease-in-out"});
    }, 0);
  }, [timestamp]);
  return /* @__PURE__ */ React.createElement("span", {
    style
  }, moment(timestamp).fromNow());
};
export default LastUpdatedTime;
