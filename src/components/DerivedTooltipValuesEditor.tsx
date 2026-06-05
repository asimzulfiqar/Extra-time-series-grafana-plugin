import React from 'react';
import { css } from '@emotion/css';
import { StandardEditorProps } from '@grafana/data';
import { Button, Field, IconButton, Input, Stack } from '@grafana/ui';
import { DerivedTooltipValue } from 'types';

const getEmptyDerivedTooltipValue = (): DerivedTooltipValue => ({
  name: '',
  formula: '',
  unit: '',
});

const getStyles = () => ({
  wrapper: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  item: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    border: 1px solid rgba(204, 204, 220, 0.2);
    border-radius: 4px;
  `,
  row: css`
    display: grid;
    grid-template-columns: 1fr 1.4fr 0.6fr auto;
    gap: 8px;
    align-items: end;
  `,
});

export const DerivedTooltipValuesEditor = ({
  value,
  onChange,
}: StandardEditorProps<DerivedTooltipValue[] | string[]>) => {
  const styles = getStyles();
  const derivedValues = (value ?? []).map((item) => {
    if (typeof item !== 'string') {
      return item;
    }

    const [name, formula, unit] = item.split('|').map((part) => part.trim());
    return { name: name ?? '', formula: formula ?? '', unit: unit ?? '' };
  });

  const updateItem = (index: number, patch: Partial<DerivedTooltipValue>) => {
    onChange(derivedValues.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index: number) => {
    onChange(derivedValues.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className={styles.wrapper}>
      {derivedValues.map((item, index) => (
        <div className={styles.item} key={index}>
          <div className={styles.row}>
            <Field label="Name" noMargin>
              <Input value={item.name} onChange={(event) => updateItem(index, { name: event.currentTarget.value })} />
            </Field>
            <Field label="Formula" noMargin>
              <Input
                value={item.formula}
                placeholder="value + 273.15"
                onChange={(event) => updateItem(index, { formula: event.currentTarget.value })}
              />
            </Field>
            <Field label="Unit" noMargin>
              <Input
                value={item.unit ?? ''}
                placeholder="K"
                onChange={(event) => updateItem(index, { unit: event.currentTarget.value })}
              />
            </Field>
            <IconButton
              name="trash-alt"
              variant="destructive"
              aria-label="Remove derived tooltip value"
              onClick={() => removeItem(index)}
            />
          </div>
        </div>
      ))}
      <Stack>
        <Button icon="plus" variant="secondary" size="sm" onClick={() => onChange([...derivedValues, getEmptyDerivedTooltipValue()])}>
          Add value
        </Button>
      </Stack>
    </div>
  );
};
