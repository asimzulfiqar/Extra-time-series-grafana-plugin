import { GraphDrawStyle, LegendDisplayMode, TooltipDisplayMode } from '@grafana/schema';

type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  showExportButton: boolean;
  showEnlargeButton: boolean;
  showTableViewButton: boolean;
  // TimeSeries options
  legend?: {
    displayMode: LegendDisplayMode;
    placement: string;
    showLegend: boolean;
    calcs: string[];
  };
  tooltip?: {
    mode: TooltipDisplayMode;
    sort: string;
  };
  drawStyle?: GraphDrawStyle;
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
