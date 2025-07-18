"use client";

import { useState, useCallback, useMemo } from 'react';
import { LogData, LogEntry } from '@/types/logs';
import LogVisor from '@/components/log-visor';
import FileUploader from '@/components/file-uploader';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Github } from 'lucide-react';

const isLogData = (data: any): data is LogData => {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.text) &&
    Array.isArray(data.location) &&
    Array.isArray(data.notification) &&
    Array.isArray(data.connectivity)
  );
};

export default function Home() {
  const [logData, setLogData] = useState<LogData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<LogEntry | null>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback((file: File, isAdding: boolean) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') {
          throw new Error('Содержимое файла не является строкой.');
        }
        const parsedData = JSON.parse(content);

        if (!isLogData(parsedData)) {
          throw new Error('Неверный формат файла журнала.');
        }

        if (isAdding && logData) {
          const combinedData: LogData = {
            text: [...logData.text, ...parsedData.text].sort((a,b) => a.timestamp - b.timestamp),
            location: [...logData.location, ...parsedData.location].sort((a,b) => a.timestamp - b.timestamp),
            notification: [...logData.notification, ...parsedData.notification].sort((a,b) => a.timestamp - b.timestamp),
            connectivity: [...logData.connectivity, ...parsedData.connectivity].sort((a,b) => a.timestamp - b.timestamp),
          };
          setLogData(combinedData);
          toast({ title: 'Успешно', description: 'Дополнительные логи добавлены.' });
        } else {
          parsedData.text.sort((a,b) => a.timestamp - b.timestamp);
          parsedData.location.sort((a,b) => a.timestamp - b.timestamp);
          parsedData.notification.sort((a,b) => a.timestamp - b.timestamp);
          parsedData.connectivity.sort((a,b) => a.timestamp - b.timestamp);
          setLogData(parsedData);
          setFileName(file.name);
          setSelectedEvent(null);
          toast({ title: 'Успешно', description: `Файл журнала "${file.name}" успешно загружен.` });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Ошибка загрузки файла',
          description: error instanceof Error ? error.message : 'Произошла неизвестная ошибка.',
        });
      }
    };
    reader.onerror = () => {
       toast({
          variant: 'destructive',
          title: 'Ошибка чтения файла',
          description: 'Не удалось прочитать выбранный файл.',
        });
    }
    reader.readAsText(file);
  }, [logData, toast]);

  const handleReset = () => {
    setLogData(null);
    setFileName('');
    setSelectedEvent(null);
    toast({ title: 'Закрыто', description: 'Данные журнала были очищены.' });
  };
  
  const allEvents = useMemo(() => {
    if (!logData) return [];
    return [
      ...logData.text,
      ...logData.location,
      ...logData.notification,
      ...logData.connectivity,
    ].sort((a, b) => a.timestamp - b.timestamp);
  }, [logData]);

  if (!logData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/hosting-instructions/">
              <Github className="h-6 w-6" />
            </Link>
          </Button>
        </div>
        <FileUploader onFileUpload={(file) => handleFileUpload(file, false)} />
        <p className="mt-4 text-muted-foreground">Загрузите файл журнала в формате JSON, чтобы начать визуализацию.</p>
      </div>
    );
  }

  return (
    <LogVisor
      logData={logData}
      fileName={fileName}
      selectedEvent={selectedEvent}
      allEvents={allEvents}
      onSelectEvent={setSelectedEvent}
      onAddFile={(file) => handleFileUpload(file, true)}
      onClose={handleReset}
    />
  );
}
