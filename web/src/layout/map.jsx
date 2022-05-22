import React, { useState, useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';

import thirdPartyServices from '../services/thirdparty';
import { getZoneId } from '../helpers/router';
import { getCenteredZoneViewport, getCenteredLocationViewport } from '../helpers/map';
import { useTheme, useCo2ColorScale } from '../hooks/theme';
import { useTrackEvent } from '../hooks/tracking';
import { dispatchApplication } from '../store';

import ZoneMap from '../components/zonemap';
import MapCountryTooltip from '../components/tooltips/mapcountrytooltip';
import { useCarbonIntensityDomain } from '../hooks/redux';
import { getZoneCarbonIntensity } from '../helpers/zonedata';

const debouncedReleaseMoving = debounce(() => {
  dispatchApplication('isMovingMap', false);
}, 200);

export default () => {
  const webGLSupported = useSelector((state) => state.application.webGLSupported);
  const isHoveringExchange = useSelector((state) => state.application.isHoveringExchange);
  const electricityMixMode = useSelector((state) => state.application.electricityMixMode);
  const callerLocation = useSelector((state) => state.application.callerLocation);
  const isLoadingMap = useSelector((state) => state.application.isLoadingMap);
  const isEmbedded = useSelector((state) => state.application.isEmbedded);
  const isMobile = useSelector((state) => state.application.isMobile);
  const viewport = useSelector((state) => state.application.mapViewport);
  const selectedZoneTimeIndex = useSelector((state) => state.application.selectedZoneTimeIndex);
  const zoneHistories = useSelector((state) => state.data.histories);
  const zones = useSelector((state) => state.data.grid.zones);
  const trackEvent = useTrackEvent();
  const location = useLocation();
  const history = useHistory();
  const carbonIntensityDomain = useCarbonIntensityDomain();
  const co2ColorScale = useCo2ColorScale();
  // TODO: Replace with useParams().zoneId once this component gets
  // put in the right render context and has this param available.
  const zoneId = getZoneId();
  const theme = useTheme();

  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [tooltipZoneData, setTooltipZoneData] = useState(null);

  const zoneValues = useMemo(() => Object.values(zones), [zones]);

  const handleMapLoaded = useMemo(
    () => () => {
      // Center the map initially based on the focused zone and the user geolocation.
      if (zoneId) {
        dispatchApplication('mapViewport', getCenteredZoneViewport(zones[zoneId]));
      } else if (callerLocation) {
        dispatchApplication('mapViewport', getCenteredLocationViewport(callerLocation));
      }

      // Map loading is finished, lower the overlay shield with
      // a bit of delay to allow the background to render first.
      setTimeout(() => {
        dispatchApplication('isLoadingMap', false);
      }, 100);

      // Track and notify that WebGL is supported.
      dispatchApplication('webGLSupported', true);
      // eslint-disable-next-line no-underscore-dangle
      if (thirdPartyServices._ga) {
        // eslint-disable-next-line no-underscore-dangle
        thirdPartyServices._ga.timingMark('map_loaded');
      }
    },
    [zones, zoneId, callerLocation]
  );

  const handleMapError = (e) => {
    console.error(e.error);
    // Map loading is finished, lower the overlay shield.
    dispatchApplication('isLoadingMap', false);

    // Disable the map and redirect to zones ranking.
    dispatchApplication('webGLSupported', false);
    history.push({ pathname: '/ranking', search: location.search });
  };

  const handleMouseMove = ({ x, y }) => {
    setTooltipPosition({ x, y });
  };

  const handleSeaClick = useMemo(
    () => () => {
      history.push({ pathname: '/map', search: location.search });
    },
    [history, location]
  );

  const handleZoneClick = useMemo(
    () => (id) => {
      trackEvent('countryClick');
      dispatchApplication('isLeftPanelCollapsed', false);
      history.push({ pathname: `/zone/${id}`, search: location.search });
    },
    [trackEvent, history, location]
  );

  const handleZoneMouseEnter = useMemo(
    () => (data) => {
      dispatchApplication('co2ColorbarValue', getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, data));
      setTooltipZoneData(data);
    },
    [electricityMixMode, carbonIntensityDomain]
  );

  const handleZoneMouseLeave = useMemo(
    () => () => {
      dispatchApplication('co2ColorbarValue', null);
      setTooltipZoneData(null);
    },
    []
  );

  const handleViewportChange = useMemo(
    () =>
      ({ width, height, latitude, longitude, zoom }) => {
        dispatchApplication('isMovingMap', true);
        dispatchApplication('mapViewport', {
          width,
          height,
          latitude,
          longitude,
          zoom,
        });
        // TODO: Try tying this to internal map state
        // somehow to remove the need for debouncing.
        debouncedReleaseMoving();
      },
    []
  );

  const handleResize = useMemo(
    () =>
      ({ width, height }) => {
        handleViewportChange({ ...viewport, width, height });
      },
    [viewport, handleViewportChange]
  );

  // Animate map transitions only after the map has been loaded.
  const transitionDuration = isLoadingMap ? 0 : 300;
  const hoveringEnabled = !isHoveringExchange && !isMobile;

  return (
    <React.Fragment>
      <div id="webgl-error" className={`flash-message ${!webGLSupported ? 'active' : ''}`}>
        <div className="inner">The map can&apos;t be rendered because this browser does not support WebGL.</div>
      </div>
      {tooltipPosition && tooltipZoneData && hoveringEnabled && (
        <MapCountryTooltip
          zoneData={tooltipZoneData}
          position={tooltipPosition}
          onClose={() => setTooltipZoneData(null)}
        />
      )}
      <ZoneMap
        co2ColorScale={co2ColorScale}
        hoveringEnabled={hoveringEnabled}
        onMapLoaded={handleMapLoaded}
        onMapError={handleMapError}
        onMouseMove={handleMouseMove}
        onResize={handleResize}
        onSeaClick={handleSeaClick}
        onViewportChange={handleViewportChange}
        onZoneClick={handleZoneClick}
        onZoneMouseEnter={handleZoneMouseEnter}
        onZoneMouseLeave={handleZoneMouseLeave}
        selectedZoneTimeIndex={selectedZoneTimeIndex}
        scrollZoom={!isEmbedded}
        theme={theme}
        transitionDuration={transitionDuration}
        viewport={viewport}
        zones={zoneValues}
        zoneHistories={zoneHistories}
      />
    </React.Fragment>
  );
};
