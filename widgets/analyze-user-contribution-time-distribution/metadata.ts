import { MetadataGenerator, WidgetVisualizerContext } from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{ user_id: number }> = ({ parameters: { user_id }, getUser }) => {
  const user = getUser(user_id);

  return {
    title: `Contribution distribution of ${user}`,
  }
};

export default generateMetadata;
