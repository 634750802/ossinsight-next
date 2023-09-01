'use client';

import { useWidgetTitle } from '@/components/Widget/hooks';
import { TextSkeleton } from '@ossinsight/ui/src/components/Skeleton';

export function WidgetTitle ({ widget }: { widget: string }) {
  const widgetName = useWidgetTitle(widget);

  if (widgetName.loading) {
    return <TextSkeleton characters={12} />;
  } else {
    return <>{widgetName.name}</>;
  }
}
