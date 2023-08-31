import { MetadataGenerator, WidgetVisualizerContext } from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{ repo_id: string, vs_repo_id?: string }> = ({ parameters: { repo_id, vs_repo_id }, getRepo }) => {
  const repo = getRepo(Number(repo_id));

  return {
    title: `TODO Active Contributors of ${repo.fullName} - Last 28 days`
  }
};

export default generateMetadata;
