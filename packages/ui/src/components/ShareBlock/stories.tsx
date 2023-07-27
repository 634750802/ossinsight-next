import { Meta, StoryObj } from '@storybook/react';
import { ShareBlock } from './ShareBlock';

export default {
  title: 'Components/ShareBlock',
  component: ShareBlock,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  decorators: [
    (Story: any) => {
      return <div className='max-w-[400px]'><Story /></div>;
    },
  ],
} satisfies Meta<typeof ShareBlock>;

export const Default = {
  args: {
    title: 'OSSInsight Next',
    url: 'https://ossinsight-next.vercel.app',
    thumbnailUrl: 'https://ossinsight.io/img/logo.svg',
    description: 'OSSInsight Next is next version of OSSInsight',
    keywords: ['OSSInsight'],
  },
} satisfies StoryObj<typeof ShareBlock>;
