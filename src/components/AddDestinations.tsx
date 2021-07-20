import { Feature, Map } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import React, { useEffect, useState } from 'react';
import { addressSearch } from '../requests/geoapify';
import { createRoutePoint } from '../utils/createPoints';
import { fileHandler } from '../utils/readFile';
import { RouteLayersGroup } from './Routing.types';

type AddDestinationsProps = {
  map: Map;
  layers: RouteLayersGroup;
};

type RouteDestinations = {
  start: Feature | undefined;
  end: Feature | undefined;
  stops: Feature[];
};

type GeocoderResponse = {
  formatted: string;
  lat: number;
  lon: number;
};

const placeHolderTxt = 'Search for an address';

export const AddDestinations = ({ map, layers }: AddDestinationsProps) => {
  const [destinations, setDestinations] = useState<RouteDestinations>({
    start: undefined,
    end: undefined,
    stops: [],
  });

  const handleAddressInput = (e: { target: any }, layer: VectorSource) => {
    const [lon, lat] = setLocationBias();
    addressSearch(e.target.value, lon, lat).then((r: GeocoderResponse) => {
      if (r) {
        e.target.value = layer === layers.stopsLayer ? '' : r.formatted;
        const point = [r.lon, r.lat];
        map.getView().setCenter(fromLonLat(point) as Coordinate);
        map.getView().setZoom(15);
        updateRoute(r, layer);
        console.log(layer !== layers.stopsLayer);
      } else {
        alert(
          'No address found. Please check for typos and/or add details (city, region, country)'
        );
      }
    });
  };

  const setLocationBias = () => {
    const viewCenter = map.getView().getCenter();
    const mapCenter = viewCenter ? toLonLat(viewCenter) : [0, 0];
    return mapCenter;
  };

  const updateRoute = (r: GeocoderResponse, layer: VectorSource) => {
    const point = createRoutePoint(r);
    layer !== layers.stopsLayer && layer.clear();
    layer.addFeature(point);
    setDestinations(updatedDestinations());
  };

  const updatedDestinations = () => {
    return {
      start: layers.startLayer.getFeatures()[0],
      end: layers.endLayer.getFeatures()[0],
      stops: layers.stopsLayer.getFeatures(),
    };
  };

  const removeStop = (feature: Feature) => {
    layers.stopsLayer.removeFeature(feature);
    setDestinations(updatedDestinations());
  };

  const removeAllStops = () => {
    layers.stopsLayer.clear();
    setDestinations(updatedDestinations());
  };

  const copyEndFromStart = () => {
    if (destinations.start) {
      layers.endLayer.clear();
      layers.endLayer.addFeature(destinations.start);
      setDestinations(updatedDestinations());
    }
  };

  const fileReader = async (files: FileList | null) => {
    const addresses = files && files[0] && fileHandler(files[0]);
    console.log(addresses);
  };

  return (
    <div>
      <div>Create your best driving route between multiple points</div>
      <div className="search-item">
        <label htmlFor="search-start">Starting point:</label>
        <input
          id="search-start"
          type="text"
          onKeyDown={(e) =>
            e.key === 'Enter' && handleAddressInput(e, layers.startLayer)
          }
          placeholder={placeHolderTxt}
          defaultValue={
            destinations.start ? destinations.start.get('name') : ''
          }
        />
      </div>
      <div className="search-item">
        <label htmlFor="search-end">Ending point:</label>
        <input
          id="search-end"
          type="text"
          onKeyDown={(e) =>
            e.key === 'Enter' && handleAddressInput(e, layers.endLayer)
          }
          placeholder={placeHolderTxt}
          defaultValue={destinations.end ? destinations.end.get('name') : ''}
        />
        {destinations.start && (
          <span className="repeat-start-btn" onClick={copyEndFromStart}>
            Same as start
          </span>
        )}
      </div>
      <div>
        <div className="search-item">
          <label htmlFor="search-stops">Add stops:</label>
          <input
            id="search-stops"
            type="text"
            onKeyDown={(e) =>
              e.key === 'Enter' && handleAddressInput(e, layers.stopsLayer)
            }
            placeholder={placeHolderTxt}
          />
        </div>
        <div className="search-item">
          <label htmlFor="uploader">Or upload a file (txt/csv):</label>
          <input
            id="uploader"
            type="file"
            multiple={false}
            accept={
              '.csv, text/plain,' +
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, ' +
              'application/vnd.ms-excel'
            }
            onChange={(e) => fileReader(e.target.files)}
          />
        </div>
        {destinations.stops.length === 48 && (
          <div>Maximum number of points (48) reached.</div>
        )}
        <div>
          {destinations.stops.map((s, i) => (
            <div key={i + 1}>
              <input type="text" value={s.get('name')} disabled={true} />
              <span onClick={() => removeStop(s)}>&times;</span>
            </div>
          ))}
          {destinations.stops.length > 1 && (
            <div className="option-btn" onClick={removeAllStops}>
              Clear all stops
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
