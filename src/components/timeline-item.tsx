import { LogEntry } from '@/types/logs';
import { cn } from '@/lib/utils';
import { Bell, FileText, MapPin, Wifi } from 'lucide-react';

interface TimelineItemProps {
  event: LogEntry;
  isSelected: boolean;
  onSelect: () => void;
}

const eventMeta = {
  location: { icon: MapPin, color: 'text-rose-400' },
  notification: { icon: Bell, color: 'text-amber-400' },
  text: { icon: FileText, color: 'text-sky-400' },
  connectivity: { icon: Wifi, color: 'text-emerald-400' },
};

const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year} ${date.toLocaleTimeString('ru-RU', { hour12: false })}`;
};


export default function TimelineItem({ event, isSelected, onSelect }: TimelineItemProps) {
  const meta = eventMeta[event.type];
  const Icon = meta.icon;

  const renderTitle = () => {
    switch(event.type) {
      case 'location': return 'Обновление местоположения';
      case 'notification': return `Уведомление: ${event.package}`;
      case 'text': return `Текстовый ввод: ${event.package}`;
      case 'connectivity': return `Подключено к ${event.ssid}`;
    }
  }

  const renderDetails = () => {
    switch(event.type) {
        case 'location': return `Шир: ${event.lat.toFixed(4)}, Дол: ${event.lon.toFixed(4)}`;
        case 'notification': return `${event.title}: ${event.text}`;
        case 'text': return `"${event.text}"`;
        case 'connectivity': return `BSSID: ${event.bssid}`;
    }
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-start gap-x-4 p-2 pl-8 rounded-lg cursor-pointer transition-colors relative",
        isSelected ? 'bg-primary/20' : 'hover:bg-muted'
      )}
    >
      <div className="absolute top-3 left-0 -translate-x-1/2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background ring-4 ring-background">
             <Icon className={cn("h-4 w-4", meta.color)} />
          </span>
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-sm truncate">{renderTitle()}</p>
        <p className="text-xs text-muted-foreground truncate">{renderDetails()}</p>
        <time className="text-xs text-muted-foreground/70">{formatTimestamp(event.timestamp)}</time>
      </div>
    </div>
  );
}
