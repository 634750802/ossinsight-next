'use client';
import SectionTemplate from '@/components/Analyze/Section';
import ChartTemplate from '@/components/Analyze/Section/Chart';
import { MainSideGridTemplate } from '@/components/Analyze/Section/gridTemplates/MainSideGridTemplate';
import { CompanyRankTable, GeoRankTable } from '@/components/Analyze/Table/RankTable';
import { AnalyzeOwnerContext } from '@/components/Context/Analyze/AnalyzeOwner';
import { useSimpleSelect } from '@ossinsight/ui/src/components/Selector/Select';
import { upperFirst } from '@ossinsight/widgets-utils/src/utils';
import * as React from 'react';

export default function OriginsContent () {
  const { id: orgId } = React.useContext(AnalyzeOwnerContext);

  return (
    <SectionTemplate
      id="origins"
      title="Origins"
      level={3}
      className="pt-8 flex flex-col gap-4"
    >
      <OrgActivityCompany orgId={orgId} />
      <OrgActivityMap orgId={orgId} />
    </SectionTemplate>
  );
}

function RoleInput ({
  id,
  onValueChange,
  value = 'pr_creators',
}: {
  id: string;
  value?: string;
  onValueChange: (newValue: string | undefined) => void;
}) {
  const options = [
    'pr_creators',
    'pr_reviewers',
    'pr_commenters',
    'issue_creators',
    'issue_commenters',
    'commit_authors',
  ].map((r) => ({
    key: r,
    title: r.startsWith('pr_') ? `Pull Request ${upperFirst(r.replace('pr_', '').split('_').join(' '))}` : upperFirst(r.split('_').join(' ')),
  }));

  const { select: roleSelect, value: role } = useSimpleSelect(
    options,
    options.find((i) => i.key === value) || options[0],
    id,
  );

  React.useEffect(() => {
    onValueChange && onValueChange(role);
  }, [onValueChange, role]);

  return <>{roleSelect}</>;
}

function OrgActivityCompany (props: { orgId?: number }) {
  const { orgId } = props;

  const [role, setRole] = React.useState<string>('pr_creators');

  const handleChangeRole = React.useCallback((newValue?: string) => {
    newValue && setRole(newValue);
  }, []);

  return (
    <MainSideGridTemplate>
      <ChartTemplate
        key={role}
        name="@ossinsight/widget-compose-org-activity-company"
        searchParams={{
          activity: 'participants',
          role,
        }}
        height={405}
      >
        <div className="absolute top-10 left-5">
          <RoleInput
            id="role-co"
            value={role}
            onValueChange={handleChangeRole}
          />
        </div>
      </ChartTemplate>
      <CompanyRankTable
        key={role}
        id={orgId}
        type="participants"
        className={`h-[405px]`}
        role={role}
      />
    </MainSideGridTemplate>
  );
}

function OrgActivityMap (props: { orgId?: number }) {
  const { orgId } = props;

  const [role, setRole] = React.useState<string>('pr_creators');

  const handleChangeRole = React.useCallback((newValue?: string) => {
    newValue && setRole(newValue);
  }, []);

  return (
    <MainSideGridTemplate>
      <ChartTemplate
        key={role}
        name="@ossinsight/widget-compose-org-activity-map"
        searchParams={{
          activity: 'participants',
          role,
        }}
        height={365}
      >
        <div className="absolute top-10 left-5">
          <RoleInput
            id="role-map"
            value={role}
            onValueChange={handleChangeRole}
          />
        </div>
      </ChartTemplate>
      <GeoRankTable
        key={role}
        id={orgId}
        type="participants"
        role={role}
        className={`h-[365px]`}
      />
    </MainSideGridTemplate>
  );
}
