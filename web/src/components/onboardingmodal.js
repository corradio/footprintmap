import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { saveKey } from '../helpers/storage';
import { dispatchApplication } from '../store';
import { useTrackEvent } from '../hooks/tracking';

const views = [{
  headerCssClass: 'logo-header',
  textCssClass: 'brand-text',
  renderContent: () => (
    <React.Fragment>
      <div>
        <h1>footprintMap</h1>
      </div>
      <div>
        <h2>A visualisation of the CO₂ emissions of the global economy</h2>
      </div>
    </React.Fragment>
  ),
}, {
  headerImage: 'images/onboarding/mapExtract.png',
  renderContent: () => (
    <React.Fragment>
      <div>
        <h2>See how much CO₂ is emitted</h2>
      </div>
      <div>We color areas around the world by their Carbon Intensity. The greener the color, the lesser the footprint.</div>
    </React.Fragment>
  ),
}, {
  headerImage: 'images/onboarding/toggle.png',
  renderContent: () => (
    <React.Fragment>
      <div>
        <h2>Population, economy and energy</h2>
      </div>
      <div>Explore the footprint of a country per capita, GDP generated, or energy consumed. Click on the toggle to switch mode.</div>
    </React.Fragment>
  ),
}, {
  headerImage: 'images/onboarding/mapExtract.png',
  renderContent: () => (
    <React.Fragment>
      <div>
        <h2>Imports are taken into account</h2>
      </div>
      <div>Emissions related to goods manufactured abroad are taken into account, and appear as part of a country's footprint</div>
    </React.Fragment>
  ),
}];

const mapStateToProps = state => ({
  // Show onboarding modal only if it's not been seen yet and if the app is not embedded
  visible: !state.application.onboardingSeen && !state.application.isEmbedded,
});

const OnboardingModal = ({ visible }) => {
  const trackEvent = useTrackEvent();

  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const isOnLastView = () => currentViewIndex === views.length - 1;
  const isOnFirstView = () => currentViewIndex === 0;

  const handleDismiss = () => {
    saveKey('onboardingSeen', true);
    dispatchApplication('onboardingSeen', true);
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

  // Dismiss the modal if SPACE key is pressed
  useEffect(() => {
    const keyPressHandlers = (ev) => {
      if (ev.keyCode === 32) {
        handleDismiss();
      }
    };
    document.addEventListener('keypress', keyPressHandlers);
    return () => {
      document.removeEventListener('keypress', keyPressHandlers);
    };
  });

  // Track event when the onboarding modal opens up
  useEffect(() => {
    if (visible) {
      trackEvent('onboardingModalShown');
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <React.Fragment>
      <div className="modal-background-overlay" onClick={handleDismiss} />
      <div className="modal">
        <div className="modal-left-button-container">
          {!isOnFirstView() && (
            <div className="modal-left-button" onClick={handleBack}>
              <i className="material-icons">arrow_back</i>
            </div>
          )}
        </div>
        <div className="modal-body">
          <div className="modal-close-button-container">
            <div className="modal-close-button" onClick={handleDismiss}>
              <i className="material-icons">close</i>
            </div>
          </div>
          <div
            className={`modal-header ${views[currentViewIndex].headerCssClass || ''}`}
            style={{ backgroundImage: `url("${views[currentViewIndex].headerImage}")` }}
          />
          <div className={`modal-text ${views[currentViewIndex].textCssClass || ''}`}>
            {views[currentViewIndex].renderContent()}
          </div>
        </div>
        <div className="modal-footer">
          {views.map((view, index) => (
            <div
              key={view.headerImage}
              className={`modal-footer-circle ${index === currentViewIndex ? 'highlight' : ''}`}
            />
          ))}
        </div>
        <div className="modal-right-button-container">
          {isOnLastView() ? (
            <div className="modal-right-button green" onClick={handleDismiss}>
              <i className="material-icons">check</i>
            </div>
          ) : (
            <div className="modal-right-button" onClick={handleForward}>
              <i className="material-icons">arrow_forward</i>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default connect(mapStateToProps)(OnboardingModal);
