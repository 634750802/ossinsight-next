import { datasourceFetchers } from '@ossinsight/widgets';
import { WidgetBaseContext } from '@ossinsight/widgets-types';

export interface RefDatasourceConfig {
  type: 'ref';
  widget: string;
  params?: Record<string, string>;
}

export default async function executeRefDatasource(config: RefDatasourceConfig, ctx: WidgetBaseContext) {
  const parameters = config.params
    ? Object.entries(config.params).reduce((parameters, [k, v]) => {
      parameters[k] = ctx.parameters[v];
      return parameters;
    }, {})
    : ctx.parameters;

  return datasourceFetchers[config.widget]({
    ...ctx,
    parameters: parameters,
  });
}
