import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';
import { compare } from '@ossinsight/widgets-utils/src/visualizer/analyze';
import {
  topBottomLayoutGrid,
  dataZoom,
  timeAxis,
  logAxis,
  utils,
  axisTooltip,
  formatMonth,
  boxplot,
} from '@ossinsight/widgets-utils/src/options';
import { prettyMs } from '@ossinsight/widgets-utils/src/utils';

type Params = {
  repo_id: string;
  vs_repo_id?: string;
};

type DataPoint = {
  event_month: string;
  p0: number;
  p25: number;
  p50: number;
  p75: number;
  p100: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

const fmtHours = (hours: number) =>
  prettyMs.default(hours * 60 * 60 * 1000, { unitCount: 1 });

function getMax(data: DataPoint[]): number {
  return data.reduce((prev, current) => Math.max(prev, current.p100), 0) ?? 0;
}

function getMin(data: DataPoint[]): number {
  return (
    data.reduce(
      (prev, current) => Math.min(prev, current.p0 > 0 ? current.p0 : prev),
      Number.MAX_SAFE_INTEGER
    ) ?? Number.MAX_SAFE_INTEGER
  );
}
export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const main = ctx.getRepo(parseInt(ctx.parameters.repo_id));
  const vs = ctx.getRepo(parseInt(ctx.parameters.vs_repo_id));

  const reducedInput = input.reduce((prev, current) => {
    if (current) {
      prev.push(current);
    }
    return prev;
  }, [] as DataPoint[][]);

  const calcMax = (data: DataPoint[][]) => {
    if (data.length <= 1) {
      return getMax(data[0]);
    }
    return Math.max(...data.map((val) => getMax(val)));
  };
  const calcMin = (data: DataPoint[][]) => {
    if (data.length <= 1) {
      return getMin(data[0]);
    }
    return Math.min(...data.map((val) => getMin(val)));
  };

  const max = calcMax(reducedInput);
  const min = calcMin(reducedInput);

  const option = {
    dataset: compare(input, (data, name) => ({
      id: name,
      source: data,
    })),
    grid: topBottomLayoutGrid(!!vs),
    dataZoom: dataZoom(),
    xAxis: utils.template(({ id }) => timeAxis<'x'>(id, { gridId: id }), !!vs),
    yAxis: utils.template(
      ({ id }) =>
        logAxis<'y'>(id, {
          name: 'Duration',
          gridId: id,
          axisLabel: { formatter: fmtHours },
          axisPointer: {
            label: {
              formatter: ({ value }) => fmtHours(Number(value)),
            },
          },
          max,
          min,
        }),
      !!vs
    ),
    tooltip: axisTooltip('cross', {
      renderMode: 'html',
      formatter: (params) => {
        const { value, marker } = params[0];
        return `
        ${marker as string}
        <span>${formatMonth(value.event_month)}</span>
        <br/>
        <b>min</b>: ${fmtHours(value.p0)}
        <br/>
        <b>p25</b>: ${fmtHours(value.p25)}
        <br/>
        <b>medium</b>: ${fmtHours(value.p50)}
        <br/>
        <b>p75</b>: ${fmtHours(value.p75)}
        <br/>
        <b>max</b>: ${fmtHours(value.p100)}
      `;
      },
    }),
    series: compare([main, vs], (data, name) =>
      boxplot('event_month', ['p0', 'p25', 'p50', 'p75', 'p100'], {
        datasetId: name,
        xAxisId: name,
        yAxisId: name,
        itemStyle: {
          // color: alpha('#dd6b66', 0.3),
          color: 'rgba(221, 107, 102, 0.3)',
          borderWidth: 1,
        },
        boxWidth: ['40%', '40%'],
      })
    ).flat(),
  };

  return option;
}

const units = ['', 'k', 'm', 'b'];

function format(value: number) {
  if (value === 0) {
    return '0';
  }
  let i = 0;
  while (value % 1000 === 0 && i < units.length) {
    value = value / 1000;
    i++;
  }

  return `${value}${units[i]}`;
}

const fmt = (val: number) => `${val} PRs`;

export const type = 'echarts';
