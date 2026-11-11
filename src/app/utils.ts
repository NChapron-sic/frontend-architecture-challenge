import { Issue } from './models';

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export function getIssueCounts(issues: Issue[]) {
  let open = 0;
  let resolved = 0;
  for (const issue of issues) {
    if (issue.status === 'open') {
      open++;
    } else if (issue.status === 'resolved') {
      resolved++;
    }
  }
  return { total: issues.length, open, resolved };
}
