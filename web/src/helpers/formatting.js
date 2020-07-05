/* eslint-disable */
// TODO: remove once refactored

var d3 = require('d3-format');
var translation = require('./translation');
const { CARBON_INTENSITY_DOMAIN } = require('../helpers/constants');

module.exports.formatPower = function (d, numDigits) {
  // Assume MW input
  if (d == null || d === NaN) return d;
  if (numDigits == null) numDigits = 3;
  return d3.format('.' + numDigits + 's')(d * 1e6) + 'W';
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
module.exports.scaleGdp = function (maxGdp) {
  // Assume million USD input
  if (maxGdp < 1)
    return {
      unit: "k$ USD",
      formattingFactor: 1e-3
    }
  if (maxGdp < 1e3)
    return {
      unit: "M$ USD",
      formattingFactor: 1
    }
  if (maxGdp < 1e6)
    return {
      unit: "B$ USD",
      formattingFactor: 1e3
    }
  else return {
    unit: "T$ USD",
    formattingFactor: 1e6
  }
};

module.exports.scaleMillions = function (maxGdp) {
  // Assume million USD input
  if (maxGdp < 1)
    return {
      unit: "Thousand",
      formattingFactor: 1e-3
    }
  if (maxGdp < 1e3)
    return {
      unit: "Million",
      formattingFactor: 1
    }
  if (maxGdp < 1e6)
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
    return 'tCO2/GWh'; // i.e. ktCO2/TWh
  }
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.POPULATION) {
    return 'tCO2/capita';
  }
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.GDP) {
    return 'gCO2/$'; // i.e. tCO2/M$
  }
  throw new Error('Not implemented yet');
}

module.exports.formatCarbonIntensityShortUnit = (carbonIntensityDomain) => {
  return module.exports.formatCarbonIntensityUnit(carbonIntensityDomain)[0];
}

