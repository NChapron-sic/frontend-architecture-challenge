import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IssueService } from './issue.service';
import { FilterOption, Issue, IssueStatus, StatusFilter, TypeFilter } from './models';
import { StatusBadgeComponent } from './shared/status-badge.component';
import { formatDate, formatShortDate, getIssueCounts } from './utils';

@Component({
  selector: 'app-root',
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);
  issueService = inject(IssueService);

  // Data
  issues = signal<Issue[]>([]);
  filteredIssues = signal<Issue[]>([]);

  // UI state
  loading = signal(false);
  error = signal<string | null>(null);
  updateError = signal<string | null>(null);
  updatingIds = signal<string[]>([]);
  announcement = signal('');

  // Filters
  statusFilter = signal<StatusFilter>('all');
  typeFilter = signal<TypeFilter>('all');
  searchTerm = '';

  // Summary
  totalCount = signal(0);
  openCount = signal(0);
  resolvedCount = signal(0);

  statusOptions: FilterOption<StatusFilter>[] = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'resolved', label: 'Resolved' },
  ];

  typeOptions: FilterOption<TypeFilter>[] = [
    { value: 'all', label: 'All types' },
    { value: 'incident', label: 'Incident' },
    { value: 'warning', label: 'Warning' },
  ];

  formatDate = formatDate;
  formatShortDate = formatShortDate;

  ngOnInit(): void {
    this.loadIssues();
  }

  loadIssues(): void {
    this.loading.set(true);
    this.error.set(null);

    this.issueService.getIssues().subscribe({
      next: (data) => {
        // Open items first, incidents before warnings, then most recent first.
        const sorted = [...data].sort((a, b) => {
          if (a.status !== b.status) {
            return a.status === 'open' ? -1 : 1;
          }
          if (a.type !== b.type) {
            return a.type === 'incident' ? -1 : 1;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        this.issues.set(sorted);

        const counts = getIssueCounts(sorted);
        this.totalCount.set(counts.total);
        this.openCount.set(counts.open);
        this.resolvedCount.set(counts.resolved);

        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load issues', err);
        this.error.set(
          err?.status === 0
            ? 'Unable to reach the server. Check your connection and try again.'
            : 'We could not load issues. Please try again.',
        );
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const result = this.issues().filter((issue) => {
      if (this.statusFilter() !== 'all' && issue.status !== this.statusFilter()) {
        return false;
      }
      if (this.typeFilter() !== 'all' && issue.type !== this.typeFilter()) {
        return false;
      }
      if (term && !issue.title.toLowerCase().includes(term)) {
        return false;
      }
      return true;
    });
    this.filteredIssues.set(result);
  }

  onStatusFilterChange(value: StatusFilter): void {
    this.statusFilter.set(value);
    this.applyFilters();
  }

  onTypeFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as TypeFilter;
    this.typeFilter.set(value);
    this.applyFilters();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.searchTerm = '';
    this.applyFilters();
    input.focus();
  }

  clearFilters(): void {
    this.statusFilter.set('all');
    this.typeFilter.set('all');
    this.searchTerm = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return (
      this.statusFilter() !== 'all' || this.typeFilter() !== 'all' || this.searchTerm.trim() !== ''
    );
  }

  getEmptyStateMessage(): string {
    const parts: string[] = [];
    if (this.statusFilter() !== 'all') {
      parts.push(this.statusFilter() === 'open' ? 'open' : 'resolved');
    }
    if (this.typeFilter() !== 'all') {
      parts.push(this.typeFilter() === 'incident' ? 'incidents' : 'warnings');
    } else {
      parts.push('issues');
    }
    let message = `No ${parts.join(' ')}`;
    if (this.searchTerm.trim() !== '') {
      message += ` matching “${this.searchTerm.trim()}”`;
    }
    return message + '.';
  }

  getResultsLabel(): string {
    const count = this.filteredIssues().length;
    const total = this.issues().length;
    if (count === total) {
      return `${total} ${total === 1 ? 'issue' : 'issues'}`;
    }
    return `Showing ${count} of ${total} issues`;
  }

  isUpdating(issue: Issue): boolean {
    return this.updatingIds().includes(issue.id);
  }

  getActionLabel(issue: Issue): string {
    return issue.status === 'open'
      ? `Mark “${issue.title}” as resolved`
      : `Reopen “${issue.title}”`;
  }

  toggleStatus(issue: Issue): void {
    if (this.isUpdating(issue)) {
      return;
    }

    const previousStatus = issue.status;
    const newStatus: IssueStatus = issue.status === 'open' ? 'resolved' : 'open';
    const previousUpdatedAt = issue.updatedAt;
    const updatedAt = new Date().toISOString();

    this.updateError.set(null);
    this.updatingIds.update((ids) => [...ids, issue.id]);

    // Optimistic update so the table and counters respond immediately.
    this.issues.update((list) =>
      list.map((i) => (i.id === issue.id ? { ...i, status: newStatus, updatedAt } : i)),
    );
    this.issueService.issues = this.issues();
    if (newStatus === 'resolved') {
      this.openCount.update((c) => c - 1);
      this.resolvedCount.update((c) => c + 1);
    } else {
      this.openCount.update((c) => c + 1);
      this.resolvedCount.update((c) => c - 1);
    }
    this.applyFilters();

    this.http
      .patch<Issue>(`${this.issueService.apiUrl}/${issue.id}`, { status: newStatus, updatedAt })
      .subscribe({
        next: (saved) => {
          this.issues.update((list) => list.map((i) => (i.id === saved.id ? saved : i)));
          this.issueService.issues = this.issues();
          this.applyFilters();
          this.updatingIds.update((ids) => ids.filter((id) => id !== issue.id));
          this.announcement.set(
            `“${saved.title}” marked as ${saved.status === 'open' ? 'open' : 'resolved'}.`,
          );
        },
        error: (err) => {
          console.error('Failed to update issue', err);
          // Roll back the optimistic update.
          this.issues.update((list) =>
            list.map((i) =>
              i.id === issue.id
                ? { ...i, status: previousStatus, updatedAt: previousUpdatedAt }
                : i,
            ),
          );
          this.issueService.issues = this.issues();
          if (previousStatus === 'open') {
            this.openCount.update((c) => c + 1);
            this.resolvedCount.update((c) => c - 1);
          } else {
            this.openCount.update((c) => c - 1);
            this.resolvedCount.update((c) => c + 1);
          }
          this.applyFilters();
          this.updatingIds.update((ids) => ids.filter((id) => id !== issue.id));
          this.updateError.set(`Could not update “${issue.title}”. Please try again.`);
        },
      });
  }

  getOpenPercentage(): number {
    if (this.totalCount() === 0) {
      return 0;
    }
    return Math.round((this.openCount() / this.totalCount()) * 100);
  }

  getResolvedPercentage(): number {
    if (this.totalCount() === 0) {
      return 0;
    }
    return Math.round((this.resolvedCount() / this.totalCount()) * 100);
  }

  getCriticalCount(): number {
    return this.issues().filter((i) => i.type === 'incident' && i.status === 'open').length;
  }

  dismissUpdateError(): void {
    this.updateError.set(null);
  }
}
