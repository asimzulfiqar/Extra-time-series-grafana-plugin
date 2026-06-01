import React, { useRef, useState } from 'react';
import { css, cx } from '@emotion/css';
import { DashboardCursorSync, PanelProps } from '@grafana/data';
import { PanelDataErrorView, locationService } from '@grafana/runtime';
import { LegendDisplayMode, SortOrder, TooltipDisplayMode } from '@grafana/schema';
import {
  Button,
  EventBusPlugin,
  KeyboardPlugin,
  TimeSeries,
  TooltipPlugin2,
  usePanelContext,
  useStyles2,
  useTheme2,
} from '@grafana/ui';
import { ExportFormat, SimpleOptions, ViewMode } from 'types';
import { exportToCSV, exportToHTML, exportToImage } from '../utils/exportUtils';
import { AnnotationRange, AnnotationsPlugin } from './AnnotationsPlugin';
import { NativeTooltip } from './NativeTooltip';
import { TableView } from './TableView';

interface Props extends PanelProps<SimpleOptions> {}

const TOOLBAR_HEIGHT = 48;

const getStyles = () => ({
  wrapper: css`
    font-family: Open Sans;
    position: relative;
  `,
  actionBar: css`
    display: flex;
    gap: 8px;
    padding: 4px 8px;
    min-height: ${TOOLBAR_HEIGHT}px;
    align-items: center;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  `,
  exportAnchor: css`
    position: relative;
  `,
  exportMenu: css`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 1000;
    display: flex;
    min-width: 120px;
    flex-direction: column;
    gap: 4px;
  `,
});

export const SimplePanel: React.FC<Props> = ({
  options,
  data,
  width,
  height,
  timeRange,
  timeZone,
  fieldConfig,
  id,
  onChangeTimeRange,
}) => {
  const theme = useTheme2();
  const styles = useStyles2(getStyles);
  const contentRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Graph);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [newAnnotationRange, setNewAnnotationRange] = useState<AnnotationRange | null>(null);
  const { canAddAnnotations, eventBus, eventsScope, sync } = usePanelContext();
  const cursorSync = sync?.() ?? DashboardCursorSync.Off;
  const canCreateAnnotations = Boolean(canAddAnnotations?.());

  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsTimeField needsNumberField />;
  }

  const handleExport = async (format: ExportFormat) => {
    setExportMenuOpen(false);

    if (format === ExportFormat.CSV) {
      exportToCSV(data.series, 'timeseries-data');
    } else if (format === ExportFormat.HTML) {
      exportToHTML(data.series, 'timeseries-data');
    } else if (contentRef.current) {
      await exportToImage(contentRef.current, 'timeseries-panel', theme.colors.background.primary);
    }
  };

  const handleEnlarge = () => {
    const location = locationService.getLocation();
    const dashboardMatch = location.pathname.match(/^(.*?)\/d\/([^/?]+)/);
    if (!dashboardMatch) {
      return;
    }

    const params = new URLSearchParams(location.search);
    params.set('viewPanel', id.toString());
    window.open(`${dashboardMatch[1]}/d/${dashboardMatch[2]}?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  const graphHeight = Math.max(0, height - TOOLBAR_HEIGHT);

  const renderGraph = () => (
    <TimeSeries
      width={width}
      height={graphHeight}
      timeRange={timeRange}
      timeZone={timeZone}
      frames={data.series}
      structureRev={data.structureRev}
      legend={{
        displayMode: options.legend?.displayMode || LegendDisplayMode.List,
        placement: options.legend?.placement || 'bottom',
        showLegend: options.legend?.showLegend ?? true,
        calcs: options.legend?.calcs || [],
        width: options.legend?.width,
      }}
      options={options}
    >
      {(config, alignedFrame) => (
        <>
          <KeyboardPlugin config={config} />
          {cursorSync !== DashboardCursorSync.Off && (
            <EventBusPlugin config={config} eventBus={eventBus} frame={alignedFrame} />
          )}
          {options.tooltip?.mode !== TooltipDisplayMode.None && (
            <TooltipPlugin2
              config={config}
              hoverMode={options.tooltip?.mode === TooltipDisplayMode.Multi ? 1 : 0}
              queryZoom={onChangeTimeRange}
              clientZoom
              syncMode={cursorSync}
              syncScope={eventsScope}
              render={(plot, dataIdxs, seriesIdx, isPinned, dismiss, selectedRange) => {
                if (canCreateAnnotations && selectedRange) {
                  setNewAnnotationRange(selectedRange);
                  dismiss();
                  return null;
                }

                return (
                  <NativeTooltip
                    frame={alignedFrame}
                    dataIdxs={dataIdxs}
                    seriesIdx={seriesIdx}
                    mode={options.tooltip?.mode || TooltipDisplayMode.Single}
                    sortOrder={options.tooltip?.sort || SortOrder.None}
                    onAddAnnotation={
                      canCreateAnnotations && isPinned
                        ? () => {
                            const time = plot.posToVal(plot.cursor.left!, 'x');
                            setNewAnnotationRange({ from: time, to: time });
                            dismiss();
                          }
                        : undefined
                    }
                  />
                );
              }}
              maxWidth={options.tooltip?.maxWidth}
            />
          )}
          <AnnotationsPlugin
            annotations={data.annotations ?? []}
            config={config}
            newRange={newAnnotationRange}
            onDismiss={() => setNewAnnotationRange(null)}
            timeZone={timeZone}
          />
        </>
      )}
    </TimeSeries>
  );

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <div className={styles.actionBar}>
        {options.showTableViewButton && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setViewMode(viewMode === ViewMode.Graph ? ViewMode.Table : ViewMode.Graph)}
            icon={viewMode === ViewMode.Graph ? 'table' : 'graph-bar'}
          >
            {viewMode === ViewMode.Graph ? 'Table View' : 'Graph View'}
          </Button>
        )}
        {options.showEnlargeButton && (
          <Button size="sm" variant="secondary" icon="expand-arrows" onClick={handleEnlarge}>
            Enlarge
          </Button>
        )}
        {options.showExportButton && (
          <div className={styles.exportAnchor}>
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
                  box-shadow: ${theme.shadows.z2};
                `}
              >
                <Button size="sm" variant="secondary" onClick={() => handleExport(ExportFormat.CSV)} icon="file-alt">
                  CSV
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleExport(ExportFormat.HTML)}
                  icon="file-copy-alt"
                >
                  HTML
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleExport(ExportFormat.Image)} icon="camera">
                  Image
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <div
        ref={contentRef}
        className={css`
          background: ${theme.colors.background.primary};
        `}
      >
        {viewMode === ViewMode.Graph ? (
          renderGraph()
        ) : (
          <TableView data={data.series} width={width} height={graphHeight} theme={theme} />
        )}
      </div>
    </div>
  );
};
