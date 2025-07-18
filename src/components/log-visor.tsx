"use client";

import { useRef, useState } from 'react';
import { LogData, LogEntry } from '@/types/logs';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { FilePlus, X, Bell, FileText, GanttChart, ChevronUp, ChevronDown, Map } from 'lucide-react';
import MapView from './map-view';
import LogDetailsView from './log-details-view';
import NotificationsView from './notifications-view';
import TextLogView from './text-log-view';
import Timeline from './timeline';

interface LogVisorProps {
  logData: LogData;
  fileName: string;
  selectedEvent: LogEntry | null;
  allEvents: LogEntry[];
  onSelectEvent: (event: LogEntry | null) => void;
  onAddFile: (file: File) => void;
  onClose: () => void;
}

export default function LogVisor({
  logData,
  fileName,
  selectedEvent,
  allEvents,
  onSelectEvent,
  onAddFile,
  onClose,
}: LogVisorProps) {
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  
  const [activeTab, setActiveTab] = useState("map");

  const handleAddFileClick = () => {
    addFileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAddFile(file);
      event.target.value = '';
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Deselect event when switching away from map, to hide details
    if (value !== 'map') {
      onSelectEvent(null);
    }
  };

  const handleEventSelectFromOtherTab = (event: LogEntry) => {
    onSelectEvent(event);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground p-4 gap-4">
      <header className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-xl font-bold text-primary truncate pr-4">
          LogVisor: <span className="text-foreground font-medium">{fileName}</span>
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAddFileClick}>
            <FilePlus className="mr-2 h-4 w-4" /> Добавить файл
          </Button>
          <input
            type="file"
            ref={addFileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="application/json"
          />
          <Button variant="destructive" size="sm" onClick={onClose}>
            <X className="mr-2 h-4 w-4" /> Закрыть
          </Button>
        </div>
      </header>

      <main className="flex-grow min-h-0">
         <Tabs defaultValue="map" className="h-full flex flex-col" onValueChange={handleTabChange} value={activeTab}>
            <TabsList className="flex-wrap h-auto">
                <TabsTrigger value="map"><Map className="mr-2 h-4 w-4"/>Карта</TabsTrigger>
                <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4"/>Уведомления</TabsTrigger>
                <TabsTrigger value="texts"><FileText className="mr-2 h-4 w-4"/>Тексты</TabsTrigger>
                <TabsTrigger value="timeline"><GanttChart className="mr-2 h-4 w-4"/>Таймлайн</TabsTrigger>
            </TabsList>
            
            <div className="flex-grow pt-4 min-h-0">
                <TabsContent value="map" className="h-full m-0">
                    <div className="h-full w-full relative">
                         <Card className="h-full w-full overflow-hidden">
                            <CardContent className="p-0 h-full">
                                <MapView
                                    locationEntries={logData.location}
                                    selectedEvent={selectedEvent}
                                    onSelectEvent={onSelectEvent}
                                />
                            </CardContent>
                        </Card>
                         <Collapsible 
                            open={isDrawerOpen && activeTab === 'map'} 
                            onOpenChange={setIsDrawerOpen}
                            className="absolute bottom-0 left-0 right-0 z-10"
                        >
                            <div className="flex justify-center">
                                <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-48 rounded-t-lg rounded-b-none bg-card border border-b-0">
                                    {isDrawerOpen ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronUp className="h-4 w-4 mr-2" />}
                                    {isDrawerOpen ? 'Скрыть детали' : 'Показать детали'}
                                </Button>
                                </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
                                <Card className="rounded-t-lg border-t-0 max-h-[45vh] overflow-hidden flex flex-col">
                                    <div className="h-full overflow-y-auto p-4">
                                        <LogDetailsView
                                        selectedEvent={selectedEvent}
                                        allEvents={allEvents}
                                        onSelectEvent={onSelectEvent}
                                        locationEntries={logData.location}
                                        />
                                    </div>
                                </Card>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </TabsContent>
                <TabsContent value="notifications" className="h-full m-0">
                    <Card className="h-full">
                        <NotificationsView
                            notificationEntries={logData.notification}
                            onSelectEvent={handleEventSelectFromOtherTab}
                        />
                    </Card>
                </TabsContent>
                <TabsContent value="texts" className="h-full m-0">
                    <Card className="h-full">
                        <TextLogView
                            textEntries={logData.text}
                            onSelectEvent={handleEventSelectFromOtherTab}
                        />
                    </Card>
                </TabsContent>
                <TabsContent value="timeline" className="h-full m-0">
                    <Card className="h-full">
                        <Timeline
                            allEvents={allEvents}
                            selectedEvent={selectedEvent}
                            onSelectEvent={onSelectEvent}
                        />
                    </Card>
                </TabsContent>
            </div>
        </Tabs>
      </main>
    </div>
  );
}
