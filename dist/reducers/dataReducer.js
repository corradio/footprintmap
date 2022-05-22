import {isEmpty} from "../pkg/lodash.js";
import moment from "../pkg/moment.js";
import {modeOrder} from "../helpers/constants.js";
import constructTopos from "../helpers/topos.js";
import globalcarbon from "../globalcarbon.json.proxy.js";
const CURRENT_YEAR = Object.values(globalcarbon.countries).flat().filter((d) => d && d.totalFootprintMegatonsCO2).map((d) => d.year).reduce((a, b) => Math.max(a, b), 0);
const zones = constructTopos();
Object.keys(zones).forEach((k) => {
  zones[k].countryCode = k;
});
const initialDataState = {
  grid: {zones, datetime: CURRENT_YEAR.toString()},
  hasConnectionWarning: false,
  hasInitializedGrid: true,
  histories: {},
  isLoadingHistories: false,
  isLoadingGrid: false,
  isLoadingSolar: false,
  isLoadingWind: false,
  solar: null,
  wind: null
};
Object.entries(globalcarbon.countries).forEach(([k, v]) => {
  const {zones: zones2} = initialDataState.grid;
  if (!zones2[k]) {
    console.error(`Couldn't copy global carbon data ${k} to zones. Is a geometry missing?`);
  } else {
    zones2[k] = {...zones2[k], ...v.find((d) => d.year === CURRENT_YEAR)};
  }
  initialDataState.histories[k] = v;
});
export default (state = initialDataState, action) => {
  switch (action.type) {
    case "GRID_DATA_FETCH_REQUESTED": {
      return {...state, hasConnectionWarning: false, isLoadingGrid: true};
    }
    case "GRID_DATA_FETCH_SUCCEEDED": {
      const newGrid = Object.assign({}, {
        zones: Object.assign({}, state.grid.zones),
        exchanges: Object.assign({}, state.grid.exchanges)
      });
      const newState = Object.assign({}, state);
      newState.grid = newGrid;
      newState.histories = Object.assign({}, state.histories);
      Object.keys(state.histories).forEach((k) => {
        const history = state.histories[k];
        const lastHistoryMoment = moment(history[history.length - 1].stateDatetime).utc();
        const stateMoment = moment(action.payload.datetime).utc();
        if (lastHistoryMoment.add(15, "minutes").isBefore(stateMoment)) {
          delete newState.histories[k];
        }
      });
      Object.keys(newGrid.zones).forEach((key) => {
        const zone = Object.assign({}, newGrid.zones[key]);
        zone.co2intensity = void 0;
        zone.exchange = {};
        zone.production = {};
        zone.productionCo2Intensities = {};
        zone.productionCo2IntensitySources = {};
        zone.dischargeCo2Intensities = {};
        zone.dischargeCo2IntensitySources = {};
        zone.storage = {};
        zone.source = void 0;
        newGrid.zones[key] = zone;
      });
      Object.keys(newGrid.exchanges).forEach((key) => {
        newGrid.exchanges[key].netFlow = void 0;
      });
      Object.entries(action.payload.countries).forEach((entry) => {
        const [key, value] = entry;
        const zone = newGrid.zones[key];
        if (!zone) {
          console.warn(`${key} has no zone configuration.`);
          return;
        }
        Object.keys(value).forEach((k) => {
          zone[k] = value[k];
        });
        zone.datetime = action.payload.datetime;
        if (!zone.production) {
          return;
        }
        modeOrder.forEach((mode) => {
          if (mode === "other" || mode === "unknown" || !zone.datetime) {
            return;
          }
          if (zone.production[mode] !== void 0 && zone.production[mode] < 0) {
            console.warn(`${key} has negative production of ${mode}`);
          }
          if (zone.production[mode] !== void 0 && (zone.capacity || {})[mode] !== void 0 && zone.production[mode] > zone.capacity[mode]) {
            console.warn(`${key} produces more than its capacity of ${mode}`);
          }
        });
        if (!zone.exchange || !Object.keys(zone.exchange).length) {
          console.warn(`${key} is missing exchanges`);
        }
      });
      Object.entries(action.payload.exchanges).forEach((entry) => {
        const [key, value] = entry;
        const exchange = newGrid.exchanges[key];
        if (!exchange || !exchange.lonlat) {
          console.warn(`Missing exchange configuration for ${key}`);
          return;
        }
        Object.keys(value).forEach((k) => {
          exchange[k] = value[k];
        });
      });
      newState.hasInitializedGrid = true;
      newState.isLoadingGrid = false;
      return newState;
    }
    case "GRID_DATA_FETCH_FAILED": {
      return {...state, hasConnectionWarning: true, isLoadingGrid: false};
    }
    case "ZONE_HISTORY_FETCH_REQUESTED": {
      return {...state, isLoadingHistories: true};
    }
    case "ZONE_HISTORY_FETCH_SUCCEEDED": {
      return {
        ...state,
        isLoadingHistories: false,
        histories: {
          ...state.histories,
          [action.zoneId]: action.payload.map((datapoint) => ({
            ...datapoint,
            hasParser: true,
            exchange: isEmpty(datapoint.production) ? {} : datapoint.exchange
          }))
        }
      };
    }
    case "ZONE_HISTORY_FETCH_FAILED": {
      return {...state, isLoadingHistories: false};
    }
    case "SOLAR_DATA_FETCH_REQUESTED": {
      return {...state, isLoadingSolar: true};
    }
    case "SOLAR_DATA_FETCH_SUCCEEDED": {
      return {...state, isLoadingSolar: false, solar: action.payload};
    }
    case "SOLAR_DATA_FETCH_FAILED": {
      return {...state, isLoadingSolar: false, solar: null};
    }
    case "WIND_DATA_FETCH_REQUESTED": {
      return {...state, isLoadingWind: true};
    }
    case "WIND_DATA_FETCH_SUCCEEDED": {
      return {...state, isLoadingWind: false, wind: action.payload};
    }
    case "WIND_DATA_FETCH_FAILED": {
      return {...state, isLoadingWind: false, wind: null};
    }
    default:
      return state;
  }
};
