import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel)
  .useFieldConfig({
    useCustomConfig: (builder) => {
      builder.addSliderInput({
        path: 'lineWidth',
        name: 'Line width',
        defaultValue: 1,
        settings: {
          min: 0,
          max: 10,
          step: 1,
        },
      })
      .addSliderInput({
        path: 'fillOpacity',
        name: 'Fill opacity',
        defaultValue: 0,
        settings: {
          min: 0,
          max: 100,
          step: 1,
        },
      });
    },
  })
  .setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: 'text',
      name: 'Simple text option',
      description: 'Description of panel option',
      defaultValue: 'Default value of text input option',
    })
    .addBooleanSwitch({
      path: 'showSeriesCount',
      name: 'Show series counter',
      defaultValue: false,
    })
    .addRadio({
      path: 'seriesCountSize',
      defaultValue: 'sm',
      name: 'Series counter size',
      settings: {
        options: [
          {
            value: 'sm',
            label: 'Small',
          },
          {
            value: 'md',
            label: 'Medium',
          },
          {
            value: 'lg',
            label: 'Large',
          },
        ],
      },
      showIf: (config) => config.showSeriesCount,
    })
    .addBooleanSwitch({
      path: 'showExportButton',
      name: 'Show Export Button',
      description: 'Display export button with CSV, HTML, and image options',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'showEnlargeButton',
      name: 'Show Enlarge Button',
      description: 'Display enlarge button to view panel in full screen',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'showTableViewButton',
      name: 'Show Table View Button',
      description: 'Display table view toggle button',
      defaultValue: true,
    })
    .addRadio({
      path: 'tooltip.mode',
      name: 'Tooltip mode',
      defaultValue: 'single',
      settings: {
        options: [
          { value: 'single', label: 'Single' },
          { value: 'multi', label: 'All' },
          { value: 'none', label: 'Hidden' },
        ],
      },
    })
    .addRadio({
      path: 'legend.displayMode',
      name: 'Legend mode',
      defaultValue: 'list',
      settings: {
        options: [
          { value: 'list', label: 'List' },
          { value: 'table', label: 'Table' },
          { value: 'hidden', label: 'Hidden' },
        ],
      },
    })
    .addRadio({
      path: 'legend.placement',
      name: 'Legend placement',
      defaultValue: 'bottom',
      settings: {
        options: [
          { value: 'bottom', label: 'Bottom' },
          { value: 'right', label: 'Right' },
          { value: 'top', label: 'Top' },
        ],
      },
    });
});
