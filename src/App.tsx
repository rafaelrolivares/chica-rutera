// react
import React, { useEffect, useRef, useState } from 'react';

// openlayers
import TileLayer from 'ol/layer/Tile';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import { XYZ } from 'ol/source';
import View from 'ol/View';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Stroke, Style } from 'ol/style';

// css
import 'ol/ol.css';
import './App.css';

// other imports
import { ActionComponent } from './components/ActionComponent';
import { getIpInfo } from './requests/geoapify';
import { createPointVector } from './utils/createPoints';
import { PageInfo } from './components/PageInfo';
import { LeftBar } from './components/LeftBar';

function App() {
  const [map, setMap] = useState<Map | null>(null);
  const [startLayer, setStartLayer] = useState<VectorSource | null>(null);
  const [endLayer, setEndLayer] = useState<VectorSource | null>(null);
  const [stopsLayer, setStopsLayer] = useState<VectorSource | null>(null);
  const [routeLayer, setRouteLayer] = useState<VectorSource | null>(null);

  const mapElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapElement.current) {
      const startSource = new VectorSource();
      const endSource = new VectorSource();
      const stopsSource = new VectorSource();

      const startVector = createPointVector(startSource, '#5FA', 12);
      const endVector = createPointVector(endSource, '#F08', 11);
      const stopsVector = createPointVector(stopsSource, '#0AA', 10);

      const routeSource = new VectorSource();
      const routeVector = new VectorLayer({
        source: routeSource,
        style: new Style({
          stroke: new Stroke({
            width: 6,
            color: [85, 170, 255, 0.6],
          }),
        }),
      });

      const initialMap = new Map({
        target: mapElement.current,
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
              attributions:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' +
                ' contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
              attributionsCollapsible: false,
              maxZoom: 19,
            }),
          }),
          startVector,
          endVector,
          stopsVector,
          routeVector,
        ],
        view: new View({
          center: fromLonLat([0, 0]),
          zoom: 3,
          maxZoom: 19,
        }),
      });

      setStartLayer(startSource);
      setEndLayer(endSource);
      setStopsLayer(stopsSource);
      setRouteLayer(routeSource);
      setMap(initialMap);
    }
  }, []);

  useEffect(() => {
    if (map) {
      getIpInfo().then((r) => {
        const { latitude, longitude } = r.location;
        const userLocation = fromLonLat([longitude, latitude]);
        map.getView().setCenter(userLocation);
        map.getView().setZoom(13);
      });
    }
  }, [map]);

  return (
    <div className="App">
      <div ref={mapElement} className="ol-map"></div>
      {/* {map && stopsLayer && startLayer && endLayer && routeLayer && (
        <ActionComponent
          map={map}
          startLayer={startLayer}
          endLayer={endLayer}
          stopsLayer={stopsLayer}
          routeLayer={routeLayer}
        />
      )} */}
      {map && <LeftBar map={map}/>}
      <PageInfo />
    </div>
  );
}

export default App;
