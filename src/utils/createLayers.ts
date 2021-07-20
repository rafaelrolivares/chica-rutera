import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';

export const createLayers = () => {
  const startVector = createPointVector('#5FA', 12);
  const endVector = createPointVector('#F08', 11);
  const stopsVector = createPointVector('#0AA', 10);
  const pathVector = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
      stroke: new Stroke({
        width: 6,
        color: [85, 170, 255, 0.6],
      }),
    }),
  });
  return [startVector, endVector, stopsVector, pathVector];
};

const createPointVector = (color: string, zIndex: number) =>
  new VectorLayer({
    source: new VectorSource(),
    style: new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color }),
        stroke: new Stroke({
          color: '#258',
          width: 2,
        }),
      }),
      zIndex,
    }),
  });
