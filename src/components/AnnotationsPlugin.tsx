import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { css } from '@emotion/css';
import { AnnotationEventUIModel, DataFrame, dateTimeFormat } from '@grafana/data';
import { TimeZone } from '@grafana/schema';
import { Button, Field, Input, Modal, Stack, TextArea, UPlotConfigBuilder, usePanelContext } from '@grafana/ui';
import uPlot from 'uplot';

export interface AnnotationRange {
  from: number;
  to: number;
}

interface Props {
  annotations: DataFrame[];
  config: UPlotConfigBuilder;
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

export const AnnotationsPlugin = ({ annotations, config, newRange, onDismiss, timeZone }: Props) => {
  const { onAnnotationCreate } = usePanelContext();
  const plotRef = useRef<uPlot>();
  const annotationsRef = useRef(annotations);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  useLayoutEffect(() => {
    config.addHook('init', (plot) => {
      plotRef.current = plot;
    });

    config.addHook('draw', (plot) => {
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
          context.strokeStyle = color;
          context.beginPath();
          context.moveTo(start, plot.bbox.top);
          context.lineTo(start, plot.bbox.top + plot.bbox.height);
          context.stroke();

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

  if (!newRange || !onAnnotationCreate) {
    return null;
  }

  const save = () => {
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

  return (
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
  );
};
