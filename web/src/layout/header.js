import React from 'react';
import { connect } from 'react-redux';

// TODO: Move all styles from styles.css to here

const mapStateToProps = state => ({
  brightModeEnabled: state.application.brightModeEnabled,
});

export default connect(mapStateToProps)(props => (
  <div id="header">
    <div id="header-content" className={props.brightModeEnabled ? 'brightmode' : null}>
      <div className="logo">
        <div className="image" id="electricitymap-logo" />
      </div>
    </div>
  </div>
));
