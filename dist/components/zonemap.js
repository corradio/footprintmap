import React, {useState, useMemo, useRef, useEffect} from "../pkg/react.js";
import {useSelector} from "../pkg/react-redux.js";
import {Portal} from "../pkg/react-portal.js";
import ReactMapGL, {NavigationControl, Source, Layer} from "../pkg/react-map-gl.js";
import {debounce, isEmpty, map, noop, size} from "../pkg/lodash.js";
import {getZoneCarbonIntensity} from "../helpers/zonedata.js";
import {useCarbonIntensityDomain} from "../hooks/redux.js";
const interactiveLayerIds = ["zones-clickable-layer"];
const mapStyle = {version: 8, sources: {}, layers: []};
const ZoneMap = ({
  children = null,
  co2ColorScale = null,
  hoveringEnabled = true,
  onMapLoaded = noop,
  onMapError = noop,
  onMouseMove = noop,
  onResize = noop,
  onSeaClick = noop,
  onViewportChange = noop,
  onZoneClick = noop,
  onZoneMouseEnter = noop,
  onZoneMouseLeave = noop,
  scrollZoom = true,
  selectedZoneTimeIndex = null,
  style = {},
  theme = {},
  transitionDuration = 300,
  viewport = {
    latitude: 0,
    longitude: 0,
    zoom: 2
  },
  zones = {},
  zoneHistories = {}
}) => {
  const ref = useRef(null);
  const wrapperRef = useRef(null);
  const [hoveredZoneId, setHoveredZoneId] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const carbonIntensityDomain = useCarbonIntensityDomain();
  const electricityMixMode = useSelector((state) => state.application.electricityMixMode);
  const [isDragging, setIsDragging] = useState(false);
  const debouncedSetIsDragging = useMemo(() => debounce((value) => {
    setIsDragging(value);
  }, 200), []);
  const handleDragStart = useMemo(() => () => setIsDragging(true), []);
  const handleDragEnd = useMemo(() => () => setIsDragging(false), []);
  const handleWheel = useMemo(() => () => {
    setIsDragging(true);
    debouncedSetIsDragging(false);
  }, [debouncedSetIsDragging]);
  const handleLoad = () => {
    setTimeout(() => {
      setIsLoaded(true);
      onMapLoaded();
    }, 200);
  };
  const sources = useMemo(() => {
    const features = map(zones, (zone, i) => ({
      type: "Feature",
      geometry: {
        ...zone.geometry,
        coordinates: zone.geometry.coordinates.filter(size)
      },
      id: i,
      properties: {
        isClickable: zone.year != null,
        zoneData: zone,
        zoneId: zone.countryCode
      }
    }));
    return {
      zonesClickable: {
        type: "FeatureCollection",
        features: features.filter((f) => f.properties.isClickable)
      },
      zonesNonClickable: {
        type: "FeatureCollection",
        features: features.filter((f) => !f.properties.isClickable)
      }
    };
  }, [zones]);
  useMemo(() => {
    if (isLoaded) {
      const map2 = ref.current.getMap();
      zones.forEach((zone, i) => {
        const fillColor = co2ColorScale(getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, zone));
        map2.setFeatureState({
          source: "zones-clickable",
          id: i
        }, {
          color: fillColor
        });
      });
    }
  }, [isLoaded, zones, co2ColorScale, carbonIntensityDomain, electricityMixMode]);
  const hoverFilter = useMemo(() => ["==", "zoneId", hoveredZoneId || ""], [hoveredZoneId]);
  const styles = useMemo(() => ({
    hover: {"fill-color": "white", "fill-opacity": 0.3},
    ocean: {"background-color": theme.oceanColor},
    zonesBorder: {"line-color": theme.strokeColor, "line-width": theme.strokeWidth},
    zonesClickable: {
      "fill-color": [
        "coalesce",
        ["feature-state", "color"],
        ["get", "color"],
        theme.clickableFill
      ]
    },
    zonesNonClickable: {"fill-color": theme.nonClickableFill}
  }), [theme]);
  useEffect(() => {
    if (!ReactMapGL.supported()) {
      setIsSupported(false);
      onMapError("WebGL not supported");
    }
  }, [onMapError]);
  useEffect(() => {
    if (isLoaded && co2ColorScale) {
      const features = ref.current.queryRenderedFeatures();
      const map2 = ref.current.getMap();
      features.forEach((feature) => {
        const {color, zoneId} = feature.properties;
        let fillColor = color;
        let co2intensity;
        if (selectedZoneTimeIndex) {
          co2intensity = zoneHistories && zoneHistories[zoneId] && zoneHistories[zoneId][selectedZoneTimeIndex] ? getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, zoneHistories[zoneId][selectedZoneTimeIndex]) : null;
        } else {
          co2intensity = getZoneCarbonIntensity(carbonIntensityDomain, electricityMixMode, zones[feature.id]);
        }
        fillColor = co2ColorScale(co2intensity);
        const existingColor = feature.id ? map2.getFeatureState({source: "zones-clickable", id: feature.id}, "color").color : null;
        if (feature.id && fillColor !== existingColor) {
          map2.setFeatureState({
            source: "zones-clickable",
            id: feature.id
          }, {
            color: fillColor
          });
        }
      });
    }
  }, [
    isLoaded,
    isDragging,
    zoneHistories,
    selectedZoneTimeIndex,
    co2ColorScale,
    carbonIntensityDomain,
    electricityMixMode,
    zones
  ]);
  const handleClick = useMemo(() => (e) => {
    if (ref.current && !ref.current.state) {
      const features = ref.current.queryRenderedFeatures(e.point);
      if (isEmpty(features)) {
        onSeaClick();
      } else {
        onZoneClick(features[0].properties.zoneId);
      }
    }
  }, [onSeaClick, onZoneClick]);
  const handleMouseMove = useMemo(() => (e) => {
    if (ref.current) {
      if (hoveringEnabled) {
        onMouseMove({
          x: e.point[0],
          y: e.point[1],
          longitude: e.lngLat[0],
          latitude: e.lngLat[1]
        });
      }
      if (!isDragging) {
        const features = ref.current.queryRenderedFeatures(e.point);
        if (!isEmpty(features) && hoveringEnabled) {
          const feature = features[0];
          const zone = zones[feature.id];
          const zoneId = zone.countryCode;
          if (hoveredZoneId !== zoneId) {
            onZoneMouseEnter(zone, zoneId);
            setHoveredZoneId(zoneId);
          }
        } else if (hoveredZoneId !== null) {
          onZoneMouseLeave();
          setHoveredZoneId(null);
        }
      }
    }
  }, [hoveringEnabled, isDragging, zones, hoveredZoneId, onMouseMove, onZoneMouseEnter, onZoneMouseLeave]);
  const handleMouseOut = useMemo(() => () => {
    if (hoveredZoneId !== null) {
      onZoneMouseLeave();
      setHoveredZoneId(null);
    }
  }, [hoveredZoneId, onZoneMouseLeave]);
  if (!isSupported) {
    return null;
  }
  return /* @__PURE__ */ React.createElement("div", {
    className: "zone-map",
    style,
    ref: wrapperRef
  }, /* @__PURE__ */ React.createElement(ReactMapGL, {
    ref,
    width: "100%",
    height: "100%",
    latitude: viewport.latitude,
    longitude: viewport.longitude,
    zoom: viewport.zoom,
    interactiveLayerIds,
    dragRotate: false,
    touchRotate: false,
    scrollZoom,
    mapStyle,
    maxZoom: 10,
    onBlur: handleMouseOut,
    onClick: handleClick,
    onError: onMapError,
    onLoad: handleLoad,
    onMouseMove: handleMouseMove,
    onMouseOut: handleMouseOut,
    onMouseDown: handleDragStart,
    onMouseUp: handleDragEnd,
    onResize,
    onTouchStart: handleDragStart,
    onTouchEnd: handleDragEnd,
    onWheel: handleWheel,
    onViewportChange,
    transitionDuration: isDragging ? 0 : transitionDuration
  }, /* @__PURE__ */ React.createElement(Portal, {
    node: wrapperRef.current
  }, /* @__PURE__ */ React.createElement("div", {
    className: "mapboxgl-zoom-controls",
    style: {
      boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.15)",
      position: "absolute",
      right: "24px",
      top: "24px"
    }
  }, /* @__PURE__ */ React.createElement(NavigationControl, {
    showCompass: false,
    zoomInLabel: "",
    zoomOutLabel: ""
  }))), /* @__PURE__ */ React.createElement(Layer, {
    id: "ocean",
    type: "background",
    paint: styles.ocean
  }), /* @__PURE__ */ React.createElement(Source, {
    type: "geojson",
    data: sources.zonesNonClickable
  }, /* @__PURE__ */ React.createElement(Layer, {
    id: "zones-static",
    type: "fill",
    paint: styles.zonesNonClickable
  })), /* @__PURE__ */ React.createElement(Source, {
    id: "zones-clickable",
    type: "geojson",
    data: sources.zonesClickable
  }, /* @__PURE__ */ React.createElement(Layer, {
    id: "zones-clickable-layer",
    type: "fill",
    paint: styles.zonesClickable
  }), /* @__PURE__ */ React.createElement(Layer, {
    id: "zones-border",
    type: "line",
    paint: styles.zonesBorder
  })), /* @__PURE__ */ React.createElement(Source, {
    type: "geojson",
    data: sources.zonesClickable
  }, /* @__PURE__ */ React.createElement(Layer, {
    id: "hover",
    type: "fill",
    paint: styles.hover,
    filter: hoverFilter
  })), children));
};
export default ZoneMap;
