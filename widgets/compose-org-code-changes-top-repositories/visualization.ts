import type {
  ComposeVisualizationConfig,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';
import {
  autoSize,
  computeLayout,
  horizontal,
  nonEmptyDataWidget,
  vertical,
  widget,
} from '@ossinsight/widgets-utils/src/compose';
import { DateTime } from 'luxon';

type Params = {
  owner_id: string;
  period?: string;
};

// type ParticipantDataPoint = {
//   login: string;
//   engagements: number;
// };

// type ActivityDataPoint = {
//   repo_id: number;
//   repo_name: string;
//   stars: number;
// };

type DataPoint = {
  repo_id: number;
  repo_name: string;
  additions: number;
  deletions: number;
  changes: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

export default function (
  [inputData]: Input,
  ctx: WidgetVisualizerContext<Params>
): ComposeVisualizationConfig {
  const WIDTH = ctx.width;
  const HEIGHT = ctx.height;
  const PADDING = 24;
  const HEADER_HEIGHT = 48;

  const data = inputData.slice(0, 5);

  return computeLayout(
    vertical(
      widget('builtin:card-heading', undefined, {
        title: 'Which Repositories Have the Most Frequent Code Changes?',
        subtitle: ' ',
      }).fix(HEADER_HEIGHT),
      horizontal(
        widget('builtin:label', undefined, {
          label: 'Repo',
          labelProps: {
            style: {
              fontSize: 12,
              fontWeight: 'normal',
              marginRight: 'auto',
            },
          },
        }).flex(0.3),
        widget('builtin:label', undefined, {
          label: 'Lines of Code Changed',
          labelProps: {
            style: {
              fontSize: 12,
              fontWeight: 'normal',
            },
          },
        }).flex(1),
        widget('builtin:label', undefined, {
          label: 'Add/Delete',
          labelProps: {
            style: {
              fontSize: 12,
              fontWeight: 'normal',
              marginLeft: 'auto',
            },
          },
        })
      ).flex(0.1),
      nonEmptyDataWidget(data, () =>
        horizontal(
          vertical(
            ...data.map((item) =>
              horizontal(
                widget('builtin:avatar-label', undefined, {
                  label: item.repo_name.split('/')[1],
                  imgSrc: `https://github.com/${
                    item.repo_name.split('/')[0]
                  }.png`,
                  size: 24,
                  value: 10,
                  maxVal: 100,
                }).flex(0.3),
                widget('builtin:label', undefined, {
                  label: item.changes.toString(),
                  labelProps: {
                    style: {
                      fontSize: 12,
                      fontWeight: 'normal',
                    },
                  },
                }).flex(0.3),
                widget('builtin:avatar-progress', undefined, {
                  label: `+${item.additions}`,
                  value: item.additions,
                  valueFormatter: () => `-${item.deletions}`,
                  maxVal: item.additions + item.deletions,
                  color: ctx.theme.colors.green['400'],
                  backgroundColor: ctx.theme.colors.red['400'],
                }).flex(0.4)
              )
            )
          ).flex(0.7)
        )
      )
    ).padding([
      0,
      PADDING,
      PADDING - 4 /* the bar chart have small padding vertically */,
    ]),
    0,
    0,
    WIDTH,
    HEIGHT
  );
}

export const type = 'compose';

export const width = 432;
export const height = 272;
