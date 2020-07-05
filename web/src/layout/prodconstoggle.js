import React from 'react';
import { connect } from 'react-redux';

import { __ } from '../helpers/translation';
import { updateApplication } from '../actioncreators';

// TODO: Move styles from styles.css to here

const mapStateToProps = state => ({
  electricityMixMode: state.application.electricityMixMode,
});
const mapDispatchToProps = dispatch => ({
  setElectricityMixMode: value => dispatch(updateApplication('electricityMixMode', value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(props => (
  <div className="prodcons-toggle-container">
    <div className="production-toggle">
      <div onClick={() => props.setElectricityMixMode('production')} className={`production-toggle-item production ${props.electricityMixMode === 'production' ? 'production-toggle-active-overlay' : ''}`}>
        {__('tooltips.production')}
      </div>
      <div onClick={() => props.setElectricityMixMode('consumption')} className={`production-toggle-item consumption ${props.electricityMixMode !== 'production' ? 'production-toggle-active-overlay' : ''}`}>
        {__('tooltips.consumption')}
      </div>
    </div>
    <div className="production-toggle-info">
      i
    </div>
    <div id="production-toggle-tooltip" className="layer-button-tooltip hidden">
      <div className="tooltip-container">
        <div className="tooltip-text" dangerouslySetInnerHTML={{ __html: __('tooltips.cpinfo') }} />
        <div className="arrow" />
      </div>
    </div>
  </div>
));
