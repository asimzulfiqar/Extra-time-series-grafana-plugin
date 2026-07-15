import { DataFrame, Field, FieldType } from '@grafana/data';

export const isFieldHiddenFromViz = (field: Field): boolean => {
  return Boolean(field.state?.hideFrom?.viz || field.config.custom?.hideFrom?.viz);
};

export const isFieldHiddenFromTable = (field: Field): boolean => {
  return Boolean(field.config.custom?.hideFromTable);
};

const getTimeSeriesFrames = (frames: DataFrame[], keepValueField: (field: Field) => boolean): DataFrame[] => {
  return frames.reduce<DataFrame[]>((visibleFrames, frame) => {
    const timeField = frame.fields?.find((field) => field?.type === FieldType.time);
    const rowCount = timeField?.values.length ?? 0;

    if (rowCount === 0) {
      return visibleFrames;
    }

    const visibleValueFields = frame.fields.filter(
      (field) => field?.type === FieldType.number && field.values.length === rowCount && keepValueField(field)
    );

    if (visibleValueFields.length === 0 || !timeField) {
      return visibleFrames;
    }

    visibleFrames.push({
      ...frame,
      fields: [timeField, ...visibleValueFields],
      length: rowCount,
    });

    return visibleFrames;
  }, []);
};

export const getVisibleTimeSeriesFrames = (frames: DataFrame[]): DataFrame[] => {
  return getTimeSeriesFrames(frames, (field) => !isFieldHiddenFromViz(field));
};

export const getTableTimeSeriesFrames = (frames: DataFrame[]): DataFrame[] => {
  return getTimeSeriesFrames(frames, (field) => !isFieldHiddenFromTable(field));
};

export const getPlottableTimeSeriesFrames = getVisibleTimeSeriesFrames;

const hashString = (value: string): number => {
  let hash = 0;

  for (let index = 0; index < value.length; index++) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash) || 1;
};

export const getVisualStructureRev = (frames: DataFrame[], structureRev?: number): number => {
  const visualConfig = frames.map((frame) => ({
    name: frame.name,
    fields: frame.fields.map((field) => ({
      name: field.name,
      type: field.type,
      config: field.config,
      hideFrom: field.state?.hideFrom,
    })),
  }));

  return hashString(`${structureRev ?? 0}:${JSON.stringify(visualConfig)}`);
};
