import React, { useState, useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { LegendDisplayMode } from '@grafana/schema';
import { SimpleOptions, ViewMode, ExportFormat } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2, useTheme2, Button, Modal, TimeSeries } from '@grafana/ui';
import { PanelDataErrorView } from '@grafana/runtime';
import { TableView } from './TableView';
import { exportToCSV, exportToHTML, exportToImage } from '../utils/exportUtils';

interface Props extends PanelProps<SimpleOptions> {}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
    `,
    actionBar: css`
      display: flex;
      gap: 8px;
      padding: 8px;
      flex-wrap: wrap;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      margin-bottom: 8px;
    `,
    svg: css`
      position: absolute;
      top: 40px;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
    exportMenu: css`
      position: absolute;
      margin-top: 40px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 4px;
    `,
  };
};

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, timeRange, timeZone, fieldConfig, id }) => {
  const theme = useTheme2();
  const styles = useStyles2(getStyles);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Graph);
  const [isEnlargeModalOpen, setIsEnlargeModalOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  const handleExport = async (format: ExportFormat) => {
    setExportMenuOpen(false);

    try {
      switch (format) {
        case ExportFormat.CSV:
          exportToCSV(data.series, 'timeseries-data');
          break;
        case ExportFormat.HTML:
          exportToHTML(data.series, 'timeseries-data');
          break;
        case ExportFormat.Image:
          if (contentRef.current) {
            await exportToImage(contentRef.current, 'timeseries-panel');
          }
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === ViewMode.Graph ? ViewMode.Table : ViewMode.Graph);
  };

  const renderContent = (contentWidth: number, contentHeight: number) => {
    if (viewMode === ViewMode.Table) {
      return <TableView data={data.series} width={contentWidth} height={contentHeight} theme={theme} />;
    }

    // Time series graph view
    return (
      <TimeSeries
        width={contentWidth}
        height={contentHeight - 60}
        timeRange={timeRange}
        timeZone={timeZone}
        frames={data.series}
        legend={{ displayMode: LegendDisplayMode.List, placement: 'bottom', showLegend: true, calcs: [] }}
      />
    );
  };

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
      ref={panelRef}
    >
      {/* Action Bar */}
      <div className={styles.actionBar}>
        {options.showTableViewButton && (
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleViewMode}
            icon={viewMode === ViewMode.Graph ? 'table' : 'graph-bar'}
          >
            {viewMode === ViewMode.Graph ? 'Table View' : 'Graph View'}
          </Button>
        )}

        {options.showEnlargeButton && (
          <Button size="sm" variant="secondary" onClick={() => setIsEnlargeModalOpen(true)} icon="expand-arrows">
            Enlarge
          </Button>
        )}

        {options.showExportButton && (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              icon="download-alt"
            >
              Export
            </Button>
            {exportMenuOpen && (
              <div
                className={css`
                  ${styles.exportMenu}
                  background: ${theme.colors.background.primary};
                  border: 1px solid ${theme.colors.border.weak};
                  border-radius: 4px;
                  padding: 4px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                `}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleExport(ExportFormat.CSV)}
                  icon="file-alt"
                  fullWidth
                >
                  CSV
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleExport(ExportFormat.HTML)}
                  icon="file-copy-alt"
                  fullWidth
                >
                  HTML
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleExport(ExportFormat.Image)}
                  icon="camera"
                  fullWidth
                >
                  Image
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Panel Content */}
      <div ref={contentRef}>
        {renderContent(width, height)}
      </div>

      {/* Enlarge Modal */}
      {isEnlargeModalOpen && (
        <Modal
          title="Enhanced Panel - Enlarged View"
          isOpen={isEnlargeModalOpen}
          onDismiss={() => setIsEnlargeModalOpen(false)}
        >
          <div
            className={css`
              width: 100vw;
              height: 100vh;
            `}
          >
            {renderContent(window.innerWidth, window.innerHeight - 100)}
          </div>
        </Modal>
      )}
    </div>
  );
};
