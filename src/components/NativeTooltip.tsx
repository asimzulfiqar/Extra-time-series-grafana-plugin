import React from 'react';
import { DataFrame, FieldType, formattedValueToString, getFieldDisplayName, getValueFormat } from '@grafana/data';
import { SortOrder, TooltipDisplayMode } from '@grafana/schema';
import { Button, SeriesTable } from '@grafana/ui';
import { DerivedTooltipValue } from 'types';

interface Props {
  frame: DataFrame;
  dataIdxs: Array<number | null>;
  seriesIdx: number | null;
  mode: TooltipDisplayMode;
  sortOrder: SortOrder;
  derivedTooltipValues: Array<DerivedTooltipValue | string>;
  onAddAnnotation?: () => void;
}

interface TooltipRow {
  color?: string;
  label: string;
  value: string;
  isActive: boolean;
  numeric?: number;
}

const normalizeDerivedTooltipValue = (entry: DerivedTooltipValue | string): DerivedTooltipValue | undefined => {
  if (typeof entry !== 'string') {
    return entry.name && entry.formula ? entry : undefined;
  }

  const [name, formula, unit] = entry.split('|').map((part) => part.trim());

  if (!name || !formula) {
    return undefined;
  }

  return { name, formula, unit };
};

const evaluateDerivedFormula = (formula: string, variables: Map<string, number>): number | undefined => {
  let index = 0;
  const normalizedFormula = formula.trim();

  const skipWhitespace = () => {
    while (/\s/.test(normalizedFormula[index] ?? '')) {
      index++;
    }
  };

  const parseNumber = () => {
    skipWhitespace();
    const match = normalizedFormula.slice(index).match(/^\d+(?:\.\d+)?(?:e[+-]?\d+)?/i);
    if (!match) {
      return undefined;
    }

    index += match[0].length;
    return Number(match[0]);
  };

  const parseVariable = () => {
    skipWhitespace();

    if (normalizedFormula[index] === '[') {
      const end = normalizedFormula.indexOf(']', index + 1);
      if (end === -1) {
        return undefined;
      }

      const name = normalizedFormula.slice(index + 1, end).trim();
      index = end + 1;
      return variables.get(name) ?? variables.get(name.toLowerCase());
    }

    const match = normalizedFormula.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (!match) {
      return undefined;
    }

    index += match[0].length;
    return variables.get(match[0]) ?? variables.get(match[0].toLowerCase());
  };

  const parseFactor = (): number | undefined => {
    skipWhitespace();

    if (normalizedFormula[index] === '+') {
      index++;
      return parseFactor();
    }

    if (normalizedFormula[index] === '-') {
      index++;
      const result = parseFactor();
      return result == null ? undefined : -result;
    }

    if (normalizedFormula[index] === '(') {
      index++;
      const result = parseExpression();
      skipWhitespace();
      if (normalizedFormula[index] !== ')') {
        return undefined;
      }
      index++;
      return result;
    }

    return parseNumber() ?? parseVariable();
  };

  const parseTerm = (): number | undefined => {
    let result = parseFactor();
    if (result == null) {
      return undefined;
    }

    while (true) {
      skipWhitespace();
      const operator = normalizedFormula[index];
      if (operator !== '*' && operator !== '/') {
        return result;
      }

      index++;
      const right = parseFactor();
      if (right == null || (operator === '/' && right === 0)) {
        return undefined;
      }

      result = operator === '*' ? result * right : result / right;
    }
  };

  function parseExpression(): number | undefined {
    let result = parseTerm();
    if (result == null) {
      return undefined;
    }

    while (true) {
      skipWhitespace();
      const operator = normalizedFormula[index];
      if (operator !== '+' && operator !== '-') {
        return result;
      }

      index++;
      const right = parseTerm();
      if (right == null) {
        return undefined;
      }

      result = operator === '+' ? result + right : result - right;
    }
  }

  const result = parseExpression();
  skipWhitespace();

  return result != null && index === normalizedFormula.length && Number.isFinite(result) ? result : undefined;
};

const formatDerivedValue = (value: number, unit?: string) => {
  if (!unit) {
    return value.toLocaleString();
  }

  const valueFormat = getValueFormat(unit);
  const formatted = valueFormat(value);
  const formattedValue = formattedValueToString(formatted);

  return formattedValue === value.toString() ? `${value.toLocaleString()} ${unit}` : formattedValue;
};

const setVariable = (variables: Map<string, number>, name: string, value: number) => {
  if (!name || variables.has(name)) {
    return;
  }

  variables.set(name, value);
  variables.set(name.toLowerCase(), value);
};

export const NativeTooltip = ({
  frame,
  dataIdxs,
  seriesIdx,
  mode,
  sortOrder,
  derivedTooltipValues,
  onAddAnnotation,
}: Props) => {
  const timeField = frame.fields[0];
  const timeIndex = dataIdxs[0];
  const timestamp = timeIndex == null ? undefined : formattedValueToString(timeField.display!(timeField.values[timeIndex]));

  const rows: TooltipRow[] = frame.fields
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

  const derivedConfigs = derivedTooltipValues.map(normalizeDerivedTooltipValue).filter((config) => config != null);
  const visibleNumericFields = frame.fields.filter((field, fieldIndex) => {
    const dataIndex = dataIdxs[fieldIndex];
    return fieldIndex !== 0 && field.type === FieldType.number && dataIndex != null;
  });
  const queryVariables = new Map<string, number>();

  visibleNumericFields.forEach((field) => {
    const fieldIndex = frame.fields.indexOf(field);
    const dataIndex = dataIdxs[fieldIndex];
    if (dataIndex == null) {
      return;
    }

    const numeric = field.display!(field.values[dataIndex]).numeric;
    if (!Number.isFinite(numeric)) {
      return;
    }

    setVariable(queryVariables, field.name, numeric);
    setVariable(queryVariables, getFieldDisplayName(field, frame), numeric);
  });

  visibleNumericFields.forEach((field) => {
    const fieldIndex = frame.fields.indexOf(field);
    const dataIndex = dataIdxs[fieldIndex];
    if (dataIndex == null || (mode !== TooltipDisplayMode.Multi && fieldIndex !== seriesIdx)) {
      return;
    }

    const baseDisplay = field.display!(field.values[dataIndex]);
    const baseValue = baseDisplay.numeric;
    if (!Number.isFinite(baseValue)) {
      return;
    }

    derivedConfigs.forEach((config) => {
      const variables = new Map(queryVariables);
      setVariable(variables, 'value', baseValue);
      setVariable(variables, 'v', baseValue);

      const derivedValue = evaluateDerivedFormula(config.formula, variables);
      if (derivedValue == null) {
        return;
      }

      rows.push({
        color: baseDisplay.color,
        label:
          visibleNumericFields.length === 1
            ? config.name
            : `${getFieldDisplayName(field, frame)} ${config.name}`,
        value: formatDerivedValue(derivedValue, config.unit),
        isActive: fieldIndex === seriesIdx,
        numeric: derivedValue,
      });
    });
  });

  if (sortOrder !== SortOrder.None) {
    const direction = sortOrder === SortOrder.Ascending ? 1 : -1;
    rows.sort((a, b) => direction * ((a.numeric ?? 0) - (b.numeric ?? 0)));
  }

  return (
    <>
      <SeriesTable timestamp={timestamp} series={rows} />
      {onAddAnnotation && (
        <Button icon="comment-alt" variant="secondary" size="sm" onClick={onAddAnnotation}>
          Add annotation
        </Button>
      )}
    </>
  );
};
