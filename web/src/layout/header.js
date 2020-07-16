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
        <span className="maintitle small-screen-hidden">
          CO₂ <span className="live" style={{ fontWeight: 'bold' }}>footprintMap</span>
        </span>
      </div>
    </div>
  </div>
));
