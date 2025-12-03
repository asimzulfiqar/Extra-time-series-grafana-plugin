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
  if (!data || data.length === 0) {
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
      {data.map((dataFrame, seriesIndex) => (
        <div key={seriesIndex} className={css`margin-bottom: 24px;`}>
          {dataFrame.name && (
            <div
              className={css`
                font-size: 16px;
                font-weight: 600;
                color: ${theme.colors.text.primary};
                margin: 16px;
                padding-bottom: 8px;
                border-bottom: 2px solid ${theme.colors.border.medium};
              `}
            >
              {dataFrame.name}
            </div>
          )}

          <table
            className={css`
              width: 100%;
              border-collapse: collapse;
            `}
          >
            <thead>
              <tr>
                {dataFrame.fields.map((field, fieldIndex) => (
                  <th
                    key={fieldIndex}
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
                    {field.name || 'Unknown'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: dataFrame.length }).map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={css`
                    &:hover {
                      background: ${theme.colors.background.secondary};
                    }
                  `}
                >
                  {dataFrame.fields.map((field, fieldIndex) => {
                    const value = field.values[rowIndex];
                    let displayValue = '';

                    if (value !== null && value !== undefined) {
                      if (field.type === 'time') {
                        displayValue = new Date(value).toLocaleString();
                      } else if (typeof value === 'number') {
                        displayValue = value.toFixed(2);
                      } else {
                        displayValue = String(value);
                      }
                    }

                    return (
                      <td
                        key={fieldIndex}
                        className={css`
                          padding: 10px 16px;
                          border-bottom: 1px solid ${theme.colors.border.weak};
                          color: ${field.type === 'time' ? theme.colors.text.secondary : theme.colors.text.primary};
                          font-family: ${field.type === 'time' ? theme.typography.fontFamilyMonospace : 'inherit'};
                        `}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};
