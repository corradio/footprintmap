import React, {useRef, useMemo, useState} from "../pkg/react.js";
import {connect} from "../pkg/react-redux.js";
import {scaleLinear} from "../pkg/d3-scale.js";
import {max as d3Max} from "../pkg/d3-array.js";
import {noop} from "../pkg/lodash.js";
import {dispatchApplication} from "../store.js";
import {useWidthObserver} from "../hooks/viewport.js";
import {useCurrentZoneData} from "../hooks/redux.js";
import {useCo2ColorScale} from "../hooks/theme.js";
import {getTooltipPosition} from "../helpers/graph.js";
import {modeOrder, modeColor, DEFAULT_FLAG_SIZE} from "../helpers/constants.js";
import {getElectricityProductionValue, getProductionCo2Intensity} from "../helpers/zonedata.js";
import {flagUri} from "../helpers/flags.js";
import CountryPanelProductionTooltip from "./tooltips/countrypanelproductiontooltip.js";
import CountryTableOverlayIfNoData from "./countrytableoverlayifnodata.js";
const LABEL_MAX_WIDTH = 102;
const TEXT_ADJUST_Y = 11;
const ROW_HEIGHT = 13;
const PADDING_Y = 7;
const PADDING_X = 5;
const RECT_OPACITY = 0.8;
const X_AXIS_HEIGHT = 15;
const SCALE_TICKS = 4;
const getProductionData = (data, electricityMixMode) => modeOrder.map((mode) => {
  const isStorage = mode.indexOf("storage") !== -1;
  const resource = mode.replace(" storage", "");
  const key = electricityMixMode === "consumption" ? "primaryEnergyConsumptionTWh" : "primaryEnergyProductionTWh";
  const capacity = (data.capacity || {})[mode];
  const production = (data[key] || {})[resource];
  const storage = (data.storage || {})[resource];
  const gCo2eqPerkWh = getProductionCo2Intensity(mode, data);
  const gCo2eqPerHour = gCo2eqPerkWh * 1e3 * (isStorage ? storage : production);
  const tCo2eqPerMin = gCo2eqPerHour / 1e6 / 60;
  return {
    isStorage,
    storage,
    production,
    capacity,
    mode,
    tCo2eqPerMin
  };
});
const getDataBlockPositions = (productionData, exchangeData) => {
  const productionHeight = productionData.length * (ROW_HEIGHT + PADDING_Y);
  const productionY = X_AXIS_HEIGHT + PADDING_Y;
  const exchangeFlagX = LABEL_MAX_WIDTH - 4 * PADDING_X - DEFAULT_FLAG_SIZE - d3Max(exchangeData, (d) => d.mode.length) * 8;
  const exchangeHeight = exchangeData.length * (ROW_HEIGHT + PADDING_Y);
  const exchangeY = productionY + productionHeight;
  return {
    productionHeight,
    productionY,
    exchangeFlagX,
    exchangeHeight,
    exchangeY
  };
};
const Axis = ({formatTick, height, scale}) => /* @__PURE__ */ React.createElement("g", {
  className: "x axis",
  fill: "none",
  fontSize: "10",
  fontFamily: "sans-serif",
  textAnchor: "middle",
  transform: `translate(${scale.range()[0] + LABEL_MAX_WIDTH}, ${X_AXIS_HEIGHT})`
}, /* @__PURE__ */ React.createElement("path", {
  className: "domain",
  stroke: "currentColor",
  d: `M${scale.range()[0] + 0.5},0.5H${scale.range()[1] + 0.5}`
}), scale.ticks(SCALE_TICKS).map((t) => /* @__PURE__ */ React.createElement("g", {
  key: t,
  className: "tick",
  opacity: "1",
  transform: `translate(${scale(t)}, 0)`
}, /* @__PURE__ */ React.createElement("line", {
  stroke: "currentColor",
  y2: height - X_AXIS_HEIGHT
}), /* @__PURE__ */ React.createElement("text", {
  fill: "currentColor",
  y: "-3",
  dy: "0"
}, formatTick(t)))));
const Row = ({children, index, isMobile, label, scale, value, onMouseOver, onMouseOut, width}) => {
  if (width <= 0) {
    return null;
  }
  return /* @__PURE__ */ React.createElement("g", {
    className: "row",
    transform: `translate(0, ${index * (ROW_HEIGHT + PADDING_Y)})`
  }, /* @__PURE__ */ React.createElement("rect", {
    y: "-1",
    fill: "transparent",
    width,
    height: ROW_HEIGHT + PADDING_Y,
    onClick: isMobile ? onMouseOver : noop,
    onFocus: !isMobile ? onMouseOver : noop,
    onMouseOver: !isMobile ? onMouseOver : noop,
    onMouseMove: !isMobile ? onMouseOver : noop,
    onMouseOut,
    onBlur: onMouseOut
  }), /* @__PURE__ */ React.createElement("text", {
    className: "name",
    style: {pointerEvents: "none", textAnchor: "end"},
    transform: `translate(${LABEL_MAX_WIDTH - 1.5 * PADDING_Y}, ${TEXT_ADJUST_Y})`
  }, label), children, !Number.isFinite(value) && /* @__PURE__ */ React.createElement("text", {
    className: "unknown",
    transform: `translate(3, ${TEXT_ADJUST_Y})`,
    style: {pointerEvents: "none", fill: "darkgray"},
    x: LABEL_MAX_WIDTH + scale(0)
  }, "?"));
};
const HorizontalBar = ({className, fill, range, scale}) => {
  if (!Array.isArray(range) || !Number.isFinite(range[0]) || !Number.isFinite(range[1])) {
    return null;
  }
  const x1 = Math.min(range[0], range[1]);
  const x2 = Math.max(range[0], range[1]);
  const width = scale(x2) - scale(x1);
  if (width <= 0) {
    return null;
  }
  return /* @__PURE__ */ React.createElement("rect", {
    className,
    fill,
    height: ROW_HEIGHT,
    opacity: RECT_OPACITY,
    shapeRendering: "crispEdges",
    style: {pointerEvents: "none"},
    x: LABEL_MAX_WIDTH + scale(x1),
    width
  });
};
const CountryCarbonEmissionsTable = React.memo(({
  data,
  exchangeData,
  height,
  isMobile,
  productionData,
  onProductionRowMouseOver,
  onProductionRowMouseOut,
  onExchangeRowMouseOver,
  onExchangeRowMouseOut,
  width
}) => {
  const {productionY, exchangeFlagX, exchangeY} = getDataBlockPositions(productionData, exchangeData);
  const maxCO2eqExport = d3Max(exchangeData, (d) => Math.max(0, -d.tCo2eqPerMin));
  const maxCO2eqImport = d3Max(exchangeData, (d) => Math.max(0, d.tCo2eqPerMin));
  const maxCO2eqProduction = d3Max(productionData, (d) => d.tCo2eqPerMin);
  const co2Scale = useMemo(() => scaleLinear().domain([-maxCO2eqExport || 0, Math.max(maxCO2eqProduction || 0, maxCO2eqImport || 0)]).range([0, width - LABEL_MAX_WIDTH - PADDING_X]), [maxCO2eqExport, maxCO2eqProduction, maxCO2eqImport, width]);
  const formatTick = (t) => {
    const [x1, x2] = co2Scale.domain();
    if (x2 - x1 <= 1) {
      return `${t * 1e3} kg/min`;
    }
    return `${t} t/min`;
  };
  return /* @__PURE__ */ React.createElement("svg", {
    className: "country-table",
    height,
    style: {overflow: "visible"}
  }, /* @__PURE__ */ React.createElement(Axis, {
    formatTick,
    height,
    scale: co2Scale
  }), /* @__PURE__ */ React.createElement("g", {
    transform: `translate(0, ${productionY})`
  }, productionData.map((d, index) => /* @__PURE__ */ React.createElement(Row, {
    key: d.mode,
    index,
    label: d.mode,
    width,
    scale: co2Scale,
    value: Math.abs(d.tCo2eqPerMin),
    onMouseOver: (ev) => onProductionRowMouseOver(d.mode, data, ev),
    onMouseOut: onProductionRowMouseOut,
    isMobile
  }, /* @__PURE__ */ React.createElement(HorizontalBar, {
    className: "production",
    fill: modeColor[d.mode],
    range: [0, Math.abs(d.tCo2eqPerMin)],
    scale: co2Scale
  })))), /* @__PURE__ */ React.createElement("g", {
    transform: `translate(0, ${exchangeY})`
  }, exchangeData.map((d, index) => /* @__PURE__ */ React.createElement(Row, {
    key: d.mode,
    index,
    label: d.mode,
    width,
    scale: co2Scale,
    value: d.tCo2eqPerMin,
    onMouseOver: (ev) => onExchangeRowMouseOver(d.mode, data, ev),
    onMouseOut: onExchangeRowMouseOut,
    isMobile
  }, /* @__PURE__ */ React.createElement("image", {
    style: {pointerEvents: "none"},
    x: exchangeFlagX,
    xlinkHref: flagUri(d.mode)
  }), /* @__PURE__ */ React.createElement(HorizontalBar, {
    className: "exchange",
    fill: "gray",
    range: [0, d.tCo2eqPerMin],
    scale: co2Scale
  })))));
});
const CountryElectricityProductionTable = React.memo(({
  data,
  exchangeData,
  height,
  isMobile,
  productionData,
  onProductionRowMouseOver,
  onProductionRowMouseOut,
  onExchangeRowMouseOver,
  onExchangeRowMouseOut,
  width
}) => {
  const co2ColorScale = useCo2ColorScale();
  const {productionY, exchangeFlagX, exchangeY} = getDataBlockPositions(productionData, exchangeData);
  const powerScale = scaleLinear().domain([
    Math.min(-data.maxStorageCapacity || 0, -data.maxStorage || 0, -data.maxExport || 0, -data.maxExportCapacity || 0),
    Math.max(data.maxCapacity || 0, data.maxProduction || 0, data.maxDischarge || 0, data.maxStorageCapacity || 0, data.maxImport || 0, data.maxImportCapacity || 0, d3Max(productionData, (d) => d.production) || 0)
  ]).range([0, width - LABEL_MAX_WIDTH - PADDING_X]);
  const formatTick = (t) => {
    const [x1, x2] = powerScale.domain();
    if (x2 - x1 <= 1) {
      return `${t * 1e3} GWh`;
    }
    if (x2 - x1 <= 1e3) {
      return `${t} TWh`;
    }
    return `${t * 1e-3} PWh`;
  };
  return /* @__PURE__ */ React.createElement("svg", {
    className: "country-table",
    height,
    style: {overflow: "visible"}
  }, /* @__PURE__ */ React.createElement(Axis, {
    formatTick,
    height,
    scale: powerScale
  }), /* @__PURE__ */ React.createElement("g", {
    transform: `translate(0, ${productionY})`
  }, productionData.map((d, index) => /* @__PURE__ */ React.createElement(Row, {
    key: d.mode,
    index,
    label: d.mode,
    width,
    scale: powerScale,
    value: getElectricityProductionValue(d),
    onMouseOver: (ev) => onProductionRowMouseOver(d.mode, data, ev),
    onMouseOut: onProductionRowMouseOut,
    isMobile
  }, /* @__PURE__ */ React.createElement(HorizontalBar, {
    className: "capacity",
    fill: "rgba(0, 0, 0, 0.15)",
    range: d.isStorage ? [-d.capacity, d.capacity] : [0, d.capacity],
    scale: powerScale
  }), /* @__PURE__ */ React.createElement(HorizontalBar, {
    className: "production",
    fill: modeColor[d.mode],
    range: [0, getElectricityProductionValue(d)],
    scale: powerScale
  })))), /* @__PURE__ */ React.createElement("g", {
    transform: `translate(0, ${exchangeY})`
  }, exchangeData.map((d, index) => /* @__PURE__ */ React.createElement(Row, {
    key: d.mode,
    index,
    label: d.mode,
    width,
    scale: powerScale,
    value: d.exchange,
    onMouseOver: (ev) => onExchangeRowMouseOver(d.mode, data, ev),
    onMouseOut: onExchangeRowMouseOut,
    isMobile
  }, /* @__PURE__ */ React.createElement("image", {
    style: {pointerEvents: "none"},
    x: exchangeFlagX,
    xlinkHref: flagUri(d.mode)
  }), /* @__PURE__ */ React.createElement(HorizontalBar, {
    className: "capacity",
    fill: "rgba(0, 0, 0, 0.15)",
    range: d.exchangeCapacityRange,
    scale: powerScale
  }), /* @__PURE__ */ React.createElement(HorizontalBar, {
    className: "exchange",
    fill: co2ColorScale(d.gCo2eqPerkWh),
    range: [0, d.exchange],
    scale: powerScale
  })))));
});
const mapStateToProps = (state) => ({
  displayByEmissions: state.application.tableDisplayEmissions,
  electricityMixMode: state.application.electricityMixMode,
  isMobile: state.application.isMobile
});
const CountryTable = ({displayByEmissions, electricityMixMode, isMobile}) => {
  const ref = useRef(null);
  const width = useWidthObserver(ref);
  const data = useCurrentZoneData();
  const productionData = useMemo(() => getProductionData(data, electricityMixMode), [data, electricityMixMode]);
  const [productionTooltip, setProductionTooltip] = useState(null);
  const handleProductionRowMouseOver = (mode, zoneData, ev) => {
    dispatchApplication("co2ColorbarValue", getProductionCo2Intensity(mode, zoneData));
    setProductionTooltip({mode, zoneData, position: getTooltipPosition(isMobile, {x: ev.clientX, y: ev.clientY})});
  };
  const handleProductionRowMouseOut = () => {
    dispatchApplication("co2ColorbarValue", null);
    setProductionTooltip(null);
  };
  const {exchangeY, exchangeHeight} = getDataBlockPositions(productionData, null);
  const height = exchangeY + exchangeHeight;
  return /* @__PURE__ */ React.createElement("div", {
    className: "country-table-container",
    ref
  }, displayByEmissions ? /* @__PURE__ */ React.createElement(CountryCarbonEmissionsTable, {
    data,
    productionData,
    onProductionRowMouseOver: handleProductionRowMouseOver,
    onProductionRowMouseOut: handleProductionRowMouseOut,
    width,
    height,
    isMobile
  }) : /* @__PURE__ */ React.createElement(CountryElectricityProductionTable, {
    data,
    productionData,
    onProductionRowMouseOver: handleProductionRowMouseOver,
    onProductionRowMouseOut: handleProductionRowMouseOut,
    width,
    height,
    isMobile
  }), productionTooltip && /* @__PURE__ */ React.createElement(CountryPanelProductionTooltip, {
    mode: productionTooltip.mode,
    position: productionTooltip.position,
    zoneData: productionTooltip.zoneData,
    onClose: () => setProductionTooltip(null)
  }), /* @__PURE__ */ React.createElement(CountryTableOverlayIfNoData, null));
};
export default connect(mapStateToProps)(CountryTable);
