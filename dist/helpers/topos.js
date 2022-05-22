import {merge} from "../pkg/topojson.js";
import topo from "../world.json.proxy.js";
const constructTopos = () => {
  const zones = {};
  Object.keys(topo.objects).forEach((k) => {
    if (!topo.objects[k].arcs) {
      return;
    }
    const geo = {geometry: merge(topo, [topo.objects[k]])};
    if (geo.geometry) {
      zones[k] = geo;
    }
  });
  return zones;
};
export default constructTopos;
