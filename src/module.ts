import { FieldColorModeId, FieldConfigProperty, PanelPlugin } from '@grafana/data';
import {
  AxisPlacement,
  BarAlignment,
  GraphDrawStyle,
  GraphGradientMode,
  GraphThresholdsStyleMode,
  GraphTransform,
  LineInterpolation,
  StackingMode,
  VisibilityMode,
} from '@grafana/schema';
import { commonOptionsBuilder, getGraphFieldOptions } from '@grafana/ui';
import { DerivedTooltipValuesEditor } from './components/DerivedTooltipValuesEditor';
import { SimplePanel } from './components/SimplePanel';
import { AnnotationDisplayMode, ExtraTimeSeriesFieldConfig, SimpleOptions } from './types';

const defaultGraphConfig: ExtraTimeSeriesFieldConfig = {
  drawStyle: GraphDrawStyle.Line,
  lineInterpolation: LineInterpolation.Linear,
  lineWidth: 1,
  fillOpacity: 0,
  gradientMode: GraphGradientMode.None,
  barAlignment: BarAlignment.Center,
  barWidthFactor: 0.6,
  stacking: {
    mode: StackingMode.None,
    group: 'A',
  },
  axisPlacement: AxisPlacement.Auto,
  axisGridShow: true,
  axisCenteredZero: false,
  axisBorderShow: false,
  showPoints: VisibilityMode.Auto,
  pointSize: 5,
  thresholdsStyle: {
    mode: GraphThresholdsStyleMode.Off,
  },
};

export const plugin = new PanelPlugin<SimpleOptions, ExtraTimeSeriesFieldConfig>(SimplePanel)
  .useFieldConfig({
    standardOptions: {
      [FieldConfigProperty.Color]: {
        settings: {
          byValueSupport: true,
          bySeriesSupport: true,
          preferThresholdsMode: false,
        },
        defaultValue: {
          mode: FieldColorModeId.PaletteClassic,
        },
      },
    },
    useCustomConfig: (builder) => {
      const graphFieldOptions = getGraphFieldOptions();
      const graphStyles = ['Graph styles'];

      builder
        .addRadio({
          path: 'drawStyle',
          name: 'Style',
          category: graphStyles,
          defaultValue: defaultGraphConfig.drawStyle,
          settings: {
            options: graphFieldOptions.drawStyle,
          },
        })
        .addRadio({
          path: 'lineInterpolation',
          name: 'Line interpolation',
          category: graphStyles,
          defaultValue: defaultGraphConfig.lineInterpolation,
          settings: {
            options: graphFieldOptions.lineInterpolation,
          },
          showIf: (config) => config.drawStyle === GraphDrawStyle.Line,
        })
        .addRadio({
          path: 'barAlignment',
          name: 'Bar alignment',
          category: graphStyles,
          defaultValue: defaultGraphConfig.barAlignment,
          settings: {
            options: graphFieldOptions.barAlignment,
          },
          showIf: (config) => config.drawStyle === GraphDrawStyle.Bars,
        })
        .addSliderInput({
          path: 'barWidthFactor',
          name: 'Bar width factor',
          category: graphStyles,
          defaultValue: defaultGraphConfig.barWidthFactor,
          settings: {
            min: 0.1,
            max: 1,
            step: 0.1,
          },
          showIf: (config) => config.drawStyle === GraphDrawStyle.Bars,
        })
        .addSliderInput({
          path: 'lineWidth',
          name: 'Line width',
          category: graphStyles,
          defaultValue: defaultGraphConfig.lineWidth,
          settings: {
            min: 0,
            max: 10,
            step: 1,
          },
          showIf: (config) => config.drawStyle !== GraphDrawStyle.Points,
        })
        .addSliderInput({
          path: 'fillOpacity',
          name: 'Fill opacity',
          category: graphStyles,
          defaultValue: defaultGraphConfig.fillOpacity,
          settings: {
            min: 0,
            max: 100,
            step: 1,
          },
          showIf: (config) => config.drawStyle !== GraphDrawStyle.Points,
        })
        .addRadio({
          path: 'gradientMode',
          name: 'Gradient mode',
          category: graphStyles,
          defaultValue: defaultGraphConfig.gradientMode,
          settings: {
            options: graphFieldOptions.fillGradient,
          },
          showIf: (config) => config.drawStyle !== GraphDrawStyle.Points,
        })
        .addFieldNamePicker({
          path: 'fillBelowTo',
          name: 'Fill below to',
          category: graphStyles,
          hideFromDefaults: true,
        })
        .addBooleanSwitch({
          path: 'spanNulls',
          name: 'Connect null values',
          category: graphStyles,
          defaultValue: false,
          showIf: (config) => config.drawStyle === GraphDrawStyle.Line,
        })
        .addRadio({
          path: 'showPoints',
          name: 'Show points',
          category: graphStyles,
          defaultValue: defaultGraphConfig.showPoints,
          settings: {
            options: graphFieldOptions.showPoints,
          },
          showIf: (config) => config.drawStyle !== GraphDrawStyle.Points,
        })
        .addSliderInput({
          path: 'pointSize',
          name: 'Point size',
          category: graphStyles,
          defaultValue: defaultGraphConfig.pointSize,
          settings: {
            min: 1,
            max: 40,
            step: 1,
          },
          showIf: (config) => config.showPoints !== VisibilityMode.Never || config.drawStyle === GraphDrawStyle.Points,
        })
        .addSelect({
          path: 'transform',
          name: 'Transform',
          category: graphStyles,
          hideFromDefaults: true,
          settings: {
            options: [
              { label: 'Constant', value: GraphTransform.Constant },
              { label: 'Negative Y', value: GraphTransform.NegativeY },
            ],
            isClearable: true,
          },
        });

      commonOptionsBuilder.addStackingConfig(builder, defaultGraphConfig.stacking, graphStyles);
      commonOptionsBuilder.addAxisConfig(builder, defaultGraphConfig);
      commonOptionsBuilder.addHideFrom(builder);

      builder
        .addBooleanSwitch({
          path: 'hideFromTable',
          name: 'Hide from table view',
          category: ['Table view'],
          defaultValue: false,
          hideFromDefaults: true,
        })
        .addRadio({
          path: 'thresholdsStyle.mode',
          name: 'Show thresholds',
          category: ['Thresholds'],
          defaultValue: GraphThresholdsStyleMode.Off,
          settings: {
            options: graphFieldOptions.thresholdsDisplayModes,
          },
        });
    },
  })
  .setPanelOptions((builder) => {
    builder
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
        path: 'annotationDisplayMode',
        name: 'Annotation markers',
        description: 'Line markers show annotation details on hover. Text markers keep annotation text visible on the chart.',
        defaultValue: AnnotationDisplayMode.Line,
        settings: {
          options: [
            { label: 'Line markers', value: AnnotationDisplayMode.Line },
            { label: 'Text markers', value: AnnotationDisplayMode.Text },
          ],
        },
      })
      .addCustomEditor({
        id: 'derivedTooltipValues',
        path: 'derivedTooltipValues',
        name: 'Derived tooltip values',
        description:
          'Add calculated tooltip rows. Formula can use value/v and other query fields, for example "[Temperature C] + 273.15".',
        defaultValue: [],
        editor: DerivedTooltipValuesEditor,
      });

    commonOptionsBuilder.addTooltipOptions(builder);
    commonOptionsBuilder.addLegendOptions(builder);

    return builder;
  })
  .setDataSupport({ annotations: true, alertStates: true });
