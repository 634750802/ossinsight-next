import * as fs from 'fs';
import * as path from 'path';

export function generateModule () {
  const base = process.cwd();
  const widgetsPath = path.resolve(base, '../widgets');

  const folders = fs.readdirSync(widgetsPath, { withFileTypes: true });
  const widgets: Record<string, string> = {}

  let src = `const widgets = {}
const visualizers = {}
const datasourceFetchers = {}
const parameterDefinitions = {}
const metadataGenerators = {}
`;

  folders.forEach(folder => {
    if (folder.isDirectory()) {
      const pkg = path.join(widgetsPath, folder.name, 'package.json');
      const { name, version, keywords, description, author } = require(pkg);
      const meta = { name, version, keywords, description, author };
      widgets[name] = path.resolve(widgetsPath, folder.name);

      const quotedName = JSON.stringify(name);
      const visPath = JSON.stringify(path.join(name, 'visualization.ts'));
      const dataPath = JSON.stringify(path.join(name, 'datasource.json'));
      const paramsPath = JSON.stringify(path.join(name, 'params.json'));
      const metadataPath = JSON.stringify(path.join(name, 'metadata.ts'));

      src += `widgets[${quotedName}] = ${JSON.stringify(meta)}\n`;

      src += `visualizers[${quotedName}] = () => import(${visPath})\n`;

      src += `datasourceFetchers[${quotedName}] = (ctx) => Promise.all([import(${dataPath}), import('@ossinsight/widgets-core/src/datasource')]).then(([jsonModule, core]) => core.default(jsonModule.default, ctx))\n`;

      src += `parameterDefinitions[${quotedName}] = () => import(${paramsPath}).then(module => module.default)\n`;

      src += `metadataGenerators[${quotedName}] = () => import(${metadataPath}).then(module => module.default)\n`;
    }
  });

  src += 'export default widgets\n';
  src += 'export { visualizers, datasourceFetchers, parameterDefinitions, metadataGenerators }\n';

  const filepath = path.resolve(base, 'node_modules/@ossinsight/widgets/index.js');
  fs.mkdirSync(path.dirname(filepath), { recursive: true });

  fs.writeFileSync(filepath, src);

  return widgets;
}