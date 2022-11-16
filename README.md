# footprintmap [![CircleCI](https://circleci.com/gh/corradio/footprintmap.svg?style=shield)](https://circleci.com/gh/corradio/footprintmap)
An interactive visualisation of the CO<sub>2</sub> footprint of the world economy built with [React](https://reactjs.org/) and [mapbox GL](https://github.com/mapbox/mapbox-gl-js/). Try it out at [http://www.footprintmap.org](http://www.footprintmap.org).

### Data sources
- [BP Statistical Review of World Energy 2022](https://www.bp.com/en/global/corporate/energy-economics/statistical-review-of-world-energy.html)
- [Global Carbon Budget 2022](https://doi.org/10.5194/essd-14-4811-2022)
- [Worldbank population and GDP](https://databank.worldbank.org/)

The dataset is merged by a python script [here](scripts) and the resulting dataset can be found [here](web/src/globalcarbon.json).

### Set up and start your local environment
First, navigate to the `web` folder. Then, install dependencies:
```
yarn
```

Then you can run the frontend and get the app running locally
```
yarn develop
```
