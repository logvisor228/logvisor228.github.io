export interface TextEntry {
  timestamp: number;
  type: 'text';
  package: string;
  text: string;
}

export interface LocationEntry {
  timestamp: number;
  type: 'location';
  lat: number;
  lon: number;
}

export interface NotificationEntry {
  timestamp: number;
  type: 'notification';
  package: string;
  title: string;
  text: string;
}

export interface ConnectivityEntry {
  timestamp: number;
  type: 'connectivity';
  ssid: string;
  bssid: string;
}

export type LogEntry = TextEntry | LocationEntry | NotificationEntry | ConnectivityEntry;

export interface LogData {
  text: TextEntry[];
  location: LocationEntry[];
  notification: NotificationEntry[];
  connectivity: ConnectivityEntry[];
}
