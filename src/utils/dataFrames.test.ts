import { FieldType, toDataFrame } from '@grafana/data';
import { getPlottableTimeSeriesFrames } from './dataFrames';

describe('getPlottableTimeSeriesFrames', () => {
  it('keeps non-empty time series frames', () => {
    const frame = toDataFrame({
      fields: [
        { name: 'Time', type: FieldType.time, values: [1, 2] },
        { name: 'Value', type: FieldType.number, values: [3, 4] },
      ],
    });

    expect(getPlottableTimeSeriesFrames([frame])).toEqual([frame]);
  });

  it('removes empty and non-time-series frames', () => {
    const emptyTimeSeries = toDataFrame({
      fields: [
        { name: 'Time', type: FieldType.time, values: [] },
        { name: 'Value', type: FieldType.number, values: [] },
      ],
    });
    const tableFrame = toDataFrame({
      fields: [{ name: 'difference', type: FieldType.number, values: [10] }],
    });
    const malformedFrame = toDataFrame({
      fields: [
        { name: 'Time', type: FieldType.time, values: [1] },
        { name: 'Value', type: FieldType.number, values: [] },
      ],
    });

    expect(getPlottableTimeSeriesFrames([emptyTimeSeries, tableFrame, malformedFrame])).toEqual([]);
  });
});
