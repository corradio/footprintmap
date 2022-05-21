import { merge } from 'topojson';
import topo from '../world.json';

const constructTopos = () => {
  const zones = {};
  Object.keys(topo.objects).forEach((k) => {
    if (!topo.objects[k].arcs) { return; }
    const geo = { geometry: merge(topo, [topo.objects[k]]) };
    // Exclude zones with null geometries.
    if (geo.geometry) {
      zones[k] = geo;
    }
  });

  return zones;
};

export default constructTopos;
