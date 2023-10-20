'use client';

import {
  getOrgActivityLocations,
  getOrgActivityOrgs,
  getCompletionRate,
} from '@/components/Analyze/utils';
import Loader from '@/components/Widget/loading';
import { usePerformanceOptimizedNetworkRequest } from '@/utils/usePerformanceOptimizedNetworkRequest';
import { Scale } from '@ossinsight/ui/src/components/transitions';
import { alpha2ToTitle } from '@ossinsight/widgets-utils/src/geo';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { ForwardedRef, forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

const Table = forwardRef(function Table (props: {
  rows?: Array<Array<string | number>>;
  header?: Array<string>;
  maxRows?: number;
}, forwardedRef: ForwardedRef<any>) {
  const { rows, header, maxRows = 10 } = props;

  return (
    <>
      <table className={twMerge('min-w-full divide-y divide-gray-700')} ref={forwardedRef}>
        <thead>
          <tr>
            <th
              scope='col'
              className='py-1.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0'
            >
              {header?.[0]}
            </th>
            {header?.slice(1).map((h) => (
              <th
                key={h?.toString()}
                scope='col'
                className='px-3 py-1.5 text-left text-sm font-semibold text-white'
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-800'>
          {rows?.map((row) => (
            <tr key={row[0]}>
              <td className='whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-white sm:pl-0'>
                {row[0]}
              </td>
              {row?.slice(1).map((r) => (
                <td
                  key={r?.toString()}
                  className='whitespace-normal px-3 py-1 text-sm text-gray-300'
                >
                  {r}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
});

export function upperFirst (str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const TableSkeleton = forwardRef(function TableSkeleton ({}, forwardedRef: ForwardedRef<any>) {
  return (
    <>
      <Loader ref={forwardedRef} />
    </>
  );
});

export function GeoRankTableContent (props: {
  id: number;
  type: 'stars' | 'participants';
  role?: string;
  maxRows?: number;
}) {
  const { id, type, maxRows = 10, role } = props;
  const repoIds = useRepoIds();
  const period = usePeriod();
  const {
    result: data = [],
    loading,
    ref,
  } = usePerformanceOptimizedNetworkRequest(
    getOrgActivityLocations,
    id, { activity: type, period, ...(role && { role }), repoIds },
  );

  const rowsMemo = React.useMemo(() => {
    return data
      .slice(0, maxRows)
      .map((d: any, idx: number) => [
        idx + 1,
        alpha2ToTitle(d.country_code),
        d[type],
      ]);
  }, [data, maxRows, type]);

  const headerMemo = React.useMemo(() => {
    return ['No.', 'Location', upperFirst(type)];
  }, [type]);

  return (
    <>
      {loading ? (
        <TableSkeleton ref={ref} />
      ) : (
        <Scale>
          <Table ref={ref} rows={rowsMemo} header={headerMemo} />
        </Scale>
      )}
    </>
  );
}

export function GeoRankTable (props: {
  id?: number;
  type?: 'stars' | 'participants';
  role?: string;
  className?: string;
}) {
  const { id, type = 'stars', className, role } = props;

  if (!id) {
    return null;
  }

  return (
    <div className={twMerge('px-1 items-center justify-around flex flex-col', className)}>
      <div className='px-1 text-base font-semibold leading-6 text-white mx-auto w-fit'>
        Top locations
      </div>
      <div className='grow overflow-y-auto styled-scrollbar'>
        <GeoRankTableContent id={id} type={type} role={role} />
      </div>
      <div>
        <CompletionRateContent
          id={id}
          type={type}
          role={role}
          target='locations'
        />
      </div>
    </div>
  );
}

export function CompanyRankTableContent (props: {
  id: number;
  type: 'stars' | 'participants';
  role?: string;
  maxRows?: number;
}) {
  const { id, maxRows = 10, type, role } = props;
  const repoIds = useRepoIds();
  const period = usePeriod();
  const {
    result: data = [],
    ref,
    loading,
  } = usePerformanceOptimizedNetworkRequest(
    getOrgActivityOrgs,
    id, { activity: type, period, ...(role && { role }), repoIds });

  const rowsMemo = React.useMemo(() => {
    return data
      .slice(0, maxRows)
      .map((d: any, idx: number) => [idx + 1, d.organization_name, d[type]]);
  }, [data, maxRows, type]);

  const headerMemo = React.useMemo(() => {
    return ['No.', 'Company', upperFirst(type)];
  }, [type]);

  return (
    <>
      {loading ? (
        <TableSkeleton ref={ref} />
      ) : (
        <Scale>
          <Table ref={ref} rows={rowsMemo} header={headerMemo} />
        </Scale>
      )}
    </>
  );
}

export function CompletionRateContent(props: {
  id: number;
  type: 'stars' | 'participants';
  target: 'organizations' | 'locations';
  role?: string;
}) {
  const { id, type, target, role } = props;
  const repoIds = useRepoIds();
  const period = usePeriod();
  const {
    result: data = [],
    ref,
    loading,
  } = usePerformanceOptimizedNetworkRequest(getCompletionRate, id, {
    activity: type,
    period,
    ...(role && { role }),
    target,
    repoIds,
  });

  const percentageMemo = useMemo(() => {
    if (!data?.[0]?.percentage) {
      return undefined;
    }
    return (data?.[0]?.percentage).toFixed(2);
  }, [data]);

  return (
    <>
      {loading ? (
        <div ref={ref} />
      ) : (
        <Scale>
          {/* <FilledRatio ref={ref} data={percentageMemo} /> */}
          <div ref={ref} className='text-[#7c7c7c] text-xs'>
            Company Info Completion:
            <span className='text-[#aaa] font-bold'> {percentageMemo}%</span>
          </div>
        </Scale>
      )}
    </>
  );
}


export function CompanyRankTable(props: {
  id?: number;
  type?: 'stars' | 'participants';
  role?: string;
  className?: string;
}) {
  const { id, type = 'stars', className, role } = props;

  if (!id) {
    return null;
  }

  return (
    <div
      className={twMerge(
        'px-1 items-center justify-around flex flex-col',
        className
      )}
    >
      <div className='px-1 text-base font-semibold leading-6 text-white mx-auto w-fit'>
        Top companies
      </div>
      <div className='grow overflow-y-auto styled-scrollbar'>
        <CompanyRankTableContent id={id} type={type} role={role} />
      </div>
      <div>
        <CompletionRateContent
          id={id}
          type={type}
          role={role}
          target='organizations'
        />
      </div>
    </div>
  );
}

function useRepoIds () {
  const usp = useSearchParams();

  return usp.getAll('repoIds');
}

function usePeriod() {
  const usp = useSearchParams();

  return usp.get('period') || 'past_28_days';
}
