import AnalyzeOrgContextProvider, {
  AnalyzeOrgContextProps,
} from '@/components/Context/Analyze/AnalyzeOrg';
import OrgAnalyzePageHeader from '@/components/Analyze/Header/OrgHeader';
import SectionTemplate from '@/components/Analyze/Section';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import CompanyRankTable from '@/components/Analyze/Table/RankTable';
import { fetchOrgInfo } from '@/app/analyze/[org]/fetchOwner';

const PAGE_ID = 'code-review-efficiency';

export default async function OrgAnalyzePage({
  params,
}: {
  params: { org: string };
}) {
  const data = await fetchOrgInfo(params.org);

  return (
    <AnalyzeOrgContextProvider data={data}>
      <OrgAnalyzePageHeader />
      <SectionTemplate
        title='Productivity'
        description='Analyze the development productivity of your organization in handling Pull Requests, Code Reviews, and Code Submissions. Identify bottlenecks in the development process, measure the efficiency of code review and issue resolution, and optimize the workflow for increased productivity.'
        level={2}
        classname='pt-8'
      >
        <SectionTemplate
          title='Code Review Efficiency'
          level={3}
          classname='pt-8 flex flex-col gap-4'
        >
          <div className='flex gap-4 flex-wrap w-full overflow-x-auto'>
            <ChartTemplate
              name='@ossinsight/widget-compose-org-productivity-ratio'
              searchParams={{
                activity: 'reviews/reviewed',
              }}
              width={272}
              height={272}
            />
            <ChartTemplate
              name='@ossinsight/widget-analyze-org-recent-pr-review-stats'
              searchParams={{}}
              width={700}
              height={272}
            />
          </div>
          <div className='flex gap-4 flex-wrap w-full overflow-x-auto'>
            <ChartTemplate
              name='@ossinsight/widget-analyze-org-pull-requests-open-to-review'
              searchParams={{}}
              width={486}
              height={274}
            />
            <ChartTemplate
              name='@ossinsight/widget-analyze-org-activity-action-top-repos'
              searchParams={{
                activity: 'reviews/review-comments',
              }}
              width={486}
              height={274}
            />
          </div>
        </SectionTemplate>
      </SectionTemplate>
    </AnalyzeOrgContextProvider>
  );
}
