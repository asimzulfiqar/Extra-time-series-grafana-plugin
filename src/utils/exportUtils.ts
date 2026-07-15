import { DataFrame, getFieldDisplayName } from '@grafana/data';
import html2canvas from 'html2canvas';

const escapeCSVValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value);

  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

const escapeHTML = (value: unknown): string => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (series: DataFrame[], filename: string) => {
  if (!series || series.length === 0) {
    return;
  }

  // Find time field and value fields across all series
  const timeField = series[0].fields.find((f) => f.type === 'time');
  if (!timeField) {
    return;
  }

  let csvContent = escapeCSVValue('Time');
  series.forEach((dataFrame) => {
    const valueFields = dataFrame.fields.filter((f) => f.type !== 'time');
    valueFields.forEach((field) => {
      csvContent += `,${escapeCSVValue(getFieldDisplayName(field, dataFrame, series))}`;
    });
  });
  csvContent += '\n';

  // Build rows: for each timestamp, show all series values
  const rowCount = timeField.values.length;
  for (let i = 0; i < rowCount; i++) {
    const timestamp = timeField.values[i];
    csvContent += new Date(timestamp).toISOString();

    series.forEach((dataFrame) => {
      const valueFields = dataFrame.fields.filter((f) => f.type !== 'time');
      valueFields.forEach((field) => {
        csvContent += `,${escapeCSVValue(field.values[i])}`;
      });
    });

    csvContent += '\n';
  }

  // Open CSV in new tab
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Export data to HTML format
 */
export const exportToHTML = (series: DataFrame[], filename: string) => {
  if (!series || series.length === 0) {
    return;
  }

  // Find time field
  const timeField = series[0].fields.find((f) => f.type === 'time');
  if (!timeField) {
    return;
  }

  let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-top: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #4a5568;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-right: 1px solid #2d3748;
    }
    th:last-child {
      border-right: none;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
    }
    td:last-child {
      border-right: none;
    }
    tr:hover {
      background: #f7fafc;
    }
    .timestamp {
      font-family: monospace;
      color: #666;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Time Series Data Export</h1>
    <p>Exported on: ${new Date().toLocaleString()}</p>
    <table>
      <thead>
        <tr>
          <th>Time</th>
`;

  // Build headers for all series
  series.forEach((dataFrame) => {
    const valueFields = dataFrame.fields.filter((f) => f.type !== 'time');
    valueFields.forEach((field) => {
      htmlContent += `          <th>${escapeHTML(getFieldDisplayName(field, dataFrame, series))}</th>\n`;
    });
  });

  htmlContent += `        </tr>
      </thead>
      <tbody>
`;

  // Build rows: for each timestamp, show all series values
  const rowCount = timeField.values.length;
  for (let i = 0; i < rowCount; i++) {
    const timestamp = timeField.values[i];
    htmlContent += `        <tr>\n`;
    htmlContent += `          <td><span class="timestamp">${new Date(timestamp).toLocaleString()}</span></td>\n`;

    series.forEach((dataFrame) => {
      const valueFields = dataFrame.fields.filter((f) => f.type !== 'time');
      valueFields.forEach((field) => {
        const value = field.values[i];
        htmlContent += `          <td>${escapeHTML(value)}</td>\n`;
      });
    });

    htmlContent += `        </tr>\n`;
  }

  htmlContent += `      </tbody>
    </table>
  </div>
</body>
</html>
`;

  // Open HTML in new tab
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Export panel as image
 */
export const exportToImage = async (element: HTMLElement, filename: string, backgroundColor = '#ffffff') => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale: 2,
      logging: false,
      useCORS: true,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  } catch (error) {
    throw error;
  }
};

