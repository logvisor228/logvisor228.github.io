"use client";

import { LogEntry, ConnectivityEntry, LocationEntry } from '@/types/logs';
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight, Compass, MessageSquare, Wifi, Hash } from 'lucide-react';
import { useMemo } from 'react';

const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ru-RU', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).replace(',', '');
};

interface LogDetailsViewProps {
  selectedEvent: LogEntry | null;
  allEvents: LogEntry[];
  locationEntries: LocationEntry[];
  onSelectEvent: (event: LogEntry | null) => void;
}


const findNearestConnectivity = (locationEvent: LocationEntry, allEvents: LogEntry[]): ConnectivityEntry | null => {
  const connectivityEvents = allEvents.filter(e => e.type === 'connectivity') as ConnectivityEntry[];
  if (connectivityEvents.length === 0) return null;

  let nearest: ConnectivityEntry | null = null;
  let smallestDiff = Infinity;

  for (const connEvent of connectivityEvents) {
    const diff = Math.abs(connEvent.timestamp - locationEvent.timestamp);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      nearest = connEvent;
    }
  }
  return nearest;
};

export default function LogDetailsView({ selectedEvent, allEvents, locationEntries, onSelectEvent }: LogDetailsViewProps) {
  
  const nearestConnectivity = useMemo(() => {
    if (selectedEvent?.type === 'location') {
      return findNearestConnectivity(selectedEvent as LocationEntry, allEvents);
    }
    return null;
  }, [selectedEvent, allEvents]);

  const currentLocationIndex = useMemo(() => {
     if (selectedEvent?.type !== 'location') return -1;
     return locationEntries.findIndex(e => e.timestamp === selectedEvent.timestamp);
  }, [selectedEvent, locationEntries]);

  const handleNav = (direction: 'prev' | 'next') => {
    if (currentLocationIndex === -1) return;
    const newIndex = direction === 'prev' ? currentLocationIndex - 1 : currentLocationIndex + 1;
    if (newIndex >= 0 && newIndex < locationEntries.length) {
      onSelectEvent(locationEntries[newIndex]);
    }
  };

  if (!selectedEvent) {
    return (
      <div className="h-full flex items-center justify-center p-6">
          <p className="text-muted-foreground">Выберите событие для просмотра деталей.</p>
      </div>
    );
  }
  
  const renderContent = () => {
    switch (selectedEvent.type) {
      case 'location':
        return (
          <>
            <div className="flex items-center gap-2">
              <Compass className="text-primary"/>
              <p><strong>Координаты:</strong> {selectedEvent.lat}, {selectedEvent.lon}</p>
            </div>
            
            {nearestConnectivity && (
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <h4 className="font-semibold text-muted-foreground mb-2">Ближайшая сетевая активность</h4>
                <div className="flex items-center gap-2">
                  <Wifi className="text-primary"/>
                  <p><strong>SSID:</strong> {nearestConnectivity.ssid}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="text-primary"/>
                  <p><strong>BSSID:</strong> {nearestConnectivity.bssid}</p>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  ({formatTimestamp(nearestConnectivity.timestamp)})
                </p>
              </div>
            )}
            <div className="mt-6 flex justify-between">
              <Button onClick={() => handleNav('prev')} disabled={currentLocationIndex <= 0}><ArrowLeft className="mr-2 h-4 w-4"/> Назад</Button>
              <Button onClick={() => handleNav('next')} disabled={currentLocationIndex >= locationEntries.length - 1}>Вперед <ArrowRight className="ml-2 h-4 w-4"/></Button>
            </div>
          </>
        );
      case 'notification':
      case 'text':
        return (
          <>
            <p><strong>Пакет:</strong> {selectedEvent.package}</p>
            {selectedEvent.type === 'notification' && <p><strong>Заголовок:</strong> {selectedEvent.title}</p>}
            <p><strong>Текст:</strong></p>
            <p className="p-2 bg-muted rounded-md mt-1 whitespace-pre-wrap">{selectedEvent.text}</p>
          </>
        );
      case 'connectivity':
        return (
          <>
            <p><strong>SSID:</strong> {selectedEvent.ssid}</p>
            <p><strong>BSSID:</strong> {selectedEvent.bssid}</p>
          </>
        );
      default:
        return <p>Неизвестный тип события.</p>;
    }
  };
  
  const getTitle = () => {
      switch(selectedEvent.type) {
          case 'location': return 'Детали локации';
          case 'notification': return 'Детали уведомления';
          case 'text': return 'Детали текста';
          case 'connectivity': return 'Детали подключения';
      }
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            {selectedEvent.type === 'location' && <Compass className="text-primary"/>}
            {(selectedEvent.type === 'text' || selectedEvent.type === 'notification') && <MessageSquare className="text-primary"/>}
            {selectedEvent.type === 'connectivity' && <Wifi className="text-primary"/>}
            {getTitle()}
        </CardTitle>
        <CardDescription>{formatTimestamp(selectedEvent.timestamp)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {renderContent()}
      </CardContent>
    </>
  );
}
