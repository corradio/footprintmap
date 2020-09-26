/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable react/jsx-no-target-blank */
// TODO: re-enable rules

import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';

import { __ } from '../../helpers/translation';
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
      <div className="mobile-watermark brightmode">
        <a href="http://www.tmrow.com/mission?utm_source=footprintmap.org&utm_medium=referral&utm_campaign=watermark" target="_blank">
          <img src={resolvePath('images/built-by-tomorrow.svg')} alt="" />
        </a>
      </div>

      <div className="info-text">
        <ColorBlindCheckbox />
        <p>
          {__('panel-initial-text.thisproject')} <a href="https://github.com/corradio/footprintmap" target="_blank">{__('panel-initial-text.opensource')}</a> ({__('panel-initial-text.see')} <a href="https://github.com/corradio/footprintmap#data-sources" target="_blank">{__('panel-initial-text.datasources')}</a>).
        </p>
        <p>
          {__('footer.foundbugs')} <a href="https://github.com/corradio/footprintmap/issues/new" target="_blank">{__('footer.here')}</a>.<br />
        </p>
      </div>
      <div className="social-buttons large-screen-hidden">
        <div>
          { /* Slack */}
          <span className="slack-button">
            <a href="https://slack.tmrow.com" target="_blank" className="slack-btn">
              <span className="slack-ico" />
              <span className="slack-text">Slack</span>
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MobileInfoTab;
