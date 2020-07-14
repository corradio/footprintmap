# carbonmap [![Slack Status](http://slack.tmrow.co/badge.svg)](http://slack.tmrow.co) [![CircleCI](https://circleci.com/gh/corradio/footprintmap.svg?style=shield)](https://circleci.com/gh/corradio/footprintmap)
An interactive visualisation of the CO<sub>2</sub> footprint of the world economy built with [React](https://reactjs.org/) and [mapbox GL](https://github.com/mapbox/mapbox-gl-js/). Try it out at [http://www.footprintmap.org](http://www.footprintmap.org).

### Data sources
- [BP Statistical Review of World Energy 2020](https://www.bp.com/en/global/corporate/energy-economics/statistical-review-of-world-energy.html) -- published June 17th 2020
- [Global Carbon Budget 2019](https://doi.org/10.18160/GCP-2019) -- published December 4th 2019
- [Worldbank population]() TBD

### Set up and start your local environment
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
