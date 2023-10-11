import type {
  ComposeVisualizationConfig,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';
import {
  computeLayout,
  horizontal,
  vertical,
  widget,
} from '@ossinsight/widgets-utils/src/compose';
import { getWidgetSize } from '@ossinsight/widgets-utils/src/utils';

type Params = {
  owner_id: string;
  activity?: string;
  period?: string;
};

type StarDataPoint = {
  idx: number;
  current_period_day: string;
  current_period_day_total: number;
  past_period_day: string;
  past_period_day_total: number;
};

type CommitDataPoint = {
  idx: number;
  day: string;
  pushes: number;
  commits: number;
};

type DataPoint = StarDataPoint | CommitDataPoint;

type TotalDataPoint = {
  current_period_total: number;
  growth_percentage: number;
  past_period_total: number;
};

type Input = [DataPoint[], TotalDataPoint[]] | [DataPoint[], undefined];

const handleData = (
  data: DataPoint[],
  total: {
    current_period_total: number;
    past_period_total: number;
    diff: number;
    diffPercentage: string;
  },
  activity: string
) => {
  switch (activity) {
    case 'commits':
      return {
        title: 'Code Submission Count Over Time',
        data: data.sort((a, b) => b.idx - a.idx),
        label: total.current_period_total,
        value:
          total.diff >= 0
            ? `↑${total.diffPercentage}%`
            : `↓${total.diffPercentage}%`,
        increase: total.diff >= 0,
      };
    case 'stars':
    default:
      let tmpTitle = 'Star earned over time';
      if (activity === 'participants') {
        tmpTitle = 'Participants Over Time';
      } else if (activity === 'pull-requests') {
        tmpTitle = 'Pull Requests Over Time';
      }
      return {
        title: tmpTitle,
        data,
        label: total.current_period_total,
        value:
          total.diff >= 0
            ? `↑${total.diffPercentage}%`
            : `↓${total.diffPercentage}%`,
        increase: total.diff >= 0,
      };
  }
};

const handleTotal = (total: TotalDataPoint[] | undefined) => {
  if (!total) {
    return null;
  }
  const { current_period_total, past_period_total } =
    total?.[0] || {};

  const currentSum = current_period_total;
  const pastSum = past_period_total;
  const diff = currentSum - pastSum;
  const diffPercentage = ((diff / pastSum) * 100).toFixed(
    diff / pastSum > 1 ? 0 : 2
  );
  return {
    current_period_total,
    past_period_total,
    diff,
    diffPercentage,
  };
};

export default function (
  [data, total]: Input,
  ctx: WidgetVisualizerContext<Params>
): ComposeVisualizationConfig {
  const WIDTH = ctx.width;
  const HEIGHT = ctx.height;
  const SPACING = 16;
  const PADDING = 24;
  const HEADER_HEIGHT = 48;
  const HORIZONTAL_SPACING = 64;

  const { activity = 'stars' } = ctx.parameters || {};

  const totalData = handleTotal(total);

  const {
    data: handledData,
    label,
    value,
    increase,
    title,
  } = handleData(data, totalData, activity);

  return computeLayout(
    vertical(
      widget('builtin:card-heading', undefined, {
        title: title,
        subtitle: ' ',
      }).fix(HEADER_HEIGHT),
      vertical(
        horizontal(
          widget('builtin:label-value', undefined, {
            label,
            value,
            labelProps: {
              style: {
                fontSize: 24,
                fontWeight: 'bold',
              },
            },
            valueProps: {
              style: {
                fontSize: 12,
                lineHeight: 2,
                color: increase
                  ? ctx.theme.colors.green['400']
                  : ctx.theme.colors.red['400'],
              },
            },
            column: false,
          })
        )
          .gap(SPACING)
          .flex(0.1),
        widget(
          '@ossinsight/widget-analyze-org-recent-stats',
          [handledData],
          ctx.parameters
        ).flex(0.8)
      )
    ).padding([0, PADDING, PADDING]),
    0,
    0,
    WIDTH,
    HEIGHT
  );
}

export const type = 'compose';

export const grid = {
  cols: 7,
  rows: 4,
};
