import { Vector as VectorSource } from 'ol/source';

export type RouteLayersGroup = {
  startLayer: VectorSource;
  endLayer: VectorSource;
  stopsLayer: VectorSource;
  pathLayer: VectorSource;
};