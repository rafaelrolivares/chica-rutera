import { Feature, Map } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import React, { useState } from 'react';
import { addressSearch } from '../requests/geoapify';
import { createRoutePoint } from '../utils/createPoints';
import {
  GeocoderResponse,
  RouteDestinations,
  RouteLayersGroup,
} from './Routing.types';
import * as olExtent from 'ol/extent';
import { Extent } from 'ol/extent';

type AddDestinationsProps = {
  map: Map;
  layers: RouteLayersGroup;
};

const placeHolderTxt = 'Search for an address';

export const AddDestinations = ({ map, layers }: AddDestinationsProps) => {
  const [destinations, setDestinations] = useState<RouteDestinations>({
    start: undefined,
    end: undefined,
    stops: [],
  });

  const maxPoints = 48;

  const handleAddressInput = async (
    e: { key: string; target: any },
    layer: VectorSource
  ) => {
    const address = await searchForAddress(e.target.value, layer);
    console.log(address);
    e.target.value =
      layer === layers.stopsLayer ? '' : address || e.target.value;
  };

  const searchForAddress = async (text: string, layer: VectorSource) => {
    const [lon, lat] = setLocationBias();
    const codedAddress: GeocoderResponse = await addressSearch(text, lon, lat);
    if (codedAddress) {
      const point = [codedAddress.lon, codedAddress.lat];
      map.getView().setCenter(fromLonLat(point) as Coordinate);
      map.getView().setZoom(15);
      updateRoute(codedAddress, layer);
      console.log(codedAddress.formatted);
      return codedAddress.formatted;
    } else {
      alert(
        'No address found. Please check for typos and/or add details (city, region, country)'
      );
    }
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
    const layerExtent: Extent = olExtent.createEmpty();
    Object.values(layers).forEach(function (layer) {
      olExtent.extend(layerExtent, layer.getExtent());
    });
    map.getView().fit(layerExtent, {
      size: map.getSize(),
      padding: [50, 50, 50, 450],
    });
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

  const fileReader = (files: FileList | null) => {
    const file = files && files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e) =>
        e && e.target && addPointsFromFile(e.target.result as string);
      reader.onerror = () => console.log('error reading file');
    }
  };

  const addPointsFromFile = (text: string) => {
    const addresses = Array.from(
      new Set(
        text
          .split('\n')
          .filter((a) => a)
          .map((a) => a.replace(/;/g, ', '))
      )
    );
    addresses.forEach((a, i) => {
      setTimeout(
        () =>
          layers.stopsLayer.getFeatures().length < maxPoints &&
          searchForAddress(a as string, layers.stopsLayer),
        1000 * (i + 1)
      );
    });
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
            disabled={layers.stopsLayer.getFeatures().length === maxPoints}
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
        {destinations.stops.length === maxPoints && (
          <div>Maximum number of points ({maxPoints}) reached.</div>
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
