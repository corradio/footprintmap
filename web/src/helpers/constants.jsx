// Production/imports-exports mode
const modeColor = {
  solar: '#f27406',
  wind: '#74cdb9',
  hydro: '#2772b2',
  'hydro storage': '#0052cc',
  battery: 'lightgray',
  'battery storage': '#b76bcf',
  biomass: '#166a57',
  geothermal: 'yellow',
  nuclear: '#AEB800',
  gas: '#bb2f51',
  coal: '#ac8c35',
  oil: '#867d66',
  unknown: '#ACACAC',
};
const modeOrder = [
  'nuclear',
  // 'geothermal',
  'biomass',
  'coal',
  'wind',
  'solar',
  'hydro',
  // 'hydro storage',
  // 'battery storage',
  'gas',
  'oil',
  'unknown',
];
const PRODUCTION_MODES = modeOrder.filter((d) => d.indexOf('storage') === -1);
const STORAGE_MODES = modeOrder.filter((d) => d.indexOf('storage') !== -1).map((d) => d.replace(' storage', ''));

const DEFAULT_FLAG_SIZE = 16;

const FOSSIL_FUEL_KEYS = ['oil', 'gas', 'coal'];

const CARBON_INTENSITY_DOMAIN = {
  ENERGY: 'ENERGY',
  POPULATION: 'POPULATION',
  GDP: 'GDP',
};

export {
  modeColor,
  modeOrder,
  PRODUCTION_MODES,
  STORAGE_MODES,
  DEFAULT_FLAG_SIZE,
  CARBON_INTENSITY_DOMAIN,
  FOSSIL_FUEL_KEYS,
};
