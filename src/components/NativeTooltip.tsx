import React from 'react';
import { DataFrame, FieldType, formattedValueToString, getFieldDisplayName } from '@grafana/data';
import { SortOrder, TooltipDisplayMode } from '@grafana/schema';
import { SeriesTable } from '@grafana/ui';

interface Props {
  frame: DataFrame;
  dataIdxs: Array<number | null>;
  seriesIdx: number | null;
  mode: TooltipDisplayMode;
  sortOrder: SortOrder;
}

export const NativeTooltip = ({ frame, dataIdxs, seriesIdx, mode, sortOrder }: Props) => {
  const timeField = frame.fields[0];
  const timeIndex = dataIdxs[0];
  const timestamp = timeIndex == null ? undefined : formattedValueToString(timeField.display!(timeField.values[timeIndex]));

  const rows = frame.fields
    .map((field, fieldIndex) => {
      const dataIndex = dataIdxs[fieldIndex];
      if (fieldIndex === 0 || field.type !== FieldType.number || dataIndex == null) {
        return null;
      }

      const display = field.display!(field.values[dataIndex]);
      return {
        color: display.color,
        label: getFieldDisplayName(field, frame),
        value: formattedValueToString(display),
        isActive: fieldIndex === seriesIdx,
        numeric: display.numeric,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null)
    .filter((row) => mode === TooltipDisplayMode.Multi || row.isActive);

  if (sortOrder !== SortOrder.None) {
    const direction = sortOrder === SortOrder.Ascending ? 1 : -1;
    rows.sort((a, b) => direction * ((a.numeric ?? 0) - (b.numeric ?? 0)));
  }

  return <SeriesTable timestamp={timestamp} series={rows} />;
};
