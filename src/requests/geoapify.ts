import { Map } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { toLonLat } from 'ol/proj';

export const geoApifyUrl = 'https://api.geoapify.com/v1/';

const geocoder = geoApifyUrl + 'geocode/';
const gaKey = process.env.REACT_APP_GEOAPIFY_KEY as string;
const keyParam = `&apiKey=${gaKey}`;

const requestOptions = { method: 'GET' };

export const getIpInfo = async () => {
  const ipInfoUrl = geoApifyUrl + 'ipinfo?';
  const url = ipInfoUrl + keyParam;
  const data = await fetch(url, requestOptions);
  const response = await data.json();
  return response;
};

const geoApifyFetcher = async (url: string) => {
  const data = await fetch(url, requestOptions);
  const response = await data.json();
  console.log(response);
  return response.features;
};

type AddressApis = 'search' | 'autocomplete';

export const addressSearch = async (
  address: string,
  api: AddressApis,
  limit: number,
  map: Map
) => {
  const viewCenter = map.getView().getCenter() as Coordinate;
  const [lon, lat] = toLonLat(viewCenter);
  const searchUrl = geocoder + api;
  const text = `?text=${address}`;
  const limitParam = `&limit=${limit}`;
  const bias = `&bias=proximity:${lon},${lat}|countrycode:auto`;

  const url = searchUrl + text + limitParam + bias + keyParam;

  const result = await geoApifyFetcher(url);
  const responses = result.map((r: any) => r.properties);
  return limit === 1 ? responses[0] : responses;
};

export const reverseGeocode = async ([lon, lat]: any) => {
  const geocodeUrl = geocoder + 'reverse';
  const point = `?lat=${lat}&lon=${lon}`;
  const url = geocodeUrl + point + keyParam;
  const [result] = await geoApifyFetcher(url);
  return result.properties;
};
