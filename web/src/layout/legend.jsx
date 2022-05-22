/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { connect } from 'react-redux';

import { dispatchApplication } from '../store';
import { formatCarbonIntensityUnit } from '../helpers/formatting';

import HorizontalColorbar from '../components/horizontalcolorbar';
import { useCo2ColorScale } from '../hooks/theme';
import { useCarbonIntensityDomain } from '../hooks/redux';

// TODO: Move styles from styles.css to here
// TODO: Remove all unecessary id and class tags

const mapStateToProps = (state) => ({
  co2ColorbarValue: state.application.co2ColorbarValue,
  legendVisible: state.application.legendVisible,
  solarColorbarValue: state.application.solarColorbarValue,
  windColorbarValue: state.application.windColorbarValue,
});

const Legend = ({ co2ColorbarValue, legendVisible }) => {
  const co2ColorScale = useCo2ColorScale();
  const carbonIntensityDomain = useCarbonIntensityDomain();

  const mobileCollapsedClass = !legendVisible ? 'mobile-collapsed' : '';
  const toggleLegend = () => {
    dispatchApplication('legendVisible', !legendVisible);
  };

  return (
    <div className={`floating-legend-container ${mobileCollapsedClass}`}>
      <div className="floating-legend-mobile-header">
        <span>Legend</span>
        <i className="material-icons toggle-legend-button" onClick={toggleLegend}>
          {legendVisible ? 'call_received' : 'call_made'}
        </i>
      </div>
      {legendVisible && (
        <React.Fragment>
          <div className={`co2-legend floating-legend ${mobileCollapsedClass}`}>
            <div className="legend-header">
              Carbon intensity <small>{`(${formatCarbonIntensityUnit(carbonIntensityDomain)})`}</small>
            </div>
            <HorizontalColorbar
              id="carbon-intensity-bar"
              colorScale={co2ColorScale}
              currentValue={co2ColorbarValue}
              markerColor="white"
              ticksCount={5}
            />
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default connect(mapStateToProps)(Legend);
