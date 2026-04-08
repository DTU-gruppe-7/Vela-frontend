import type { MealPlanEntry } from '../../../types/MealPlan';

const GROUP_DOT_COLORS = [
  'bg-indigo-400',
  'bg-sky-400',
  'bg-cyan-400',
  'bg-teal-400',
  'bg-amber-400',
  'bg-orange-400',
  'bg-rose-400',
  'bg-fuchsia-400',
  'bg-violet-400',
  'bg-lime-400',
];

function getGroupDotColor(groupName?: string) {
  if (!groupName) return 'bg-slate-400';

  let hash = 0;
  for (let i = 0; i < groupName.length; i += 1) {
    hash = (hash * 31 + groupName.charCodeAt(i)) | 0;
  }

  const colorIndex = Math.abs(hash) % GROUP_DOT_COLORS.length;
  return GROUP_DOT_COLORS[colorIndex];
}

export function getSourceDotColor(entry: MealPlanEntry) {
  if (entry.source === 'group') {
    return getGroupDotColor(entry.sourceGroupName);
  }

  return 'bg-emerald-400';
}
