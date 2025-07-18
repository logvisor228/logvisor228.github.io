"use client";

import { useRef, useEffect, useState } from 'react';
import { LogEntry } from '@/types/logs';
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import TimelineItem from './timeline-item';

interface TimelineProps {
  allEvents: LogEntry[];
  selectedEvent: LogEntry | null;
  onSelectEvent: (event: LogEntry) => void;
}

export default function Timeline({ allEvents, selectedEvent, onSelectEvent }: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (selectedEvent && scrollRef.current) {
      const itemEl = itemRefs.current.get(selectedEvent.timestamp);
      if (itemEl) {
        const scrollContainer = scrollRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          const offsetTop = itemEl.offsetTop;
          const containerHeight = scrollContainer.clientHeight;
          scrollContainer.scrollTo({
            top: offsetTop - (containerHeight / 2) + (itemEl.clientHeight / 2),
            behavior: 'smooth',
          });
        }
      }
    }
  }, [selectedEvent]);

  return (
    <>
      <CardHeader>
        <CardTitle>Таймлайн</CardTitle>
        <CardDescription>Все события в хронологическом порядке.</CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-8rem)] p-6 pt-0">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="relative border-l-2 border-border ml-3 space-y-1">
            {allEvents.map((event) => (
              <div 
                key={`${event.type}-${event.timestamp}`}
                ref={(el) => {
                  if (el) itemRefs.current.set(event.timestamp, el);
                  else itemRefs.current.delete(event.timestamp);
                }}
              >
                 <TimelineItem
                    event={event}
                    isSelected={selectedEvent?.timestamp === event.timestamp}
                    onSelect={() => onSelectEvent(event)}
                 />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </>
  );
}
