import React, { useState, useMemo } from '../pkg/react.js';
import { useLocation, useHistory } from '../pkg/react-router-dom.js';
import { useSelector } from '../pkg/react-redux.js';
import { debounce } from '../pkg/lodash.js';
import thirdPartyServices from '../services/thirdparty.js';
import { getZoneId } from '../helpers/router.js';
import { getValueAtPosition } from '../helpers/grib.js';
import { calculateLengthFromDimensions } from '../helpers/math.js';
import { getCenteredZoneViewport, getCenteredLocationViewport } from '../helpers/map.js';
import { useInterpolatedSolarData, useInterpolatedWindData } from '../hooks/layers.js';
import { useTheme, useCo2ColorScale } from '../hooks/theme.js';
import { useTrackEvent } from '../hooks/tracking.js';
import { dispatchApplication } from '../store.js';
import ZoneMap from '../components/zonemap.js';
import MapLayer from '../components/maplayer.js';
import MapCountryTooltip from '../components/tooltips/mapcountrytooltip.js';
import ExchangeLayer from '../components/layers/exchangelayer.js';
import SolarLayer from '../components/layers/solarlayer.js';
import WindLayer from '../components/layers/windlayer.js';
import { useCarbonIntensityDomain } from '../hooks/redux.js';
import { getZoneCarbonIntensity } from '../helpers/zonedata.js';
const debouncedReleaseMoving = debounce(() => {
  dispatchApplication('isMovingMap', false);
}, 200);
export default (() => {
  const webGLSupported = useSelector(state => state.application.webGLSupported);
  const isHoveringExchange = useSelector(state => state.application.isHoveringExchange);
  const electricityMixMode = useSelector(state => state.application.electricityMixMode);
  const callerLocation = useSelector(state => state.application.callerLocation);
  const isLoadingMap = useSelector(state => state.application.isLoadingMap);
  const isEmbedded = useSelector(state => state.application.isEmbedded);
  const isMobile = useSelector(state => state.application.isMobile);
  const viewport = useSelector(state => state.application.mapViewport);
  const selectedZoneTimeIndex = useSelector(state => state.application.selectedZoneTimeIndex);
  const zoneHistories = useSelector(state => state.data.histories);
  const solarData = useInterpolatedSolarData();
  const windData = useInterpolatedWindData();
  const zones = useSelector(state => state.data.grid.zones);
  const trackEvent = useTrackEvent();
  const location = useLocation();
  const history = useHistory();
  const carbonIntensityDomain = useCarbonIntensityDomain();
  const co2ColorScale = useCo2ColorScale(); // TODO: Replace with useParams().zoneId once this component gets
  // put in the right render context and has this param available.

  const zoneId = getZoneId();
  const theme = useTheme();
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [tooltipZoneData, setTooltipZoneData] = useState(null);
  const zoneValues = useMemo(() => Object.values(zones), [zones]);
  const handleMapLoaded = useMemo(() => () => {
    // Center the map initially based on the focused zone and the user geolocation.
    if (zoneId) {
      console.log(`Centering on zone ${zoneId}`);
      dispatchApplication('mapViewport', getCenteredZoneViewport(zones[zoneId]));
    } else if (callerLocation) {
      console.log(`Centering on browser location (${callerLocation})`);
      dispatchApplication('mapViewport', getCenteredLocationViewport(callerLocation));
    } // Map loading is finished, lower the overlay shield with
    // a bit of delay to allow the background to render first.


    setTimeout(() => {
      dispatchApplication('isLoadingMap', false);
    }, 100); // Track and notify that WebGL is supported.

    dispatchApplication('webGLSupported', true);

    if (thirdPartyServices._ga) {
      thirdPartyServices._ga.timingMark('map_loaded');
    }
  }, [zones, zoneId, callerLocation]);

  const handleMapError = e => {
    console.error(e.error); // Map loading is finished, lower the overlay shield.

    dispatchApplication('isLoadingMap', false); // Disable the map and redirect to zones ranking.

    dispatchApplication('webGLSupported', false);
    history.push({
      pathname: '/ranking',
      search: location.search
    });
  };

  const handleMouseMove = useMemo(() => ({
    longitude,
    latitude,
    x,
    y
  }) => {
    dispatchApplication('solarColorbarValue', getValueAtPosition(longitude, latitude, solarData));
    dispatchApplication('windColorbarValue', calculateLengthFromDimensions(getValueAtPosition(longitude, latitude, windData && windData[0]), getValueAtPosition(longitude, latitude, windData && windData[1])));
    setTooltipPosition({
      x,
      y
    });
  }, [solarData, windData]);
  const handleSeaClick = useMemo(() => () => {
    history.push({
      pathname: '/map',
      search: location.search
    });
  }, [history, location]);
  const handleZoneClick = useMemo(() => id => {
    trackEvent('countryClick');
    dispatchApplication('isLeftPanelCollapsed', false);
    history.push({
      pathname: `/zone/${id}`,
      search: location.search
    });
  }, [trackEvent, history, location]);
  const handleZoneMouseEnter = useMemo(() => data => {
    dispatchApplication('co2ColorbarValue', getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, data));
    setTooltipZoneData(data);
  }, [electricityMixMode]);
  const handleZoneMouseLeave = useMemo(() => () => {
    dispatchApplication('co2ColorbarValue', null);
    setTooltipZoneData(null);
  }, []);
  const handleViewportChange = useMemo(() => ({
    width,
    height,
    latitude,
    longitude,
    zoom
  }) => {
    dispatchApplication('isMovingMap', true);
    dispatchApplication('mapViewport', {
      width,
      height,
      latitude,
      longitude,
      zoom
    }); // TODO: Try tying this to internal map state
    // somehow to remove the need for debouncing.

    debouncedReleaseMoving();
  }, []);
  const handleResize = useMemo(() => ({
    width,
    height
  }) => {
    handleViewportChange({ ...viewport,
      width,
      height
    });
  }, [viewport]); // Animate map transitions only after the map has been loaded.

  const transitionDuration = isLoadingMap ? 0 : 300;
  const hoveringEnabled = !isHoveringExchange && !isMobile;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    id: "webgl-error",
    className: `flash-message ${!webGLSupported ? 'active' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "inner"
  }, "The map can't be rendered because this browser does not support WebGL.")), tooltipPosition && tooltipZoneData && hoveringEnabled && /*#__PURE__*/React.createElement(MapCountryTooltip, {
    zoneData: tooltipZoneData,
    position: tooltipPosition,
    onClose: () => setTooltipZoneData(null)
  }), /*#__PURE__*/React.createElement(ZoneMap, {
    co2ColorScale: co2ColorScale,
    hoveringEnabled: hoveringEnabled,
    onMapLoaded: handleMapLoaded,
    onMapError: handleMapError,
    onMouseMove: handleMouseMove,
    onResize: handleResize,
    onSeaClick: handleSeaClick,
    onViewportChange: handleViewportChange,
    onZoneClick: handleZoneClick,
    onZoneMouseEnter: handleZoneMouseEnter,
    onZoneMouseLeave: handleZoneMouseLeave,
    selectedZoneTimeIndex: selectedZoneTimeIndex,
    scrollZoom: !isEmbedded,
    theme: theme,
    transitionDuration: transitionDuration,
    viewport: viewport,
    zones: zoneValues,
    zoneHistories: zoneHistories
  }, /*#__PURE__*/React.createElement(MapLayer, {
    component: ExchangeLayer
  }), /*#__PURE__*/React.createElement(MapLayer, {
    component: WindLayer
  }), /*#__PURE__*/React.createElement(MapLayer, {
    component: SolarLayer
  })));
});