import { Map } from 'ol';
import React, { useEffect, useState } from 'react';
import { createLayers } from '../utils/createLayers';
import { AddDestinations } from './AddDestinations';
import './components.css';
import { RouteLayersGroup } from './Routing.types';

type LeftBarComponentProps = {
  map: Map;
};

export const LeftBar = ({ map }: LeftBarComponentProps) => {
  const [layers, setLayers] = useState<RouteLayersGroup | null>(null);

  useEffect(() => {
    if (map) {
      const mapLayers = createLayers();
      mapLayers.forEach((l) => map.addLayer(l));
      setLayers({
        startLayer: mapLayers[0].getSource(),
        endLayer: mapLayers[1].getSource(),
        stopsLayer: mapLayers[2].getSource(),
        pathLayer: mapLayers[3].getSource(),
      });
    }
  }, [map]);

  const [calculatedRoute, setCalculatedRoute] = useState(null);

  return (
    <div className="action-component">
      <div className="action-component-wrapper">
        {!calculatedRoute && layers && (
          <AddDestinations map={map} layers={layers} />
        )}
      </div>
    </div>
  );
};
