class GoogleAnalyticsThirdParty {
  constructor() {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", "UA-79729918-13", {
      custom_map: {
        dimension1: "clientType",
        dimension2: "colorBlindModeEnabled",
        dimension3: "brightModeEnabled",
        dimension4: "isCordova",
        dimension5: "isEmbedded",
        dimension6: "solarEnabled",
        dimension7: "windEnabled",
        dimension8: "embeddedUri",
        dimension9: "selectedZoneName"
      }
    });
    this.inst = gtag;
    window.onerror = function(message, url, line, col, errObject) {
      gtag("event", "exception", {
        description: errObject,
        fatal: true
      });
    };
  }
  track(event, data) {
    this.inst("event", event, data);
    if (window.isCordova) {
      if (typeof cordova.plugins === "undefined") {
        document.addEventListener("deviceready", function() {
          if (event === "pageview") {
            cordova.plugins.firebase.analytics.setCurrentScreen(data.currentPage);
          } else {
            cordova.plugins.firebase.analytics.logEvent(event, data);
          }
        }, false);
      } else {
        if (event === "pageview") {
          cordova.plugins.firebase.analytics.setCurrentScreen(data.currentPage);
        } else {
          cordova.plugins.firebase.analytics.logEvent(event, data);
        }
      }
    }
  }
  config() {
  }
  timingMark(eventName) {
    if (window.performance) {
      const timeSincePageLoad = Math.round(performance.now());
      this.timing(eventName, timeSincePageLoad);
    }
  }
  timing(eventName, durationMs) {
    this.inst("event", "timing_complete", {
      name: eventName,
      value: durationMs
    });
  }
  ga() {
    this.inst(...arguments);
  }
}
export default new GoogleAnalyticsThirdParty();
