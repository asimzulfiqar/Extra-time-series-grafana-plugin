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

  let csvContent = '';

  series.forEach((dataFrame, seriesIndex) => {
    if (seriesIndex > 0) {
      csvContent += '\n\n';
    }

    if (dataFrame.name) {
      csvContent += `Series: ${dataFrame.name}\n`;
    }

    // Headers
    const headers = dataFrame.fields.map((field) => field.name || 'Unknown');
    csvContent += headers.join(',') + '\n';

    // Data rows
    const rowCount = dataFrame.length;
    for (let i = 0; i < rowCount; i++) {
      const row = dataFrame.fields.map((field) => {
        const value = field.values[i];
        if (value === null || value === undefined) {
          return '';
        }
        if (field.type === 'time') {
          return new Date(value).toISOString();
        }
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += row.join(',') + '\n';
    }
  });

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

/**
 * Export data to HTML format
 */
export const exportToHTML = (series: DataFrame[], filename: string) => {
  if (!series || series.length === 0) {
    console.warn('No data to export');
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
    .series {
      margin-bottom: 40px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h2 {
      color: #333;
      margin-top: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background: #4a5568;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:hover {
      background: #f7fafc;
    }
    .timestamp {
      font-family: monospace;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>Time Series Data Export</h1>
  <p>Exported on: ${new Date().toLocaleString()}</p>
`;

  series.forEach((dataFrame, index) => {
    htmlContent += `
  <div class="series">
    <h2>${dataFrame.name || `Series ${index + 1}`}</h2>
    <table>
      <thead>
        <tr>
`;

    dataFrame.fields.forEach((field) => {
      htmlContent += `          <th>${field.name || 'Unknown'}</th>\n`;
    });

    htmlContent += `        </tr>
      </thead>
      <tbody>
`;

    const rowCount = dataFrame.length;
    for (let i = 0; i < rowCount; i++) {
      htmlContent += '        <tr>\n';
      dataFrame.fields.forEach((field) => {
        const value = field.values[i];
        let displayValue = '';

        if (value !== null && value !== undefined) {
          if (field.type === 'time') {
            displayValue = `<span class="timestamp">${new Date(value).toLocaleString()}</span>`;
          } else {
            displayValue = String(value);
          }
        }

        htmlContent += `          <td>${displayValue}</td>\n`;
      });
      htmlContent += '        </tr>\n';
    }

    htmlContent += `      </tbody>
    </table>
  </div>
`;
  });

  htmlContent += `
</body>
</html>
`;

  downloadFile(htmlContent, `${filename}.html`, 'text/html');
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
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
