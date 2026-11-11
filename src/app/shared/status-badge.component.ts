import { Component, computed, inject, input } from '@angular/core';
import { IssueService } from '../issue.service';
import { BadgeTone, Issue } from '../models';
import { formatDate } from '../utils';

@Component({
  selector: 'app-status-badge',
  template: `
    <span
      class="badge"
      [class.badge--success]="tone() === 'success'"
      [class.badge--danger]="tone() === 'danger'"
      [class.badge--warning]="tone() === 'warning'"
      [class.badge--neutral]="tone() === 'neutral'"
      [attr.title]="tooltip()"
    >
      <span class="badge__dot" aria-hidden="true"></span>
      {{ label() }}
    </span>
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 2px var(--space-3);
      border-radius: var(--radius-pill);
      font-size: var(--font-size-xs);
      font-weight: 600;
      line-height: 1.6;
      white-space: nowrap;
      border: 1px solid transparent;
    }

    .badge__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .badge--success {
      color: var(--color-success-700);
      background: var(--color-success-50);
      border-color: var(--color-success-200);
    }

    .badge--danger {
      color: var(--color-danger-700);
      background: var(--color-danger-50);
      border-color: var(--color-danger-200);
    }

    .badge--warning {
      color: var(--color-warning-700);
      background: var(--color-warning-50);
      border-color: var(--color-warning-200);
    }

    .badge--neutral {
      color: var(--color-neutral-700);
      background: var(--color-neutral-100);
      border-color: var(--color-neutral-200);
    }
  `,
})
export class StatusBadgeComponent {
  private issueService = inject(IssueService);

  issue = input.required<Issue>();

  label = computed(() => this.issueService.getStatusLabel(this.issue().status));

  tone = computed<BadgeTone>(() => {
    const issue = this.issue();
    if (issue.status === 'resolved') {
      return 'success';
    }
    if (this.issueService.isCritical(issue)) {
      return 'danger';
    }
    return 'warning';
  });

  tooltip = computed(() => {
    const issue = this.issue();
    if (issue.status === 'resolved') {
      return `Resolved on ${formatDate(issue.updatedAt)}`;
    }
    return `Open since ${formatDate(issue.createdAt)}`;
  });
}
