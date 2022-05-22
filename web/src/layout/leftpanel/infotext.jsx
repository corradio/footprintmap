/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable react/jsx-no-target-blank */
// TODO: re-enable rules

import React from 'react';

import ColorBlindCheckbox from '../../components/colorblindcheckbox';

export default () => (
  <div className="info-text small-screen-hidden">
    <ColorBlindCheckbox />
    <p>
      This project is{' '}
      <a href="https://github.com/corradio/carbonmap" target="_blank">
        Open Source
      </a>{' '}
      (See{' '}
      <a href="https://github.com/corradio/carbonmap#data-sources" target="_blank">
        data sources
      </a>
      ).{' '}
    </p>
    <p>
      Found bugs or have ideas? Report them{' '}
      <a href="https://github.com/corradio/carbonmap/issues/new" target="_blank">
        here
      </a>
      .<br />
    </p>
    <div className="social-buttons">
      <div>
        {/* Slack */}
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
