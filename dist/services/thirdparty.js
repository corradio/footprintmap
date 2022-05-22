import {store} from "../store.js";
import {isProduction} from "../helpers/environment.js";
import gaConnection from "./thirdparty/ga.js";
import debugConsoleConnection from "./thirdparty/debugconsole.js";
function reportToSentry(e) {
  if (window.Sentry !== void 0) {
    try {
      window.Sentry.captureException(e);
    } catch (err) {
      console.error(`Error while reporting error to Sentry: ${err}`);
    }
  }
}
class ConnectionsService {
  constructor() {
    this.connections = [];
    if (isProduction()) {
      this._ga = this.addConnection(gaConnection);
    } else {
      this.addConnection(debugConsoleConnection);
    }
  }
  addConnection(i) {
    this.connections.push(i);
    return i;
  }
  trackEvent(eventName, context) {
    this.connections.forEach((conn) => {
      try {
        conn.track(eventName, context);
      } catch (err) {
        console.error(`External connection error: ${err}`);
      }
    });
  }
  ga() {
    if (this._ga) {
      try {
        this._ga.ga(...arguments);
      } catch (err) {
        console.error(`Google analytics track error: ${err}`);
      }
    }
  }
  trackError(e) {
    console.error(`Error Caught! ${e}`);
    this.ga("event", "exception", {description: e, fatal: false});
    store.dispatch({
      type: "TRACK_EVENT",
      payload: {
        eventName: "error",
        context: {name: e.name, stack: e.stack}
      }
    });
    reportToSentry(e);
  }
}
export default new ConnectionsService();
