import React from 'react';
import { useSelector } from 'react-redux';

import { saveKey } from '../helpers/storage';
import { dispatchApplication } from '../store';

import ButtonToggle from '../components/buttontoggle';

export default () => {
  const brightModeEnabled = useSelector(state => state.application.brightModeEnabled);
  const toggleBrightMode = () => {
    dispatchApplication('brightModeEnabled', !brightModeEnabled);
    saveKey('brightModeEnabled', !brightModeEnabled);
  };

  return (
    <div className="layer-buttons-container">
      <ButtonToggle
        active={brightModeEnabled}
        onChange={toggleBrightMode}
        tooltip="Toggle dark-mode"
        icon="brightmode"
      />
    </div>
  );
};
