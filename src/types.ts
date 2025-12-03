type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  showExportButton: boolean;
  showEnlargeButton: boolean;
  showTableViewButton: boolean;
}

export enum ViewMode {
  Graph = 'graph',
  Table = 'table',
}

export enum ExportFormat {
  CSV = 'csv',
  HTML = 'html',
  Image = 'image',
}
