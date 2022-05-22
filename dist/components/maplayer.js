function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React from '../pkg/react.js';
import { BaseControl } from '../pkg/react-map-gl.js';
import { connect } from '../pkg/react-redux.js';

const mapStateToProps = state => ({
  mapViewport: state.application.mapViewport
}); // A proxy component that passes the projection methods to layers
// based on the current map state. Setting _containerRef in a wrapper
// is important for capturing mouse events (e.g. clicks) and not
// letting them propagate to the map.


class MapLayer extends BaseControl {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      project: null,
      unproject: null
    });
  }

  // Keep project and unproject methods in the component state and update them
  // only when the map viewport changes as ReactMapGL calls the _render() method
  // at all sorts of times and we don't want the layers to rerender more than needed.
  // Always set in the next cycle to make sure it's not picking up old methods.
  componentWillReceiveProps(nextProps) {
    if (nextProps.mapViewport !== this.props.mapViewport) {
      setTimeout(() => {
        this.setState({
          project: this._context.viewport.project,
          unproject: this._context.viewport.unproject
        });
      }, 0);
    }
  }

  _render() {
    return /*#__PURE__*/React.createElement("div", {
      ref: this._containerRef
    }, /*#__PURE__*/React.createElement(this.props.component, {
      project: this.state.project || this._context.viewport.project,
      unproject: this.state.unproject || this._context.viewport.unproject
    }));
  }

} // Pass through all drag events to the map.


MapLayer.defaultProps.captureDrag = false;
export default connect(mapStateToProps)(MapLayer);