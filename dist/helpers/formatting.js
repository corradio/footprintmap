import {format} from "../pkg/d3-format.js";
import {CARBON_INTENSITY_DOMAIN} from "./constants.js";
export const formatPower = function(d, numDigits) {
  if (d == null || !Number.isFinite(d))
    return d;
  if (numDigits == null)
    numDigits = 3;
  return format("." + numDigits + "s")(d * 1e12) + "Wh";
};
export const formatCo2 = function(d, numDigits) {
  d /= 60;
  d /= 1e6;
  if (d == null || !Number.isFinite(d))
    return d;
  if (numDigits == null)
    numDigits = 3;
  if (d >= 1)
    return format("." + numDigits + "s")(d) + "t ofCO2eqPerMinute";
  else
    return format("." + numDigits + "s")(d * 1e6) + "g ofCO2eqPerMinute";
};
export const scaleEnergy = function(maxEnergy) {
  if (maxEnergy < 1)
    return {
      unit: "GWh",
      formattingFactor: 1e-3
    };
  if (maxEnergy < 1e3)
    return {
      unit: "TWh",
      formattingFactor: 1
    };
  else
    return {
      unit: "PWh",
      formattingFactor: 1e3
    };
};
export const scaleMillionsShort = function(maxValue, useSI = false) {
  if (maxValue < 1e-3)
    return {
      unit: "",
      formattingFactor: 1e-6
    };
  if (maxValue < 1)
    return {
      unit: "k",
      formattingFactor: 1e-3
    };
  if (maxValue < 1e3)
    return {
      unit: "M",
      formattingFactor: 1
    };
  if (maxValue < 1e6)
    return {
      unit: useSI ? "G" : "B",
      formattingFactor: 1e3
    };
  else
    return {
      unit: "T",
      formattingFactor: 1e6
    };
};
export const scaleMillions = function(maxValue) {
  if (maxValue < 1e-3)
    return {
      unit: "",
      formattingFactor: 1e-6
    };
  if (maxValue < 1)
    return {
      unit: "Thousand",
      formattingFactor: 1e-3
    };
  if (maxValue < 1e3)
    return {
      unit: "Million",
      formattingFactor: 1
    };
  if (maxValue < 1e6)
    return {
      unit: "Billion",
      formattingFactor: 1e3
    };
  else
    return {
      unit: "Trillion",
      formattingFactor: 1e6
    };
};
export const formatCarbonIntensityUnit = (carbonIntensityDomain) => {
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.ENERGY) {
    return "tCO₂ per GWh";
  }
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.POPULATION) {
    return "tCO₂ per capita";
  }
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.GDP) {
    return "gCO₂ per $";
  }
  throw new Error("Not implemented yet");
};
export const formatCarbonIntensityShortUnit = (carbonIntensityDomain) => {
  return formatCarbonIntensityUnit(carbonIntensityDomain)[0];
};
export const formatCarbonIntensityDescription = (carbonIntensityDomain, electricityMixMode) => {
  let desc = "";
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.ENERGY) {
    if (electricityMixMode === "consumption") {
      desc += "Carbon footprint of energy consumed";
    } else {
      desc += "Territorial footprint of energy produced";
    }
  } else if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.POPULATION) {
    desc += `Carbon footprint per capita`;
    desc += ` (${electricityMixMode !== "consumption" ? "territorial" : "incl. imported"})`;
  } else if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.GDP) {
    desc += `Carbon footprint of the economy`;
    desc += ` (${electricityMixMode !== "consumption" ? "territorial" : "incl. imported"})`;
  } else {
    throw new Error("Not implemented yet");
  }
  return desc;
};
