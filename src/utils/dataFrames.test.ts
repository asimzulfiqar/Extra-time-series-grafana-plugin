import { FieldType, toDataFrame } from '@grafana/data';
import { getPlottableTimeSeriesFrames, getVisualStructureRev } from './dataFrames';

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

  it('removes fields hidden from the visualization', () => {
    const frame = toDataFrame({
      name: 'Query',
      fields: [
        { name: 'Time', type: FieldType.time, values: [1, 2] },
        { name: 'Visible', type: FieldType.number, values: [3, 4] },
        {
          name: 'Hidden by override',
          type: FieldType.number,
          values: [5, 6],
          config: { custom: { hideFrom: { legend: false, tooltip: false, viz: true } } },
        },
        {
          name: 'Hidden by state',
          type: FieldType.number,
          values: [7, 8],
        },
      ],
    });
    frame.fields[3].state = { hideFrom: { legend: false, tooltip: false, viz: true } };

    const [visibleFrame] = getPlottableTimeSeriesFrames([frame]);

    expect(visibleFrame.fields.map((field) => field.name)).toEqual(['Time', 'Visible']);
  });

  it('changes visual structure revision when field visual config changes', () => {
    const frame = toDataFrame({
      fields: [
        { name: 'Time', type: FieldType.time, values: [1, 2] },
        {
          name: 'Value',
          type: FieldType.number,
          values: [3, 4],
          config: { color: { mode: 'palette-classic' } },
        },
      ],
    });
    const initialRev = getVisualStructureRev([frame], 1);

    frame.fields[1].config = { ...frame.fields[1].config, color: { mode: 'fixed', fixedColor: 'red' } };

    expect(getVisualStructureRev([frame], 1)).not.toBe(initialRev);
  });
});
