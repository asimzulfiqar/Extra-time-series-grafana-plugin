import { GraphFieldConfig, OptionsWithLegend, OptionsWithTooltip } from '@grafana/schema';

export interface SimpleOptions extends OptionsWithLegend, OptionsWithTooltip {
  showExportButton: boolean;
  showEnlargeButton: boolean;
  showTableViewButton: boolean;
  annotationDisplayMode?: AnnotationDisplayMode;
  derivedTooltipValues?: DerivedTooltipValue[];
}

export interface DerivedTooltipValue {
  name: string;
  formula: string;
  unit?: string;
}

export interface ExtraTimeSeriesFieldConfig extends GraphFieldConfig {
  hideFromTable?: boolean;
}

export enum AnnotationDisplayMode {
  Line = 'line',
  Text = 'text',
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
