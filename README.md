# carbonmap [![Slack Status](http://slack.tmrow.co/badge.svg)](http://slack.tmrow.co) [![CircleCI](https://circleci.com/gh/corradio/carbonmap.svg?style=shield)](https://circleci.com/gh/corradio/carbonmap)
A real-time visualisation of the Greenhouse Gas (in terms of CO<sub>2</sub> equivalent) footprint of electricity consumption built with [d3.js](https://d3js.org/) and [mapbox GL](https://github.com/mapbox/mapbox-gl-js/), maintained by [Tomorrow](https://www.tmrow.com). Try it out at [http://www.electricitymap.org](http://www.electricitymap.org).


#### Set up and start your local environment
First, navigate to the `web` folder. Then, install dependencies:
```
yarn
```

The frontend will need compiling. In order to do this, open a terminal in the root directory and run
```
yarn watch
```
One you are done, you can start the application by running
```
yarn server-dev
```

This will watch over source file changes, run nonstop and watch changes you make in the code to recompile the frontend if needed.

Head over to [http://localhost:8000/](http://localhost:8000/) and you should see the map!
