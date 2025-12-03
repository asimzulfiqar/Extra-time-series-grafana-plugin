import React from 'react';
import { DataFrame, GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';

interface Props {
  data: DataFrame[];
  width: number;
  height: number;
  theme: GrafanaTheme2;
}

export const TableView: React.FC<Props> = ({ data, width, height, theme }) => {
  if (!data || Array.isArray(data) && data.length === 0) {
    return (
      <div
        className={css`
          display: flex;
          align-items: center;
          justify-content: center;
          height: ${height}px;
          color: ${theme.colors.text.secondary};
        `}
      >
        No data available
      </div>
    );
  }

  // Find time field from first series
  const timeField = data[0].fields.find((f) => f.type === 'time');
  if (!timeField) {
    return (<div>No time field found</div>);
  }

  // Build columns: Time, then each series value field
  const columns: Array<{ header: string; getValue: (row: number) => any }> = [];
  columns.push({
    header: 'Time',
    getValue: (row) => {
      const value = timeField.values[row];
      return value ? new Date(value).toLocaleString() : '';
    },
  });
  data.forEach((dataFrame) => {
    const valueFields = dataFrame.fields.filter((f) => f.type !== 'time');
    valueFields.forEach((field) => {
      columns.push({
        header: `${dataFrame.name || 'Series'} - ${field.name || 'Value'}`,
        getValue: (row) => {
          const value = field.values[row];
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'number') {
            return value.toFixed(2);
          }
          return String(value);
        },
      });
    });
  });

  const rowCount = timeField.values.length;

  return (
    <div
      className={css`
        overflow: auto;
        height: ${height}px;
        background: ${theme.colors.background.primary};
        border: 1px solid ${theme.colors.border.weak};
        border-radius: 4px;
      `}
    >
      <table
        className={css`
          width: 100%;
          border-collapse: collapse;
        `}
      >
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={css`
                  background: ${theme.colors.background.secondary};
                  color: ${theme.colors.text.primary};
                  padding: 12px 16px;
                  text-align: left;
                  font-weight: 600;
                  border-bottom: 2px solid ${theme.colors.border.medium};
                  position: sticky;
                  top: 0;
                `}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className={css`
                &:hover {
                  background: ${theme.colors.background.secondary};
                }
              `}
            >
              {columns.map((col, i) => (
                <td
                  key={i}
                  className={css`
                    padding: 10px 16px;
                    border-bottom: 1px solid ${theme.colors.border.weak};
                    color: ${i === 0 ? theme.colors.text.secondary : theme.colors.text.primary};
                    font-family: ${i === 0 ? theme.typography.fontFamilyMonospace : 'inherit'};
                  `}
                >
                  {col.getValue(rowIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
