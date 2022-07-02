/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-has-content */
// TODO: re-enable rules
import React from 'react';
import { connect } from 'react-redux';

import { dispatchApplication } from '../../store';
import {
  useCurrentZoneHistoryDatetimes,
  useCurrentZoneHistoryStartTime,
  useCurrentZoneHistoryEndTime,
} from '../../hooks/redux';
import TimeSlider from '../../components/timeslider';

import CountryPanel from './countrypanel';

const handleZoneTimeIndexChange = (timeIndex) => {
  dispatchApplication('selectedZoneTimeIndex', timeIndex);
};

const mapStateToProps = (state) => ({
  selectedZoneTimeIndex: state.application.selectedZoneTimeIndex,
});

const ZoneDetailsPanel = ({ selectedZoneTimeIndex }) => {
  const datetimes = useCurrentZoneHistoryDatetimes();
  const startTime = useCurrentZoneHistoryStartTime();
  const endTime = useCurrentZoneHistoryEndTime();

  return (
    <div className="left-panel-zone-details">
      <CountryPanel />
      <div className="detail-bottom-section">
        <TimeSlider
          className="zone-time-slider"
          onChange={handleZoneTimeIndexChange}
          selectedTimeIndex={selectedZoneTimeIndex}
          datetimes={datetimes}
          startTime={startTime}
          endTime={endTime}
        />
      </div>
    </div>
  );
};

export default connect(mapStateToProps)(ZoneDetailsPanel);
