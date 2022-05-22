import moment from 'moment';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { matchPath } from 'react-router';

function useCurrentZoneId() {
  const match = matchPath(useLocation().pathname, { path: '/zone/:zoneId' });
  if (match) {
    const { zoneId } = match.params;
    return zoneId;
  }
  return;
}

export function useCurrentZoneHistory() {
  const zoneId = useCurrentZoneId();
  const histories = useSelector((state) => state.data.histories);

  return useMemo(() => histories[zoneId] || [], [histories, zoneId]);
}

export function useCurrentZoneHistoryDatetimes() {
  const zoneHistory = useCurrentZoneHistory();

  return useMemo(() => zoneHistory.map((d) => moment(d.year.toString()).toDate()), [zoneHistory]);
}

// Use current time as the end time of the graph time scale explicitly
// as we want to make sure we account for the missing data at the end of
// the graph (when not inferable from historyData timestamps).
export function useCurrentZoneHistoryEndTime() {
  return moment().format('YYYY');
}

// TODO: Likewise, we should be passing an explicit startTime set to 24h
// in the past to make sure we show data is missing at the beginning of
// the graph, but right now that would create UI inconsistency with the
// other neighbouring graphs showing data over a bit longer time scale
// (see https://github.com/tmrowco/electricitymap-contrib/issues/2250).
export function useCurrentZoneHistoryStartTime() {
  return null;
}

export function useCurrentZoneData() {
  const zoneId = useCurrentZoneId();
  const zoneHistory = useCurrentZoneHistory();
  const zoneTimeIndex = useSelector((state) => state.application.selectedZoneTimeIndex);
  const grid = useSelector((state) => state.data.grid);

  return useMemo(() => {
    if (!zoneId || !grid) {
      return null;
    }
    if (zoneTimeIndex === null) {
      return grid.zones[zoneId];
    }
    return zoneHistory[zoneTimeIndex];
  }, [zoneId, zoneHistory, zoneTimeIndex, grid]);
}

export function useLoadingOverlayVisible() {
  const mapInitializing = useSelector((state) => state.application.isLoadingMap);
  const gridInitializing = useSelector((state) => state.data.isLoadingGrid && !state.data.hasInitializedGrid);
  const solarInitializing = useSelector((state) => state.data.isLoadingSolar && !state.data.solar);
  const windInitializing = useSelector((state) => state.data.isLoadingWind && !state.data.wind);
  return mapInitializing || gridInitializing || solarInitializing || windInitializing;
}

export function useSmallLoaderVisible() {
  const gridLoading = useSelector((state) => state.data.isLoadingGrid);
  const solarLoading = useSelector((state) => state.data.isLoadingSolar);
  const windLoading = useSelector((state) => state.data.isLoadingWind);
  return gridLoading || solarLoading || windLoading;
}

export function useCarbonIntensityDomain() {
  return useSelector((state) => state.application.carbonIntensityDomain);
}
