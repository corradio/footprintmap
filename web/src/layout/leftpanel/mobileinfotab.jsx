/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable react/jsx-no-target-blank */
// TODO: re-enable rules

import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';

import { useIsMediumUpScreen } from '../../hooks/viewport';
import ColorBlindCheckbox from '../../components/colorblindcheckbox';

const MobileInfoTab = () => {
  const isMediumUpScreen = useIsMediumUpScreen();
  const location = useLocation();

  // If not on small screen, redirect to the /map page
  if (isMediumUpScreen) {
    return <Redirect to={{ pathname: '/map', search: location.search }} />;
  }

  return (
    <div className="mobile-info-tab">
      <div className="info-text">
        <ColorBlindCheckbox />
        <p>
          This project is{' '}
          <a href="https://github.com/corradio/footprintmap" target="_blank">
            Open Source
          </a>{' '}
          (See{' '}
          <a href="https://github.com/corradio/footprintmap#data-sources" target="_blank">
            data sources
          </a>
          ).
        </p>
        <p>
          Found bugs or have ideas? Report them{' '}
          <a href="https://github.com/corradio/footprintmap/issues/new" target="_blank">
            here
          </a>
          .<br />
        </p>
      </div>
    </div>
  );
};

export default MobileInfoTab;
