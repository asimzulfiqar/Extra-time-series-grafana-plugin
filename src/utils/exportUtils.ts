import { DataFrame } from '@grafana/data';
import html2canvas from 'html2canvas';

/**
 * Export data to CSV format
 */
export const exportToCSV = (series: DataFrame[], filename: string) => {
  if (!series || series.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Find time field and value fields across all series
  const timeField = series[0].fields.find((f) => f.type === 'time');
  if (!timeField) {
    console.warn('No time field found');
    return;
  }

  // Build headers: Time, Series1, Series2, etc.
  let csvContent = 'Time';
  series.forEach((dataFrame) => {
    const valueFields = dataFrame.fields.filter((f) => f.type !== 'time');
    valueFields.forEach((field) => {
      const seriesName = dataFrame.name || 'Series';
      const fieldName = field.name || 'Value';
      csvContent += `,${seriesName} - ${fieldName}`;
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
        const value = field.values[i];
        if (value === null || value === undefined) {
          csvContent += ',';
        } else if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          csvContent += `,"${value.replace(/"/g, '""')}"`;
        } else {
          csvContent += `,${value}`;
        }
      });
    });

    csvContent += '\n';
  }

  // Open CSV in new tab
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

/**
 * Export data to HTML format
 */
export const exportToHTML = (series: DataFrame[], filename: string) => {
  if (!series || series.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Find time field
  const timeField = series[0].fields.find((f) => f.type === 'time');
  if (!timeField) {
    console.warn('No time field found');
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
      const seriesName = dataFrame.name || 'Series';
      const fieldName = field.name || 'Value';
      htmlContent += `          <th>${seriesName} - ${fieldName}</th>\n`;
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
        const displayValue = value !== null && value !== undefined ? String(value) : '';
        htmlContent += `          <td>${displayValue}</td>\n`;
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
  window.open(url, '_blank');
};

/**
 * Export panel as image
 */
export const exportToImage = async (element: HTMLElement, filename: string) => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    });
  } catch (error) {
    console.error('Failed to export image:', error);
    throw error;
  }
};

/**
 * Helper function to download a file
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  
  // Cleanup immediately after click
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};
