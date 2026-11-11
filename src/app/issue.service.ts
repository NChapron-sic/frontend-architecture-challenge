import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Issue, IssueStatus, IssueType } from './models';

@Injectable({ providedIn: 'root' })
export class IssueService {
  private http = inject(HttpClient);

  apiUrl = '/api/issues';

  // Last loaded issues, kept so other parts of the app can read them without refetching.
  issues: Issue[] = [];

  getIssues(): Observable<Issue[]> {
    return this.http.get<Issue[]>(this.apiUrl).pipe(
      tap((issues) => {
        this.issues = issues;
      }),
    );
  }

  getStatusLabel(status: IssueStatus): string {
    return status === 'open' ? 'Open' : 'Resolved';
  }

  getTypeLabel(type: IssueType): string {
    return type === 'incident' ? 'Incident' : 'Warning';
  }

  // An open incident is considered critical by the operations team.
  isCritical(issue: Issue): boolean {
    return issue.type === 'incident' && issue.status === 'open';
  }

  countOpen(): number {
    return this.issues.filter((i) => i.status === 'open').length;
  }
}
