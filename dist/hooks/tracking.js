import { useEffect, useMemo } from '../pkg/react.js';
import { useLocation } from '../pkg/react-router-dom.js';
import { useDispatch } from '../pkg/react-redux.js';
import thirdPartyServices from '../services/thirdparty.js';
export const useTrackEvent = () => {
  const dispatch = useDispatch();
  return useMemo(() => (eventName, context) => {
    dispatch({
      type: 'TRACK_EVENT',
      payload: {
        eventName,
        context
      }
    });
  }, [dispatch]);
};
export const usePageViewsTracker = () => {
  const {
    pathname,
    search
  } = useLocation();
  const trackEvent = useTrackEvent(); // Track app visit once initially.

  useEffect(() => {
    trackEvent('Visit');
  }, []); // Update GA config whenever the URL changes.

  useEffect(() => {
    if (thirdPartyServices._ga) {
      thirdPartyServices._ga.config({
        page_path: `${pathname}${search}`
      });
    }
  }, [pathname, search]); // Track page view whenever the pathname changes (ignore search params changes).

  useEffect(() => {
    trackEvent('pageview');
  }, [pathname]);
};