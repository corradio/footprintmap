import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { __ } from '../helpers/translation';
import { saveKey } from '../helpers/storage';
import { dispatchApplication } from '../store';

import LanguageSelect from '../components/languageselect';
import ButtonToggle from '../components/buttontoggle';

export default () => {
  const brightModeEnabled = useSelector(state => state.application.brightModeEnabled);
  const toggleBrightMode = () => {
    dispatchApplication('brightModeEnabled', !brightModeEnabled);
    saveKey('brightModeEnabled', !brightModeEnabled);
  };

  return (
    <div className="layer-buttons-container">
      <LanguageSelect />
      <ButtonToggle
        active={brightModeEnabled}
        onChange={toggleBrightMode}
        tooltip={__('tooltips.toggleDarkMode')}
        icon="brightmode"
      />
    </div>
  );
};
