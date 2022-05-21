# footprintmap [![Slack Status](https://slack.tmrow.com/badge.svg)](https://slack.tmrow.com) [![CircleCI](https://circleci.com/gh/corradio/footprintmap.svg?style=shield)](https://circleci.com/gh/corradio/footprintmap)
An interactive visualisation of the CO<sub>2</sub> footprint of the world economy built with [React](https://reactjs.org/) and [mapbox GL](https://github.com/mapbox/mapbox-gl-js/). Try it out at [http://www.footprintmap.org](http://www.footprintmap.org).

### Data sources
- [BP Statistical Review of World Energy 2021](https://www.bp.com/en/global/corporate/energy-economics/statistical-review-of-world-energy.html)
- [Global Carbon Budget 2021](https://doi.org/10.18160/GCP-2021)
- [Worldbank population and GDP](https://databank.worldbank.org/)

The dataset is merged by a python script [here](scripts) and the resulting dataset can be found [here](web/src/globalcarbon.json).

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
