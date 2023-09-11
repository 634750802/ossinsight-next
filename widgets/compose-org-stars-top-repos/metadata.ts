import { MetadataGenerator, WidgetVisualizerContext } from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{ owner_id: string,  }> = ({ parameters: { owner_id }, getRepo }) => {
  // const repo = getRepo(Number(repo_id));

  return {
    title: `TODO Top repos of ${owner_id}`
  }
};

export default generateMetadata;
