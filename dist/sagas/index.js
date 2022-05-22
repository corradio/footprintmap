import { call, put, select, takeLatest } from '../pkg/redux-saga/effects.js';
import thirdPartyServices from '../services/thirdparty.js';
import { handleRequestError, protectedJsonRequest } from '../helpers/api.js';
import { history } from '../helpers/router.js';

function* fetchZoneHistory(action) {
  const {
    zoneId
  } = action.payload;

  try {
    const payload = yield call(protectedJsonRequest, `/v3/history?countryCode=${zoneId}`);
    yield put({
      type: 'ZONE_HISTORY_FETCH_SUCCEEDED',
      zoneId,
      payload
    });
  } catch (err) {
    yield put({
      type: 'ZONE_HISTORY_FETCH_FAILED'
    });
    handleRequestError(err);
  }
}

function* trackEvent(action) {
  const appState = yield select(state => state.application);
  const searchParams = new URLSearchParams(history.location.search);
  const {
    eventName,
    context = {}
  } = action.payload;
  yield call([thirdPartyServices, thirdPartyServices.trackEvent], eventName, { // Pass whole of the application state ...
    ...appState,
    bundleVersion: appState.bundleHash,
    embeddedUri: appState.isEmbedded ? document.referrer : null,
    // ... together with the URL context ...
    currentPage: history.location.pathname.split('/')[1],
    selectedZoneName: history.location.pathname.split('/')[2],
    solarEnabled: searchParams.get('solar') === 'true',
    windEnabled: searchParams.get('wind') === 'true',
    // ... and whatever context is explicitly provided.
    ...context
  });
}

export default function* () {
  // Data fetching
  // yield takeLatest('GRID_DATA_FETCH_REQUESTED', fetchGridData);
  // yield takeLatest('WIND_DATA_FETCH_REQUESTED', fetchWindData);
  // yield takeLatest('SOLAR_DATA_FETCH_REQUESTED', fetchSolarData);
  yield takeLatest('ZONE_HISTORY_FETCH_REQUESTED', fetchZoneHistory); // yield takeLatest('CLIENT_VERSION_FETCH_REQUESTED', fetchClientVersion);
  // Analytics

  yield takeLatest('TRACK_EVENT', trackEvent);
}