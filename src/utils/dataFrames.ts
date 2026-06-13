import { DataFrame, FieldType } from '@grafana/data';

export const getPlottableTimeSeriesFrames = (frames: DataFrame[]): DataFrame[] => {
  return frames.filter((frame) => {
    const timeField = frame.fields?.find((field) => field?.type === FieldType.time);
    const rowCount = timeField?.values.length ?? 0;

    if (rowCount === 0) {
      return false;
    }

    return frame.fields.some(
      (field) => field?.type === FieldType.number && field.values.length === rowCount
    );
  });
};
