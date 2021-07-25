import { Feature } from 'ol';
import { Vector as VectorSource } from 'ol/source';

export type RouteLayersGroup = {
  startLayer: VectorSource;
  endLayer: VectorSource;
  stopsLayer: VectorSource;
  pathLayer: VectorSource;
};


export type RouteDestinations = {
  start: Feature | undefined;
  end: Feature | undefined;
  stops: Feature[];
};

export type GeocoderResponse = {
  formatted: string;
  lat: number;
  lon: number;
};