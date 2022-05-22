import {useEffect, useMemo} from "../pkg/react.js";
import {useLocation} from "../pkg/react-router-dom.js";
import {useDispatch} from "../pkg/react-redux.js";
import thirdPartyServices from "../services/thirdparty.js";
export const useTrackEvent = () => {
  const dispatch = useDispatch();
  return useMemo(() => (eventName, context) => {
    dispatch({type: "TRACK_EVENT", payload: {eventName, context}});
  }, [dispatch]);
};
export const usePageViewsTracker = () => {
  const {pathname, search} = useLocation();
  const trackEvent = useTrackEvent();
  useEffect(() => {
    trackEvent("Visit");
  }, [trackEvent]);
  useEffect(() => {
    if (thirdPartyServices._ga) {
      thirdPartyServices._ga.config({page_path: `${pathname}${search}`});
    }
  }, [pathname, search]);
  useEffect(() => {
    trackEvent("pageview");
  }, [trackEvent]);
};
