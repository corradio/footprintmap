/* eslint-disable */
// TODO: remove once refactored

var d3 = require('d3-format');
var translation = require('./translation');
const { CARBON_INTENSITY_DOMAIN } = require('../helpers/constants');

module.exports.formatPower = function (d, numDigits) {
  // Assume TWh input
  if (d == null || d === NaN) return d;
  if (numDigits == null) numDigits = 3;
  return d3.format('.' + numDigits + 's')(d * 1e12) + 'Wh';
};
module.exports.formatCo2 = function (d, numDigits) {
  // Assume gCO₂ / h input
  d /= 60; // Convert to gCO₂ / min
  d /= 1e6; // Convert to tCO₂ / min
  if (d == null || d === NaN) return d;
  if (numDigits == null) numDigits = 3;
  if (d >= 1) // a ton or more
    return d3.format('.' + numDigits + 's')(d) + 't ' + translation.translate('ofCO2eqPerMinute');
  else
    return d3.format('.' + numDigits + 's')(d * 1e6) + 'g ' + translation.translate('ofCO2eqPerMinute');
};
module.exports.scaleEnergy = function (maxEnergy) {
  // Assume TWh input
  if (maxEnergy < 1) 
    return {
      unit: "GWh",
      formattingFactor: 1e-3
    }
  if (maxEnergy < 1e3) 
    return {
      unit: "TWh",
      formattingFactor: 1
    }
  else return {
      unit: "PWh",
      formattingFactor: 1e3
    }
};
module.exports.scaleMillionsShort = function (maxValue, useSI = false) {
  // Assume million input
  if (maxValue < 1e-3)
    return {
      unit: "",
      formattingFactor: 1e-6
    }
  if (maxValue < 1)
    return {
      unit: "k",
      formattingFactor: 1e-3
    }
  if (maxValue < 1e3)
    return {
      unit: "M",
      formattingFactor: 1
    }
  if (maxValue < 1e6)
    return {
      unit: useSI ? "G" : "B",
      formattingFactor: 1e3
    }
  else return {
    unit: "T",
    formattingFactor: 1e6
  }
};

module.exports.scaleMillions = function (maxValue) {
  // Assume million input
  if (maxValue < 1e-3)
    return {
      unit: "",
      formattingFactor: 1e-6
    }
  if (maxValue < 1)
    return {
      unit: "Thousand",
      formattingFactor: 1e-3
    }
  if (maxValue < 1e3)
    return {
      unit: "Million",
      formattingFactor: 1
    }
  if (maxValue < 1e6)
    return {
      unit: "Billion",
      formattingFactor: 1e3
    }
  else return {
    unit: "Trillion",
    formattingFactor: 1e6
  }
};

module.exports.formatCarbonIntensityUnit = (carbonIntensityDomain) => {
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.ENERGY) {
    return 'tCO₂ per GWh'; // i.e. ktCO₂ / TWh
  }
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.POPULATION) {
    return 'tCO₂ per capita';
  }
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.GDP) {
    return 'gCO₂ per $'; // i.e. tCO₂ / M$
  }
  throw new Error('Not implemented yet');
}

module.exports.formatCarbonIntensityShortUnit = (carbonIntensityDomain) => {
  return module.exports.formatCarbonIntensityUnit(carbonIntensityDomain)[0];
}

module.exports.formatCarbonIntensityDescription = (carbonIntensityDomain, electricityMixMode) => {
  let desc = '';
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.ENERGY) {
    desc += `Carbon footprint of energy`;
    desc += ` ${electricityMixMode !== 'consumption' ? 'produced' : 'consumed'}`;
  }
  else if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.POPULATION) {
    desc += `Carbon footprint per capita`;
    desc += ` (${electricityMixMode !== 'consumption' ? 'territorial' : 'incl. imported'})`;
  }
  else if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.GDP) {
    desc += `Carbon footprint of the economy`;
    desc += ` (${electricityMixMode !== 'consumption' ? 'territorial' : 'incl. imported'})`;
  }
  else {
    throw new Error('Not implemented yet');
  }
  return desc;
}

