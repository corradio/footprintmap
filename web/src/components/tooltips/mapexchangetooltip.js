import React from 'react';

import Tooltip from '../tooltip';

import { CarbonIntensity, ZoneName } from './common';

const MapExchangeTooltip = ({ exchangeData, position, onClose }) => {
  if (!exchangeData) return null;

  const isExporting = exchangeData.netFlow > 0;
  const netFlow = Math.abs(Math.round(exchangeData.netFlow));
  const zoneFrom = exchangeData.countryCodes[isExporting ? 0 : 1];
  const zoneTo = exchangeData.countryCodes[isExporting ? 1 : 0];

  return (
    <Tooltip id="exchange-tooltip" position={position} onClose={onClose}>
      <br />
      <ZoneName zone={zoneFrom} /> → <ZoneName zone={zoneTo} />: <b>{netFlow}</b> MW
      <br />
      <br />
      <br />
      <CarbonIntensity intensity={exchangeData.co2intensity} />
    </Tooltip>
  );
};

export default MapExchangeTooltip;
