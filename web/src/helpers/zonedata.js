import { isFinite } from 'lodash';
import { CARBON_INTENSITY_DOMAIN, FOSSIL_FUEL_KEYS } from './constants';

export function getElectricityProductionValue({ capacity, isStorage, production, storage }) {
  const value = isStorage ? -storage : production;
  // If the value is not defined but the capacity
  // is zero, assume the value is also zero.
  if (!isFinite(value) && capacity === 0) {
    return 0;
  }
  return value;
}

export function getProductionCo2Intensity(mode, zoneData) {
  const isStorage = mode.indexOf('storage') !== -1;
  const resource = mode.replace(' storage', '');

  const storage = (zoneData.storage || {})[resource];
  const storageCo2Intensity = (zoneData.storageCo2Intensities || {})[resource];
  const dischargeCo2Intensity = (zoneData.dischargeCo2Intensities || {})[resource];
  const productionCo2Intensity = (zoneData.productionCo2Intensities || {})[resource];

  // eslint-disable-next-line no-nested-ternary
  return isStorage ? (storage > 0 ? storageCo2Intensity : dischargeCo2Intensity) : productionCo2Intensity;
}

export function getExchangeCo2Intensity(mode, zoneData, electricityMixMode) {
  const exchange = (zoneData.exchange || {})[mode];
  const exchangeCo2Intensity = (zoneData.exchangeCo2Intensities || {})[mode];

  // eslint-disable-next-line no-nested-ternary
  return exchange > 0
    ? exchangeCo2Intensity
    : electricityMixMode === 'consumption'
    ? zoneData.co2intensity
    : zoneData.co2intensityProduction;
}

export function getTotalElectricity(data, displayByEmissions, electricityMixMode) {
  if (electricityMixMode === 'consumption') {
    return displayByEmissions ? data.totalFootprintMegatonsCO2 : data.totalPrimaryEnergyConsumptionTWh;
  }
  return displayByEmissions ? data.totalEmissionsMegatonsCO2 : data.totalPrimaryEnergyProductionTWh;
}

export function getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, data) {
  if (!data) {
    return undefined;
  }
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.ENERGY) {
    if (data.totalPrimaryEnergyConsumptionTWh == null) {
      return undefined;
    }
    if (electricityMixMode === 'consumption') {
      if (data.totalFootprintMegatonsCO2 == null) {
        return undefined;
      }
      return (data.totalFootprintMegatonsCO2 / data.totalPrimaryEnergyConsumptionTWh) * 1000;
    }
    if (data.totalEmissionsMegatonsCO2 == null) {
      return undefined;
    }
    return (data.totalEmissionsMegatonsCO2 / data.totalPrimaryEnergyProductionTWh) * 1000;
  }
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.POPULATION) {
    if (electricityMixMode === 'consumption') {
      return data.totalFootprintTonsCO2PerCapita;
    }
    return data.totalEmissionsTonsCO2PerCapita;
  }
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.GDP) {
    if (data.gdpMillionsCurrentUSD == null) {
      return undefined;
    }
    if (electricityMixMode === 'consumption') {
      if (data.totalFootprintMegatonsCO2 == null) {
        return undefined;
      }
      return (data.totalFootprintMegatonsCO2 / data.gdpMillionsCurrentUSD) * 1e6;
    }
    if (data.totalEmissionsMegatonsCO2 == null) {
      return undefined;
    }
    return (data.totalEmissionsMegatonsCO2 / data.gdpMillionsCurrentUSD) * 1e6;
  }
  throw new Error('Not implemented yet');
}

function getEnergyRatio(electricityMixMode, data, filter) {
  const key = electricityMixMode === 'consumption' ? 'primaryEnergyConsumptionTWh' : 'primaryEnergyProductionTWh';
  const keyTotal =
    electricityMixMode === 'consumption' ? 'totalPrimaryEnergyConsumptionTWh' : 'totalPrimaryEnergyProductionTWh';
  if (!data || !data[key]) {
    return { percentage: null };
  }
  return (
    Object.keys(data[key])
      .filter(filter)
      .map((k) => data[key][k])
      .reduce((a, b) => a + b, 0) / data[keyTotal]
  );
}

export function getRenewableRatio(electricityMixMode, data) {
  return getEnergyRatio(electricityMixMode, data, (k) => !FOSSIL_FUEL_KEYS.includes(k) && k !== 'nuclear');
}
export function getLowcarbonRatio(electricityMixMode, data) {
  return getEnergyRatio(electricityMixMode, data, (k) => !FOSSIL_FUEL_KEYS.includes(k));
}
