import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default () => {
  const location = useLocation();

  const canRenderMap = useSelector((state) => state.application.webGLSupported);

  return (
    <div id="tab">
      <div id="tab-content">
        {canRenderMap && (
          <NavLink className="list-item" to={{ pathname: '/map', search: location.search }}>
            <i className="material-icons" aria-hidden="true">
              map
            </i>
            <span className="tab-label">Map</span>
          </NavLink>
        )}
        <NavLink className="list-item" to={{ pathname: '/ranking', search: location.search }}>
          <i className="material-icons" aria-hidden="true">
            view_list
          </i>
          <span className="tab-label">Areas</span>
        </NavLink>
        <NavLink className="list-item" to={{ pathname: '/info', search: location.search }}>
          <i className="material-icons" aria-hidden="true">
            info
          </i>
          <span className="tab-label">About</span>
        </NavLink>
      </div>
    </div>
  );
};
