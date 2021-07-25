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
  const [address] = response.features;
  if (address) return address.properties;
  else return null;
};

export const addressSearch = async (
  address: string,
  lon?: number,
  lat?: number
) => {
  const searchUrl = geocoder + 'search';
  const text = `?text=${address}`;
  const limit = '&limit=1';
  const bias =
    lat || lon ? `&bias=proximity:${lon},${lat}|countrycode:none` : '';

  const url = searchUrl + text + limit + bias + keyParam;

  return await geoApifyFetcher(url);
};

export const reverseGeocode = async ([lon, lat]: any) => {
  const geocodeUrl = geocoder + 'reverse';
  const point = `?lat=${lat}&lon=${lon}`;
  const url = geocodeUrl + point + keyParam;
  return await geoApifyFetcher(url);
};
