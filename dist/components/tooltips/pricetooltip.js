import React from '../../pkg/react.js';
import getSymbolFromCurrency from '../../pkg/currency-symbol-map.js';
import { isNumber } from '../../pkg/lodash.js';
import Tooltip from '../tooltip.js';

const PriceTooltip = ({
  position,
  zoneData,
  onClose
}) => {
  if (!zoneData) return null;
  const priceIsDefined = zoneData.price && isNumber(zoneData.price.value);
  const currency = priceIsDefined ? getSymbolFromCurrency(zoneData.price.currency) : '?';
  const value = priceIsDefined ? zoneData.price.value : '?';
  return /*#__PURE__*/React.createElement(Tooltip, {
    id: "price-tooltip",
    position: position,
    onClose: onClose
  }, value, " ", currency, " / MWh");
};

export default PriceTooltip;