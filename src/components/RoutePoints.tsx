import { Feature, Map } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';
import React, { useEffect, useState } from 'react';
import { addressSearch } from '../requests/geoapify';
import { Autocomplete } from './Autocomplete';

type RoutePointsProps = {
  updateStartFunction: (location: any) => void;
  updateEndFunction: (location: any) => void;
  addStopsFunction: (location: any) => void;
  removeStopsFunction: (stop: Feature) => void;
  stops: Feature[];
  currentStart: string;
  currentEnd: string;
  map: Map;
  copyEndFromStart: () => void;
  clearStopsFunction: () => void;
};

type GeocoderResponse = {
  formatted: string;
  lat: number;
  lon: number;
};

type LayerItem = 'start' | 'end' | 'stops';

export const RoutePoints = ({
  updateStartFunction,
  updateEndFunction,
  addStopsFunction,
  removeStopsFunction,
  stops,
  map,
  currentStart,
  currentEnd,
  copyEndFromStart,
  clearStopsFunction,
}: RoutePointsProps) => {
  const [addressSuggestions, setAddressSugestions] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<LayerItem>();

  const handleAddressInput = async (
    e: { key: string; target: any },
    item: LayerItem
  ) => {
    setActiveInput(item);
    if (e.target.value.length >= 3) {
      if (e.key === 'Enter') {
        searchForAddress(e.target.value, item, e.target);
      } else {
        addressSearch(e.target.value, 'autocomplete', 5, map).then(
          (res: GeocoderResponse[]) =>
            setAddressSugestions(res.map((r) => r.formatted))
        );
      }
    } else if (e.key === 'Enter') {
      alert('Please type at least three characters');
    }
  };

  const selectFromAutocomplete = (address: string) => {
    setAddressSugestions([]);
    activeInput && searchForAddress(address, activeInput);
  };

  const searchForAddress = (
    value: string,
    item: LayerItem,
    elementToUpdate?: { value: string } | undefined
  ) => {
    addressSearch(value, 'search', 1, map).then((r: GeocoderResponse) => {
      if (r) {
        if (elementToUpdate) {
          elementToUpdate.value = item === 'stops' ? '' : r.formatted;
        }
        updateState(r, item);
        const point = [r.lon, r.lat];
        map.getView().setCenter(fromLonLat(point) as Coordinate);
        map.getView().setZoom(15);
      } else {
        alert(
          'No address found. Please check for typos and/or add details (city, region, country)'
        );
      }
    });
  };

  const updateState = (r: any, item: LayerItem) => {
    if (item === 'start') {
      updateStartFunction(r);
    } else if (item === 'end') {
      updateEndFunction(r);
    } else if (item === 'stops') {
      addStopsFunction(r);
    }
  };

  const placeHolderTxt = 'Search for an address';

  const fileHandler = (files: FileList | null) => {
    const file = files && files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e) =>
        e && e.target && addPointsFromFile(e.target.result as string);
      reader.onerror = () => console.log('error reading file');
    }
  };

  const [addressesFromFile, setAddressesFromFile] = useState<string[]>([]);

  const addPointsFromFile = (text: string) => {
    const addresses = text
      .split('\n')
      .filter((a) => a)
      .map((a) => a.replace(/;/g, ', '));
    setAddressesFromFile(Array.from(new Set(addresses)));
  };

  useEffect(() => {
    if (addressesFromFile.length) {
      const nextAddress = addressesFromFile.pop();
      setTimeout(() => searchForAddress(nextAddress as string, 'stops'), 500);
    }
  }, [stops, addressesFromFile]);

  return (
    <div>
      <div className="search-item">
        <label htmlFor="search-start">Starting point:</label>
        <input
          id="search-start"
          type="text"
          onKeyDown={(e) => handleAddressInput(e, 'start')}
          placeholder={placeHolderTxt}
          defaultValue={currentStart || ''}
        />
        {activeInput === 'start' && <Autocomplete items={addressSuggestions} selectAction={selectFromAutocomplete}/>}
      </div>
      <div className="search-item">
        <label htmlFor="search-end">Ending point:</label>
        <input
          id="search-end"
          type="text"
          onKeyDown={(e) => handleAddressInput(e, 'end')}
          placeholder={placeHolderTxt}
          defaultValue={currentEnd || ''}
        />
        {currentStart && (
          <span className="repeat-start-btn" onClick={copyEndFromStart}>
            Same as start
          </span>
        )}
        {activeInput === 'end' && <Autocomplete items={addressSuggestions} selectAction={selectFromAutocomplete}/>}
      </div>
      <div>
        <div className="search-item">
          <label htmlFor="search-stops">Add stops:</label>
          <input
            id="search-stops"
            type="text"
            onKeyDown={(e) => handleAddressInput(e, 'stops')}
            placeholder={placeHolderTxt}
          />
          {activeInput === 'stops' && (
            <Autocomplete items={addressSuggestions} selectAction={selectFromAutocomplete} />
          )}
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
            onChange={(e) => fileHandler(e.target.files)}
          />
        </div>
        {stops.length === 48 && (
          <div>Maximum number of points (48) reached.</div>
        )}
        <div>
          {stops.map((s, i) => (
            <div key={i + 1}>
              <input type="text" value={s.get('name')} disabled={true} />
              <span onClick={() => removeStopsFunction(s)}>&times;</span>
            </div>
          ))}
          {stops.length > 1 && (
            <div className="option-btn" onClick={clearStopsFunction}>
              Clear all stops
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
