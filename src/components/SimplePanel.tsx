import React, { useState, useRef, useEffect } from 'react';
import { PanelProps } from '@grafana/data';
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

export const SimplePanel: React.FC<Props> = ({ 
  options, 
  data, 
  width, 
  height, 
  timeRange, 
  timeZone, 
  fieldConfig, 
  id,
}) => {
  const theme = useTheme2();
  const styles = useStyles2(getStyles);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Graph);
  const [isEnlargeModalOpen, setIsEnlargeModalOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [currentTimeRange, setCurrentTimeRange] = useState(timeRange);
  const [currentTimeZone, setCurrentTimeZone] = useState(timeZone);

  // Update current time range and timezone whenever props change
  useEffect(() => {
    setCurrentTimeRange(timeRange);
    setCurrentTimeZone(timeZone);
  }, [timeRange, timeZone]);

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

  const handleEnlarge = () => {
    // Get the base path from the current URL by finding everything before /d/
    const currentPath = window.location.pathname;
    const dashboardMatch = currentPath.match(/^(.*?)\/d\//);
    const basePath = dashboardMatch ? dashboardMatch[1] : '';

    // Get dashboard UID from the current URL
    const dashboardMatch2 = currentPath.match(/\/d\/([^/?]+)/);
    const dashboardUID = dashboardMatch2 ? dashboardMatch2[1] : '';

    // Get current time range parameters from the URL to preserve the same format
    const urlParams = new URLSearchParams(window.location.search);
    const currentFrom = urlParams.get('from');
    const currentTo = urlParams.get('to');
    
    // Use current URL parameters if available, otherwise use the timeRange object
    const from = currentFrom || (typeof currentTimeRange.from === 'object' 
      ? currentTimeRange.from.valueOf() 
      : currentTimeRange.from);
    const to = currentTo || (typeof currentTimeRange.to === 'object' 
      ? currentTimeRange.to.valueOf() 
      : currentTimeRange.to);

    // Build the full dashboard URL with current time range and panel ID
    const dashboardUrl = `${basePath}/d/${dashboardUID}?orgId=1&from=${encodeURIComponent(from.toString())}&to=${encodeURIComponent(to.toString())}&timezone=${encodeURIComponent(currentTimeZone)}&viewPanel=${id}`;
    
    window.open(dashboardUrl, '_blank');
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === ViewMode.Graph ? ViewMode.Table : ViewMode.Graph);
  };

  const renderContent = (contentWidth: number, contentHeight: number) => {
    if (viewMode === ViewMode.Table) {
      return <TableView data={data.series} width={contentWidth} height={contentHeight} theme={theme} />;
    }

    // Time series graph view - pass all props to TimeSeries for full native functionality
    return (
      <TimeSeries
        width={contentWidth}
        height={contentHeight - 60}
        timeRange={timeRange}
        timeZone={timeZone}
        frames={data.series}
        legend={{ displayMode: 'list' as any, placement: 'bottom', showLegend: true, calcs: [] }}
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
          <Button
            size="sm"
            variant="secondary"
            icon="expand-arrows"
            onClick={handleEnlarge}
          >
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

      {/* Enlarge Modal - fullscreen, no action bar, close button */}
      {isEnlargeModalOpen && (
        <Modal
          title=""
          isOpen={isEnlargeModalOpen}
          onDismiss={() => setIsEnlargeModalOpen(false)}
        >
          <div
            className={css`
              width: 100vw;
              height: 100vh;
              background: ${theme.colors.background.primary};
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            <Button
              size="md"
              variant="destructive"
              icon="times"
              className={css`
                position: absolute;
                top: 24px;
                right: 32px;
                z-index: 10;
              `}
              onClick={() => setIsEnlargeModalOpen(false)}
            >
              Close
            </Button>
            <div
              className={css`
                width: 90vw;
                height: 85vh;
                display: flex;
                align-items: center;
                justify-content: center;
              `}
            >
              {renderContent(window.innerWidth * 0.9, window.innerHeight * 0.85)}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
