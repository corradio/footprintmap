import {useMemo} from "../pkg/react.js";
import {useSelector} from "../pkg/react-redux.js";
import {scaleLinear} from "../pkg/d3-scale.js";
import {themes} from "../helpers/themes.js";
export function useTheme() {
  const brightModeEnabled = useSelector((state) => state.application.brightModeEnabled);
  const colorBlindModeEnabled = useSelector((state) => state.application.colorBlindModeEnabled);
  return useMemo(() => brightModeEnabled ? colorBlindModeEnabled ? themes.colorblindBright : themes.bright : colorBlindModeEnabled ? themes.colorblindDark : themes.dark, [brightModeEnabled, colorBlindModeEnabled]);
}
export function useCo2ColorScale() {
  const theme = useTheme();
  const carbonIntensityDomain = useSelector((state) => state.application.carbonIntensityDomain);
  return useMemo(() => scaleLinear().domain(theme.co2Scale.steps(carbonIntensityDomain)).range(theme.co2Scale.colors).unknown("gray").clamp(true), [theme, carbonIntensityDomain]);
}
