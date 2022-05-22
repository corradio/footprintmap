import { isEmpty } from '../pkg/lodash.js';
import moment from '../pkg/moment.js';
import { modeOrder } from '../helpers/constants.js';
import constructTopos from '../helpers/topos.js';
import globalcarbon from '../globalcarbon.json.proxy.js';
const CURRENT_YEAR = Object.values(globalcarbon.countries).flat().filter(d => d && d.totalFootprintMegatonsCO2).map(d => d.year).reduce((a, b) => Math.max(a, b), 0); // ** Prepare initial zone data

const zones = constructTopos(); // Add id to each zone

Object.keys(zones).forEach(k => {
  zones[k].countryCode = k;
});
const initialDataState = {
  // Here we will store data items
  grid: {
    zones,
    datetime: CURRENT_YEAR.toString()
  },
  hasConnectionWarning: false,
  hasInitializedGrid: true,
  histories: {},
  isLoadingHistories: false,
  isLoadingGrid: false,
  isLoadingSolar: false,
  isLoadingWind: false,
  solar: null,
  wind: null
}; // Load initial data

Object.entries(globalcarbon.countries).forEach(([k, v]) => {
  // eslint-disable-next-line no-shadow
  const {
    zones
  } = initialDataState.grid;

  if (!zones[k]) {
    console.error(`Couldn't copy global carbon data ${k} to zones. Is a geometry missing?`);
  } else {
    zones[k] = { ...zones[k],
      ...v.find(d => d.year === CURRENT_YEAR)
    };
  }

  initialDataState.histories[k] = v;
});
export default ((state = initialDataState, action) => {
  switch (action.type) {
    case 'GRID_DATA_FETCH_REQUESTED':
      {
        return { ...state,
          hasConnectionWarning: false,
          isLoadingGrid: true
        };
      }

    case 'GRID_DATA_FETCH_SUCCEEDED':
      {
        // Create new grid object
        const newGrid = Object.assign({}, {
          zones: Object.assign({}, state.grid.zones),
          exchanges: Object.assign({}, state.grid.exchanges)
        }); // Create new state

        const newState = Object.assign({}, state);
        newState.grid = newGrid; // Reset histories that expired

        newState.histories = Object.assign({}, state.histories);
        Object.keys(state.histories).forEach(k => {
          const history = state.histories[k];
          const lastHistoryMoment = moment(history[history.length - 1].stateDatetime).utc();
          const stateMoment = moment(action.payload.datetime).utc();

          if (lastHistoryMoment.add(15, 'minutes').isBefore(stateMoment)) {
            delete newState.histories[k];
          }
        }); // Reset all data we want to update (for instance, not maxCapacity)

        Object.keys(newGrid.zones).forEach(key => {
          const zone = Object.assign({}, newGrid.zones[key]);
          zone.co2intensity = undefined;
          zone.exchange = {};
          zone.production = {};
          zone.productionCo2Intensities = {};
          zone.productionCo2IntensitySources = {};
          zone.dischargeCo2Intensities = {};
          zone.dischargeCo2IntensitySources = {};
          zone.storage = {};
          zone.source = undefined;
          newGrid.zones[key] = zone;
        });
        Object.keys(newGrid.exchanges).forEach(key => {
          newGrid.exchanges[key].netFlow = undefined;
        }); // Populate with realtime country data

        Object.entries(action.payload.countries).forEach(entry => {
          const [key, value] = entry;
          const zone = newGrid.zones[key];

          if (!zone) {
            console.warn(`${key} has no zone configuration.`);
            return;
          } // Assign data from payload


          Object.keys(value).forEach(k => {
            // Warning: k takes all values, even those that are not meant
            // to be updated (like maxCapacity)
            zone[k] = value[k];
          }); // Set date

          zone.datetime = action.payload.datetime; // Validate data

          if (!zone.production) return;
          modeOrder.forEach(mode => {
            if (mode === 'other' || mode === 'unknown' || !zone.datetime) {
              return;
            } // Check missing values
            // if (country.production[mode] === undefined && country.storage[mode] === undefined)
            //    console.warn(`${key} is missing production or storage of ' + mode`);
            // Check validity of production


            if (zone.production[mode] !== undefined && zone.production[mode] < 0) {
              console.warn(`${key} has negative production of ${mode}`);
            } // Check load factors > 1


            if (zone.production[mode] !== undefined && (zone.capacity || {})[mode] !== undefined && zone.production[mode] > zone.capacity[mode]) {
              console.warn(`${key} produces more than its capacity of ${mode}`);
            }
          });

          if (!zone.exchange || !Object.keys(zone.exchange).length) {
            console.warn(`${key} is missing exchanges`);
          }
        }); // Populate exchange pairs for exchange layer

        Object.entries(action.payload.exchanges).forEach(entry => {
          const [key, value] = entry;
          const exchange = newGrid.exchanges[key];

          if (!exchange || !exchange.lonlat) {
            console.warn(`Missing exchange configuration for ${key}`);
            return;
          } // Assign all data


          Object.keys(value).forEach(k => {
            exchange[k] = value[k];
          });
        }); // Debug

        console.log(newGrid.zones);
        newState.hasInitializedGrid = true;
        newState.isLoadingGrid = false;
        return newState;
      }

    case 'GRID_DATA_FETCH_FAILED':
      {
        // TODO: Implement error handling
        return { ...state,
          hasConnectionWarning: true,
          isLoadingGrid: false
        };
      }

    case 'ZONE_HISTORY_FETCH_REQUESTED':
      {
        return { ...state,
          isLoadingHistories: true
        };
      }

    case 'ZONE_HISTORY_FETCH_SUCCEEDED':
      {
        return { ...state,
          isLoadingHistories: false,
          histories: { ...state.histories,
            [action.zoneId]: action.payload.map(datapoint => ({ ...datapoint,
              hasParser: true,
              // Exchange information is not shown in history observations without production data, as the percentages are incorrect
              exchange: isEmpty(datapoint.production) ? {} : datapoint.exchange
            }))
          }
        };
      }

    case 'ZONE_HISTORY_FETCH_FAILED':
      {
        // TODO: Implement error handling
        return { ...state,
          isLoadingHistories: false
        };
      }

    case 'SOLAR_DATA_FETCH_REQUESTED':
      {
        return { ...state,
          isLoadingSolar: true
        };
      }

    case 'SOLAR_DATA_FETCH_SUCCEEDED':
      {
        return { ...state,
          isLoadingSolar: false,
          solar: action.payload
        };
      }

    case 'SOLAR_DATA_FETCH_FAILED':
      {
        // TODO: Implement error handling
        return { ...state,
          isLoadingSolar: false,
          solar: null
        };
      }

    case 'WIND_DATA_FETCH_REQUESTED':
      {
        return { ...state,
          isLoadingWind: true
        };
      }

    case 'WIND_DATA_FETCH_SUCCEEDED':
      {
        return { ...state,
          isLoadingWind: false,
          wind: action.payload
        };
      }

    case 'WIND_DATA_FETCH_FAILED':
      {
        // TODO: Implement error handling
        return { ...state,
          isLoadingWind: false,
          wind: null
        };
      }

    default:
      return state;
  }
});