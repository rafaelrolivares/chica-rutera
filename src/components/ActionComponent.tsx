import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Map from 'ol/Map';
import { Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import React, { useEffect, useState, useCallback } from 'react';
import { calculateRoute } from '../requests/route';
import './ActionComponent.css';
import { ShowRoute } from './ShowRoute';
import { RoutePoints } from './RoutePoints';
import { Coordinate } from 'ol/coordinate';

type ActionComponentProps = {
  map: Map;
  startLayer: VectorSource;
  endLayer: VectorSource;
  stopsLayer: VectorSource;
};

type RouteInfo = {
  startPoint: Coordinate | undefined;
  endPoint: Coordinate | undefined;
  stops: Coordinate[];
};

export const ActionComponent = ({
  map,
  startLayer,
  endLayer,
  stopsLayer,
}: ActionComponentProps) => {
  const [routeInfo, setRouteInfo] = useState<RouteInfo>({
    startPoint: undefined,
    endPoint: undefined,
    stops: [],
  });

  const { startPoint, endPoint, stops } = routeInfo;

  const [calculatedRoute, setCalculatedRoute] = useState(null);

  const createPoint = (coordinate: any) =>
    new Feature({
      type: 'geoMarker',
      geometry: new Point(coordinate),
    });

  const addPointOnClick = useCallback(
    (e: any) => {
      const { coordinate } = e;
      if (!routeInfo.startPoint) {
        startLayer.addFeature(createPoint(coordinate));
        setRouteInfo({ ...routeInfo, startPoint: coordinate });
      } else if (!routeInfo.endPoint) {
        endLayer.addFeature(createPoint(coordinate));
        setRouteInfo({ ...routeInfo, endPoint: coordinate });
      } else {
        stopsLayer.addFeature(createPoint(coordinate));
        setRouteInfo({
          ...routeInfo,
          stops: [...routeInfo.stops, [coordinate]],
        });
      }
    },
    [endLayer, routeInfo, startLayer, stopsLayer]
  );

  useEffect(() => {
    map && map.on('singleclick', addPointOnClick);
    return () => map.un('singleclick', addPointOnClick);
  }, [map, addPointOnClick]);

  useEffect(() => console.log(routeInfo));

  const addStartFromSearch = (searchResult: any) => {
    const coordinate = getCoordinates(searchResult);
    startLayer.clear();
    startLayer.addFeature(createPoint(coordinate));
    setRouteInfo({ ...routeInfo, startPoint: coordinate });
  };

  const addEndFromSearch = (searchResult: any) => {
    const coordinate = getCoordinates(searchResult);
    endLayer.clear();
    endLayer.addFeature(createPoint(coordinate));
    setRouteInfo({ ...routeInfo, endPoint: coordinate });
  };

  const addRoutePointFromSearch = (searchResult: any) => {
    const coordinate = getCoordinates(searchResult);
    stopsLayer.addFeature(createPoint(coordinate));
    setRouteInfo({
      ...routeInfo,
      stops: [...routeInfo.stops, coordinate],
    });
  };

  const getCoordinates = (searchResult: any) => {
    const { display_name, lon, lat } = searchResult;
    const lonLat = [lon, lat].map((c) => parseFloat(c));
    return fromLonLat(lonLat) as Coordinate;
  };

  const optimize = async () => {
    const route = await calculateRoute(startLayer, endLayer, stopsLayer);
    route && setCalculatedRoute(route);
  };

  return (
    <div className="action-component">
      Create your best delivery route
      <RoutePoints
        start={startPoint}
        end={endPoint}
        stops={stops}
        updateStartFunction={addStartFromSearch}
        updateEndFunction={addEndFromSearch}
      />
      <div onClick={optimize}>Calculate Route</div>
      {calculatedRoute && <ShowRoute route={calculatedRoute} map={map} />}
    </div>
  );
};
