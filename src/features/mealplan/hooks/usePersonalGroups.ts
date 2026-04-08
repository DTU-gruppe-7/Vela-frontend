import { useEffect, useState } from 'react';
import { groupApi } from '../../../api/groupApi';
import type { Group } from '../../../types/Group';

export function usePersonalGroups(isPersonalView: boolean) {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (!isPersonalView) {
      setGroups([]);
      return;
    }

    groupApi.getGroups().then(setGroups).catch(console.error);
  }, [isPersonalView]);

  return groups;
}
