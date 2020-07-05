import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { mapValues, isFinite } from 'lodash';

import { useCo2ColorScale } from './theme';
import { useCarbonIntensityDomain } from './redux';
import { getZoneCarbonIntensity } from '../helpers/zonedata';

export function useZonesWithColors() {
  const electricityMixMode = useSelector(state => state.application.electricityMixMode);
  const zones = useSelector(state => state.data.grid.zones);
  const co2ColorScale = useCo2ColorScale();
  const carbonIntensityDomain = useCarbonIntensityDomain();

  return useMemo(
    () => (
      mapValues(zones, (zone) => {
        const co2intensity = getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, zone);
        return {
          ...zone,
          color: isFinite(co2intensity) ? co2ColorScale(co2intensity) : undefined,
          isClickable: true,
        };
      })
    ),
    [zones, electricityMixMode, co2ColorScale],
  );
}
