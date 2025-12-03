import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
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
    });
});
