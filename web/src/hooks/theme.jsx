import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { scaleLinear } from 'd3-scale';

import { themes } from '../helpers/themes';

export function useTheme() {
  const brightModeEnabled = useSelector((state) => state.application.brightModeEnabled);
  const colorBlindModeEnabled = useSelector((state) => state.application.colorBlindModeEnabled);

  return useMemo(
    () =>
      // eslint-disable-next-line no-nested-ternary
      brightModeEnabled
        ? colorBlindModeEnabled
          ? themes.colorblindBright
          : themes.bright
        : colorBlindModeEnabled
        ? themes.colorblindDark
        : themes.dark,
    [brightModeEnabled, colorBlindModeEnabled]
  );
}

export function useCo2ColorScale() {
  const theme = useTheme();
  const carbonIntensityDomain = useSelector((state) => state.application.carbonIntensityDomain);

  return useMemo(
    () =>
      scaleLinear()
        .domain(theme.co2Scale.steps(carbonIntensityDomain))
        .range(theme.co2Scale.colors)
        .unknown('gray')
        .clamp(true),
    [theme, carbonIntensityDomain]
  );
}
