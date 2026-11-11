export type IssueStatus = 'open' | 'resolved';
export type IssueType = 'incident' | 'warning';

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
}

export type StatusFilter = 'all' | IssueStatus;
export type TypeFilter = 'all' | IssueType;

export interface FilterOption<T> {
  value: T;
  label: string;
}

export type BadgeTone = 'success' | 'danger' | 'warning' | 'neutral';
