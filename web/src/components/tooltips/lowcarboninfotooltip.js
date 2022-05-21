import React from 'react';

import Tooltip from '../tooltip';

const LowCarbonInfoTooltip = ({ position, onClose }) => (
  <Tooltip id="lowcarb-info-tooltip" position={position} onClose={onClose}>
    <b>Low carbon</b>
    <br />
    <small>Includes renewables and nuclear</small>
    <br />
  </Tooltip>
);

export default LowCarbonInfoTooltip;
