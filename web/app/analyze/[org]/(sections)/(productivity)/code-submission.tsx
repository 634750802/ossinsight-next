'use client';
import SectionTemplate from '@/components/Analyze/Section';
import ChartTemplate from '@/components/Analyze/Section/Chart';

export default function CodeSubmissionContent() {
  return (
    <SectionTemplate
      title='Productivity'
      description='Analyze the development productivity of your organization in handling Pull Requests, Code Reviews, and Code Submissions. Identify bottlenecks in the development process, measure the efficiency of code review and issue resolution, and optimize the workflow for increased productivity.'
      level={2}
      classname='pt-8'
    >
      <SectionTemplate
        title='Code Submission'
        level={3}
        classname='pt-8 flex flex-col gap-4'
      >
        <div className='flex gap-4 flex-wrap w-full overflow-x-auto'>
          <ChartTemplate
            name='@ossinsight/widget-compose-org-activity-growth'
            searchParams={{
              activity: 'commits',
            }}
            width={988}
            height={389}
          />
        </div>
        <div className='flex gap-4 flex-wrap w-full overflow-x-auto'>
          <ChartTemplate
            name='@ossinsight/widget-analyze-org-commits-time-distribution'
            searchParams={{}}
            width={486}
            height={274}
          />
          <ChartTemplate
            name='@ossinsight/widget-compose-org-code-changes-top-repositories'
            searchParams={{}}
            width={486}
            height={274}
          />
        </div>
      </SectionTemplate>
    </SectionTemplate>
  );
}
