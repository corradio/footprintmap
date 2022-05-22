import React, { useEffect, useState } from '../pkg/react.js';
import moment from '../pkg/moment.js';
import { useCurrentZoneHistoryEndTime } from '../hooks/redux.js';

const LastUpdatedTime = () => {
  const [style, setStyle] = useState({});
  const timestamp = useCurrentZoneHistoryEndTime(); // Every time the timestamp gets changed, jump to the highlighted state
  // and slowly release back to standard text from the next render cycle.

  useEffect(() => {
    setStyle({
      color: 'darkred'
    });
    setTimeout(() => {
      setStyle({
        transition: 'color 800ms ease-in-out'
      });
    }, 0);
  }, [timestamp]);
  return /*#__PURE__*/React.createElement("span", {
    style: style
  }, moment(timestamp).fromNow());
};

export default LastUpdatedTime;