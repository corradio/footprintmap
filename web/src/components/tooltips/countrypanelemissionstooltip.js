import React from 'react';

import Tooltip from '../tooltip';

const CountryPanelEmissionsTooltip = ({ position, data, unit }) => {
  if (!data) return null;

  const value = Math.round(data.emissions);

  return (
    <Tooltip id="countrypanel-emissions-tooltip" position={position}>
      {data.meta.year}: <b>{value}</b> {unit}
    </Tooltip>
  );
};

export default CountryPanelEmissionsTooltip;
