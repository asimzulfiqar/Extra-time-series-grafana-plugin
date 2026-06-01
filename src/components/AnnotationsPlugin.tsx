import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { css } from '@emotion/css';
import { AnnotationEventUIModel, DataFrame, dateTimeFormat } from '@grafana/data';
import { TimeZone } from '@grafana/schema';
import { Button, Field, Input, Modal, Stack, TextArea, UPlotConfigBuilder, usePanelContext, useTheme2 } from '@grafana/ui';
import { createPortal } from 'react-dom';
import { AnnotationDisplayMode } from 'types';
import uPlot from 'uplot';

export interface AnnotationRange {
  from: number;
  to: number;
}

interface Props {
  annotations: DataFrame[];
  config: UPlotConfigBuilder;
  displayMode: AnnotationDisplayMode;
  newRange: AnnotationRange | null;
  onDismiss: () => void;
  timeZone: TimeZone;
}

const getValues = (frame: DataFrame) => {
  const values: Record<string, any[]> = {};
  frame.fields.forEach((field) => {
    values[field.name] = field.values;
  });
  return values;
};

export const AnnotationsPlugin = ({ annotations, config, displayMode, newRange, onDismiss, timeZone }: Props) => {
  const { onAnnotationCreate } = usePanelContext();
  const theme = useTheme2();
  const plotRef = useRef<uPlot>();
  const annotationsRef = useRef(annotations);
  const displayModeRef = useRef(displayMode);
  const [plot, setPlot] = useState<uPlot>();
  const [, setRenderRevision] = useState(0);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string>();
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  useEffect(() => {
    displayModeRef.current = displayMode;
    plotRef.current?.redraw();
  }, [displayMode]);

  useLayoutEffect(() => {
    config.addHook('init', (plot) => {
      plotRef.current = plot;
      setPlot(plot);
    });

    config.addHook('draw', (plot) => {
      setRenderRevision((revision) => revision + 1);
      const context = plot.ctx;
      context.save();
      context.beginPath();
      context.rect(plot.bbox.left, plot.bbox.top, plot.bbox.width, plot.bbox.height);
      context.clip();
      context.lineWidth = 2;
      context.setLineDash([5, 5]);

      annotationsRef.current.forEach((frame) => {
        if (frame.name === 'exemplar') {
          return;
        }

        const values = getValues(frame);
        (values.time ?? []).forEach((time, index) => {
          const start = plot.valToPos(time, 'x', true);
          const color = values.color?.[index] || '#ff780a';
          if (displayModeRef.current === AnnotationDisplayMode.Line) {
            context.strokeStyle = color;
            context.beginPath();
            context.moveTo(start, plot.bbox.top);
            context.lineTo(start, plot.bbox.top + plot.bbox.height);
            context.stroke();
          }

          if (values.isRegion?.[index] && values.timeEnd?.[index] != null) {
            const end = plot.valToPos(values.timeEnd[index], 'x', true);
            context.globalAlpha = 0.12;
            context.fillStyle = color;
            context.fillRect(start, plot.bbox.top, end - start, plot.bbox.height);
            context.globalAlpha = 1;
          }
        });
      });

      context.restore();
    });
  }, [config]);

  useLayoutEffect(() => {
    plotRef.current?.redraw();
  }, [annotations]);

  const save = () => {
    if (!newRange || !onAnnotationCreate) {
      return;
    }

    const annotation: AnnotationEventUIModel = {
      from: Math.round(newRange.from),
      to: Math.round(newRange.to),
      description: description.trim(),
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    onAnnotationCreate(annotation);
    setDescription('');
    setTags('');
    onDismiss();
  };

  const markers =
    plot &&
    annotations.flatMap((frame, frameIndex) => {
      if (frame.name === 'exemplar') {
        return [];
      }

      const values = getValues(frame);
      return (values.time ?? []).map((time, index) => {
        const id = `${frameIndex}-${index}`;
        const text = values.text?.[index] || values.description?.[index] || 'Annotation';
        const tags = values.tags?.[index];
        const tagsText = Array.isArray(tags) ? tags.join(', ') : tags;
        const left = plot.valToPos(time, 'x');
        const color = values.color?.[index] || '#ff780a';
        const showDetails = hoveredAnnotation === id;

        return (
          <div
            key={id}
            className={css`
              position: absolute;
              top: 0;
              bottom: 0;
              left: ${left}px;
              width: ${displayMode === AnnotationDisplayMode.Line ? '10px' : 'auto'};
              transform: translateX(-50%);
              z-index: 5;
              pointer-events: auto;
            `}
            onMouseEnter={() => setHoveredAnnotation(id)}
            onMouseLeave={() => setHoveredAnnotation(undefined)}
          >
            {displayMode === AnnotationDisplayMode.Text && (
              <div
                className={css`
                  max-width: 180px;
                  overflow: hidden;
                  padding: 2px 5px;
                  border-left: 3px solid ${color};
                  border-radius: 2px;
                  background: ${theme.colors.background.primary};
                  color: ${theme.colors.text.primary};
                  font-size: 11px;
                  line-height: 16px;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  box-shadow: ${theme.shadows.z1};
                `}
              >
                {text}
              </div>
            )}
            {showDetails && (
              <div
                className={css`
                  position: absolute;
                  top: ${displayMode === AnnotationDisplayMode.Text ? '24px' : '6px'};
                  left: 6px;
                  width: max-content;
                  max-width: 260px;
                  padding: 6px 8px;
                  border: 1px solid ${theme.colors.border.weak};
                  border-radius: 3px;
                  background: ${theme.colors.background.primary};
                  color: ${theme.colors.text.primary};
                  font-size: 12px;
                  line-height: 16px;
                  box-shadow: ${theme.shadows.z2};
                `}
              >
                <strong>{text}</strong>
                <div>{dateTimeFormat(time, { timeZone })}</div>
                {tagsText && <div>Tags: {tagsText}</div>}
              </div>
            )}
          </div>
        );
      });
    });

  return (
    <>
      {plot && createPortal(markers, plot.over)}
      {newRange && onAnnotationCreate && (
        <Modal title="Add annotation" isOpen onDismiss={onDismiss}>
          <div
            className={css`
              min-width: 420px;
            `}
          >
            <p>
              {dateTimeFormat(newRange.from, { timeZone })} - {dateTimeFormat(newRange.to, { timeZone })}
            </p>
            <Field label="Description">
              <TextArea value={description} onChange={(event) => setDescription(event.currentTarget.value)} autoFocus />
            </Field>
            <Field label="Tags" description="Comma-separated tags">
              <Input value={tags} onChange={(event) => setTags(event.currentTarget.value)} />
            </Field>
            <Stack justifyContent="flex-end">
              <Button variant="secondary" onClick={onDismiss}>
                Cancel
              </Button>
              <Button onClick={save} disabled={!description.trim()}>
                Save
              </Button>
            </Stack>
          </div>
        </Modal>
      )}
    </>
  );
};
