import React, {useState, useEffect} from "../pkg/react.js";
import {connect} from "../pkg/react-redux.js";
import {saveKey} from "../helpers/storage.js";
import {dispatchApplication} from "../store.js";
import {useTrackEvent} from "../hooks/tracking.js";
const views = [
  {
    headerCssClass: "logo-header",
    textCssClass: "brand-text",
    renderContent: () => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "footprintMap")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", null, "A visualisation of the CO₂ emissions of the global economy")))
  },
  {
    headerImage: "/images/onboarding/mapExtract.png",
    renderContent: () => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", null, "See how much CO₂ is emitted")), /* @__PURE__ */ React.createElement("div", null, "We color areas around the world by their Carbon Intensity. The greener the color, the lesser the footprint."))
  },
  {
    headerImage: "/images/onboarding/toggle.png",
    renderContent: () => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", null, "Population, economy and energy")), /* @__PURE__ */ React.createElement("div", null, "Explore the footprint of a country per capita, GDP generated, or energy consumed. Click on the toggle to switch mode."))
  },
  {
    headerImage: "/images/onboarding/mapExtract.png",
    renderContent: () => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", null, "Imports are taken into account")), /* @__PURE__ */ React.createElement("div", null, "Emissions related to goods manufactured abroad are taken into account, and appear as part of a country's footprint"))
  }
];
const mapStateToProps = (state) => ({
  visible: !state.application.onboardingSeen && !state.application.isEmbedded
});
const OnboardingModal = ({visible}) => {
  const trackEvent = useTrackEvent();
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const isOnLastView = () => currentViewIndex === views.length - 1;
  const isOnFirstView = () => currentViewIndex === 0;
  const handleDismiss = () => {
    saveKey("onboardingSeen", true);
    dispatchApplication("onboardingSeen", true);
  };
  const handleBack = () => {
    if (!isOnFirstView()) {
      setCurrentViewIndex(currentViewIndex - 1);
    }
  };
  const handleForward = () => {
    if (!isOnLastView()) {
      setCurrentViewIndex(currentViewIndex + 1);
    }
  };
  useEffect(() => {
    const keyPressHandlers = (ev) => {
      if (ev.keyCode === 32) {
        handleDismiss();
      }
    };
    document.addEventListener("keypress", keyPressHandlers);
    return () => {
      document.removeEventListener("keypress", keyPressHandlers);
    };
  });
  useEffect(() => {
    if (visible) {
      trackEvent("onboardingModalShown");
    }
  }, [visible, trackEvent]);
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    className: "modal-background-overlay",
    onClick: handleDismiss
  }), /* @__PURE__ */ React.createElement("div", {
    className: "modal"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "modal-left-button-container"
  }, !isOnFirstView() && /* @__PURE__ */ React.createElement("div", {
    className: "modal-left-button",
    onClick: handleBack
  }, /* @__PURE__ */ React.createElement("i", {
    className: "material-icons"
  }, "arrow_back"))), /* @__PURE__ */ React.createElement("div", {
    className: "modal-body"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "modal-close-button-container"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "modal-close-button",
    onClick: handleDismiss
  }, /* @__PURE__ */ React.createElement("i", {
    className: "material-icons"
  }, "close"))), /* @__PURE__ */ React.createElement("div", {
    className: `modal-header ${views[currentViewIndex].headerCssClass || ""}`,
    style: {backgroundImage: `url("${views[currentViewIndex].headerImage}")`}
  }), /* @__PURE__ */ React.createElement("div", {
    className: `modal-text ${views[currentViewIndex].textCssClass || ""}`
  }, views[currentViewIndex].renderContent())), /* @__PURE__ */ React.createElement("div", {
    className: "modal-footer"
  }, views.map((view, index) => /* @__PURE__ */ React.createElement("div", {
    key: view.headerImage,
    className: `modal-footer-circle ${index === currentViewIndex ? "highlight" : ""}`
  }))), /* @__PURE__ */ React.createElement("div", {
    className: "modal-right-button-container"
  }, isOnLastView() ? /* @__PURE__ */ React.createElement("div", {
    className: "modal-right-button green",
    onClick: handleDismiss
  }, /* @__PURE__ */ React.createElement("i", {
    className: "material-icons"
  }, "check")) : /* @__PURE__ */ React.createElement("div", {
    className: "modal-right-button",
    onClick: handleForward
  }, /* @__PURE__ */ React.createElement("i", {
    className: "material-icons"
  }, "arrow_forward")))));
};
export default connect(mapStateToProps)(OnboardingModal);
