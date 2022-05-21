import { CARBON_INTENSITY_DOMAIN } from './constants';

function getMaxCo2(carbonIntensityDomain) {
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.POPULATION) {
    return 20;
  }
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.GDP) {
    return 2000;
  }
  if (carbonIntensityDomain === CARBON_INTENSITY_DOMAIN.ENERGY) {
    return 400;
  }
  return null;
}

function getCo2Steps(carbonIntensityDomain) {
  const maxCo2 = getMaxCo2(carbonIntensityDomain) || 800;
  return [0, 150, 600, 750, 800]
    .map(d => d / 800 * maxCo2);
}

export const themes = {
  colorblindDark: {
    co2Scale: {
      steps: getCo2Steps,
      colors: ['#FCFAC4', '#FAB484', '#F57965', '#DA4D6B', '#DA4D6B'],
    },
    oceanColor: '#33414A',
    strokeWidth: 0.3,
    strokeColor: '#6D6D6D',
    clickableFill: '#7A878D',
    nonClickableFill: '#7A878D',
  },
  dark: {
    co2Scale: {
      steps: getCo2Steps,
      colors: ['#2AA364', '#F5EB4D', '#9E4229', '#381D02', '#381D02'],
    },
    oceanColor: '#33414A',
    strokeWidth: 0.3,
    strokeColor: '#6D6D6D',
    clickableFill: '#7A878D',
    nonClickableFill: '#7A878D',
  },
  colorblindBright: {
    co2Scale: {
      steps: getCo2Steps,
      colors: ['#FCFAC4', '#FAB484', '#F57965', '#DA4D6B', '#DA4D6B'],
    },
    oceanColor: '#FAFAFA',
    strokeWidth: 0.3,
    strokeColor: '#FAFAFA',
    clickableFill: '#D4D9DE',
    nonClickableFill: '#D4D9DE',
  },
  bright: {
    co2Scale: {
      steps: getCo2Steps,
      colors: ['#2AA364', '#F5EB4D', '#9E4229', '#381D02', '#381D02'],
    },
    oceanColor: '#FAFAFA',
    strokeWidth: 0.3,
    strokeColor: '#FAFAFA',
    clickableFill: '#D4D9DE',
    nonClickableFill: '#D4D9DE',
  },
};
