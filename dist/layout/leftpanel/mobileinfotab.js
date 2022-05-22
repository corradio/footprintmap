/* eslint-disable jsx-a11y/anchor-is-valid */

/* eslint-disable jsx-a11y/anchor-has-content */

/* eslint-disable react/jsx-no-target-blank */
// TODO: re-enable rules
import React from '../../pkg/react.js';
import { Redirect, useLocation } from '../../pkg/react-router-dom.js';
import { useIsMediumUpScreen } from '../../hooks/viewport.js';
import ColorBlindCheckbox from '../../components/colorblindcheckbox.js';

const MobileInfoTab = () => {
  const isMediumUpScreen = useIsMediumUpScreen();
  const location = useLocation(); // If not on small screen, redirect to the /map page

  if (isMediumUpScreen) {
    return /*#__PURE__*/React.createElement(Redirect, {
      to: {
        pathname: '/map',
        search: location.search
      }
    });
  }

  return /*#__PURE__*/React.createElement("div", {
    className: "mobile-info-tab"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mobile-watermark brightmode"
  }, /*#__PURE__*/React.createElement("a", {
    href: "http://www.tmrow.com/mission?utm_source=footprintmap.org&utm_medium=referral&utm_campaign=watermark",
    target: "_blank"
  }, /*#__PURE__*/React.createElement("img", {
    src: '/images/built-by-tomorrow.svg',
    alt: ""
  }))), /*#__PURE__*/React.createElement("div", {
    className: "info-text"
  }, /*#__PURE__*/React.createElement(ColorBlindCheckbox, null), /*#__PURE__*/React.createElement("p", null, "This project is ", /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/corradio/footprintmap",
    target: "_blank"
  }, "Open Source"), " (See ", /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/corradio/footprintmap#data-sources",
    target: "_blank"
  }, "data sources"), ")."), /*#__PURE__*/React.createElement("p", null, "Found bugs or have ideas? Report them ", /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/corradio/footprintmap/issues/new",
    target: "_blank"
  }, "here"), ".", /*#__PURE__*/React.createElement("br", null))), /*#__PURE__*/React.createElement("div", {
    className: "social-buttons large-screen-hidden"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "slack-button"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://slack.tmrow.com",
    target: "_blank",
    className: "slack-btn"
  }, /*#__PURE__*/React.createElement("span", {
    className: "slack-ico"
  }), /*#__PURE__*/React.createElement("span", {
    className: "slack-text"
  }, "Slack"))))));
};

export default MobileInfoTab;