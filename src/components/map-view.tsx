"use client";

import { LocationEntry, LogEntry } from '@/types/logs';
import { YMaps, Map, Placemark, Polyline } from '@pbe/react-yandex-maps';
import { useEffect, useRef, useState } from 'react';

const YANDEX_MAPS_API_KEY = '229e231a-a08b-4189-899b-f2d2bd36f3e3';

interface MapViewProps {
  locationEntries: LocationEntry[];
  selectedEvent: LogEntry | null;
  onSelectEvent: (event: LogEntry) => void;
}

interface MapState {
    center: [number, number];
    zoom: number;
}


export default function MapView({ locationEntries, selectedEvent, onSelectEvent }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  const defaultState: MapState = {
    center: locationEntries.length > 0 ? [locationEntries[0].lat, locationEntries[0].lon] : [55.751574, 37.573856],
    zoom: 12,
  };

  const polylineCoords = locationEntries.map(entry => [entry.lat, entry.lon]);
  
  useEffect(() => {
    if (mapInstance && selectedEvent && selectedEvent.type === 'location') {
      const targetCoords: [number, number] = [selectedEvent.lat, selectedEvent.lon];
      
      mapInstance.panTo(targetCoords, {
        flying: true,
        duration: 1500,
      }).then(() => {
        // This adjustment is best done after the pan is complete
        const currentZoom = mapInstance.getZoom();
        const mapSize = mapInstance.container.getSize(); // [width, height]
        const projection = mapInstance.options.get('projection');
        
        const placemarkGlobalPixels = projection.toGlobalPixels(targetCoords, currentZoom);

        // We want the placemark to be at 30% from the top of the viewport
        const newCenterGlobalPixels = [
          placemarkGlobalPixels[0],
          placemarkGlobalPixels[1] + mapSize[1] * (0.5 - 0.3) // 0.5 is center, 0.3 is target position from top
        ];
        
        const newCenter = projection.fromGlobalPixels(newCenterGlobalPixels, currentZoom);
        
        mapInstance.setCenter(newCenter, currentZoom);
      });
    }
  }, [selectedEvent, mapInstance]);

  return (
    <YMaps query={{ apikey: YANDEX_MAPS_API_KEY }}>
      <Map
        instanceRef={(instance) => {
          if (instance) {
             setMapInstance(instance);
             mapRef.current = instance;
          }
        }}
        defaultState={defaultState}
        width="100%"
        height="100%"
        modules={["control.ZoomControl", "control.FullscreenControl", "projection.sphericalMercator"]}
      >
        {locationEntries.map(entry => (
          <Placemark
            key={entry.timestamp}
            geometry={[entry.lat, entry.lon]}
            onClick={() => onSelectEvent(entry)}
            options={{
              iconColor: '#A23CBC', // primary color
              preset: selectedEvent?.timestamp === entry.timestamp
                ? 'islands#violetDotIconWithCaption'
                : 'islands#violetDotIcon',
            }}
            properties={{
              iconCaption: new Date(entry.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            }}
          />
        ))}
        {polylineCoords.length > 1 && (
          <Polyline
            geometry={polylineCoords}
            options={{
              strokeColor: '#A23CBC', // primary color
              strokeWidth: 4,
              strokeOpacity: 0.7,
            }}
          />
        )}
      </Map>
    </YMaps>
  );
}
