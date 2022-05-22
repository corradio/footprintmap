import {combineReducers} from "../pkg/redux.js";
import {CARBON_INTENSITY_DOMAIN} from "../helpers/constants.js";
import {getKey} from "../helpers/storage.js";
import {isLocalhost, isProduction} from "../helpers/environment.js";
import dataReducer from "./dataReducer.js";
const cookieGetBool = (key, defaultValue) => {
  const val = getKey(key);
  if (val == null) {
    return defaultValue;
  }
  return val === "true";
};
const initialApplicationState = {
  bundleHash: window.bundleHash,
  callerLocation: null,
  callerZone: null,
  clientType: window.isCordova ? "mobileapp" : "web",
  co2ColorbarValue: null,
  colorBlindModeEnabled: cookieGetBool("colorBlindModeEnabled", false),
  brightModeEnabled: cookieGetBool("brightModeEnabled", true),
  electricityMixMode: "consumption",
  isCordova: window.isCordova,
  isEmbedded: window.top !== window.self,
  isHoveringExchange: false,
  isLeftPanelCollapsed: false,
  isMovingMap: false,
  isLoadingMap: true,
  isMobile: /android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(navigator.userAgent),
  isProduction: isProduction(),
  isLocalhost: isLocalhost(),
  legendVisible: true,
  locale: window.locale,
  mapViewport: {
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: 50,
    longitude: 0,
    zoom: 1.5
  },
  onboardingSeen: cookieGetBool("onboardingSeen", false),
  searchQuery: null,
  selectedZoneTimeIndex: null,
  solarColorbarValue: null,
  webGLSupported: true,
  windColorbarValue: null,
  carbonIntensityDomain: CARBON_INTENSITY_DOMAIN.POPULATION,
  tableDisplayEmissions: false
};
const applicationReducer = (state = initialApplicationState, action) => {
  switch (action.type) {
    case "APPLICATION_STATE_UPDATE": {
      const {key, value} = action;
      if (state[key] === value) {
        return state;
      }
      if (key === "electricityMixMode" && !["consumption", "production"].includes(value)) {
        throw Error(`Unknown electricityMixMode "${value}"`);
      }
      return {...state, [key]: value};
    }
    default:
      return state;
  }
};
export default combineReducers({
  application: applicationReducer,
  data: dataReducer
});
