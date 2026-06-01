import { OptionsWithLegend, OptionsWithTooltip } from '@grafana/schema';

export interface SimpleOptions extends OptionsWithLegend, OptionsWithTooltip {
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
