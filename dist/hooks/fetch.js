import { useEffect } from '../pkg/react.js';
import { useDispatch, useSelector } from '../pkg/react-redux.js';
import { useParams } from '../pkg/react-router-dom.js';
import { isEmpty } from '../pkg/lodash.js';
const DATA_FETCH_INTERVAL = 60;
import { useCustomDatetime, useWindEnabled, useSolarEnabled } from './router.js';
import { useCurrentZoneHistory } from './redux.js';
export function useClientVersionFetch() {
  const clientType = useSelector(state => state.application.clientType);
  const isLocalhost = useSelector(state => state.application.isLocalhost);
  const dispatch = useDispatch(); // We only check the latest client version if running in browser on non-localhost.

  useEffect(() => {
    if (clientType === 'web' && !isLocalhost) {
      dispatch({
        type: 'CLIENT_VERSION_FETCH_REQUESTED'
      });
    }
  }, [clientType, isLocalhost]);
}
export function useConditionalZoneHistoryFetch() {
  const {
    zoneId
  } = useParams();
  const historyData = useCurrentZoneHistory();
  const customDatetime = useCustomDatetime();
  const dispatch = useDispatch(); // Fetch zone history data only if it's not there yet (and custom timestamp is not used).

  useEffect(() => {
    if (customDatetime) {
      console.error('Can\'t fetch history when a custom date is provided!');
    } else if (zoneId && isEmpty(historyData)) {
      dispatch({
        type: 'ZONE_HISTORY_FETCH_REQUESTED',
        payload: {
          zoneId
        }
      });
    }
  }, [zoneId, historyData, customDatetime]);
}
export function useGridDataPolling() {
  const datetime = useCustomDatetime();
  const dispatch = useDispatch(); // After initial request, do the polling only if the custom datetime is not specified.

  useEffect(() => {
    let pollInterval;
    dispatch({
      type: 'GRID_DATA_FETCH_REQUESTED',
      payload: {
        datetime
      }
    });

    if (!datetime) {
      pollInterval = setInterval(() => {
        dispatch({
          type: 'GRID_DATA_FETCH_REQUESTED',
          payload: {
            datetime
          }
        });
      }, DATA_FETCH_INTERVAL);
    }

    return () => clearInterval(pollInterval);
  }, [datetime]);
}
export function useConditionalWindDataPolling() {
  const windEnabled = useWindEnabled();
  const customDatetime = useCustomDatetime();
  const dispatch = useDispatch(); // After initial request, do the polling only if the custom datetime is not specified.

  useEffect(() => {
    let pollInterval;

    if (windEnabled) {
      if (customDatetime) {
        dispatch({
          type: 'WIND_DATA_FETCH_REQUESTED',
          payload: {
            datetime: customDatetime
          }
        });
      } else {
        dispatch({
          type: 'WIND_DATA_FETCH_REQUESTED'
        });
        pollInterval = setInterval(() => {
          dispatch({
            type: 'WIND_DATA_FETCH_REQUESTED'
          });
        }, DATA_FETCH_INTERVAL);
      }
    } else {
      // TODO: Find a nicer way to invalidate the wind data (or remove it altogether when wind layer is moved to React).
      dispatch({
        type: 'WIND_DATA_FETCH_SUCCEEDED',
        payload: null
      });
    }

    return () => clearInterval(pollInterval);
  }, [windEnabled, customDatetime]);
}
export function useConditionalSolarDataPolling() {
  const solarEnabled = useSolarEnabled();
  const customDatetime = useCustomDatetime();
  const dispatch = useDispatch(); // After initial request, do the polling only if the custom datetime is not specified.

  useEffect(() => {
    let pollInterval;

    if (solarEnabled) {
      if (customDatetime) {
        dispatch({
          type: 'SOLAR_DATA_FETCH_REQUESTED',
          payload: {
            datetime: customDatetime
          }
        });
      } else {
        dispatch({
          type: 'SOLAR_DATA_FETCH_REQUESTED'
        });
        pollInterval = setInterval(() => {
          dispatch({
            type: 'SOLAR_DATA_FETCH_REQUESTED'
          });
        }, DATA_FETCH_INTERVAL);
      }
    } else {
      // TODO: Find a nicer way to invalidate the solar data (or remove it altogether when solar layer is moved to React).
      dispatch({
        type: 'SOLAR_DATA_FETCH_SUCCEEDED',
        payload: null
      });
    }

    return () => clearInterval(pollInterval);
  }, [solarEnabled, customDatetime]);
}