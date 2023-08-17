import * as React from 'react';

import { useSimpleSelect } from './Select';
import { generateZoneOptions } from '@ossinsight/widgets-utils/src/ui';

const { DEFAULT_ZONE, ZONE_OPTIONS } = generateZoneOptions();

export interface TimeZoneSelectorProps {
  id?: string;
  onValueChange?: (newValue: string) => void;
  value?: string
}

export function TimeZoneSelector(props: TimeZoneSelectorProps) {
  const { onValueChange, id, value = String(DEFAULT_ZONE) } = props;

  console.log(props);

  const { select: zoneSelect, value: zone } = useSimpleSelect(
    ZONE_OPTIONS,
    ZONE_OPTIONS.find((i) => i.key === Number(value)) ||
      ZONE_OPTIONS[DEFAULT_ZONE],
    id,
  );

  React.useEffect(() => {
    onValueChange && onValueChange(zone);
  }, [zone]);

  return <>{zoneSelect}</>;
}
