"use client";

import { NotificationEntry, LogEntry } from '@/types/logs';
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';
import { useState } from 'react';

interface NotificationsViewProps {
  notificationEntries: NotificationEntry[];
  onSelectEvent: (event: LogEntry) => void;
}

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

export default function NotificationsView({ notificationEntries, onSelectEvent }: NotificationsViewProps) {
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
  const sortedEntries = [...notificationEntries].sort((a, b) => b.timestamp - a.timestamp);

  const handleSelect = (event: NotificationEntry) => {
    setSelectedTimestamp(event.timestamp);
    onSelectEvent(event);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Уведомления</CardTitle>
        <CardDescription>Все зафиксированные события уведомлений, отсортированные по времени.</CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-8rem)] p-6 pt-0">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {sortedEntries.map(entry => (
              <div
                key={entry.timestamp}
                onClick={() => handleSelect(entry)}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary border-2 border-transparent rounded-lg",
                  selectedTimestamp === entry.timestamp && "border-primary ring-2 ring-primary"
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex-grow">
                        <CardTitle className="text-base">{entry.title || 'Уведомление'}</CardTitle>
                        <CardDescription>{entry.package}</CardDescription>
                    </div>
                    <Bell className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{entry.text}</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatTimestamp(entry.timestamp)}</p>
                </CardContent>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </>
  );
}
