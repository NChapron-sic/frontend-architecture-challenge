import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { Issue } from './models';

/**
 * Behavioural tests for the Issue Management screen.
 *
 * These tests interact with the rendered DOM and the HTTP contract only:
 *   GET   /api/issues        -> Issue[]
 *   PATCH /api/issues/:id    -> Issue
 */

const ISSUES: Issue[] = [
  {
    id: 'T-1',
    title: 'Stock discrepancy detected',
    description: 'Closing stock differs from book stock.',
    type: 'incident',
    status: 'open',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'T-2',
    title: 'Missing delivery declaration',
    description: 'No declaration was filed for a delivery.',
    type: 'incident',
    status: 'resolved',
    createdAt: '2026-10-02T08:00:00Z',
    updatedAt: '2026-10-03T08:00:00Z',
  },
  {
    id: 'T-3',
    title: 'Unusual fuel consumption',
    description: 'Generator consumption above average.',
    type: 'warning',
    status: 'open',
    createdAt: '2026-10-03T08:00:00Z',
    updatedAt: '2026-10-03T08:00:00Z',
  },
  {
    id: 'T-4',
    title: 'Tank measurement mismatch',
    description: 'Gauge and manual dip differ.',
    type: 'warning',
    status: 'open',
    createdAt: '2026-10-04T08:00:00Z',
    updatedAt: '2026-10-04T08:00:00Z',
  },
  {
    id: 'T-5',
    title: 'Delayed inspection report',
    description: 'Inspection report is overdue.',
    type: 'warning',
    status: 'resolved',
    createdAt: '2026-10-05T08:00:00Z',
    updatedAt: '2026-10-06T08:00:00Z',
  },
];

describe('Issue management', () => {
  let fixture: ComponentFixture<AppComponent>;
  let http: HttpTestingController;
  let root: HTMLElement;

  function render(): void {
    fixture.detectChanges();
  }

  function respondWithIssues(issues: Issue[] = ISSUES): void {
    http.expectOne({ method: 'GET', url: '/api/issues' }).flush(structuredClone(issues));
    render();
  }

  function visibleTitles(): string[] {
    return Array.from(
      root.querySelectorAll('[data-testid="issue-row"] [data-testid="issue-title"]'),
    )
      .map((el) => el.textContent?.trim() ?? '')
      .sort();
  }

  function kpi(name: 'total' | 'open' | 'resolved'): number {
    const el = root.querySelector(`[data-testid="kpi-${name}"]`);
    expect(el, `KPI "${name}" should be rendered`).not.toBeNull();
    return Number(el!.textContent?.trim());
  }

  function buttonByText(text: string, scope: ParentNode = root): HTMLButtonElement {
    const button = Array.from(scope.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === text,
    );
    expect(button, `button "${text}" should exist`).toBeDefined();
    return button as HTMLButtonElement;
  }

  function buttonByLabel(label: string): HTMLButtonElement {
    const button = root.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
    expect(button, `button labelled "${label}" should exist`).not.toBeNull();
    return button!;
  }

  function controlByLabel<T extends HTMLElement>(labelText: string): T {
    const label = Array.from(root.querySelectorAll('label')).find(
      (l) => l.textContent?.trim() === labelText,
    );
    expect(label, `label "${labelText}" should exist`).toBeDefined();
    const control = root.querySelector<T>(`#${label!.htmlFor}`);
    expect(control).not.toBeNull();
    return control!;
  }

  function statusFilterGroup(): HTMLElement {
    const group = Array.from(root.querySelectorAll<HTMLElement>('[role="group"]')).find((g) => {
      const labelId = g.getAttribute('aria-labelledby');
      const labelText = labelId ? root.querySelector(`#${labelId}`)?.textContent : g.ariaLabel;
      return labelText?.trim() === 'Status';
    });
    expect(group, 'status filter group should exist').toBeDefined();
    return group!;
  }

  function filterByStatus(label: 'All' | 'Open' | 'Resolved'): void {
    buttonByText(label, statusFilterGroup()).click();
    render();
  }

  function filterByType(value: 'all' | 'incident' | 'warning'): void {
    const select = controlByLabel<HTMLSelectElement>('Type');
    select.value = value;
    select.dispatchEvent(new Event('change'));
    render();
  }

  function search(term: string): void {
    const input = controlByLabel<HTMLInputElement>('Search issues');
    input.value = term;
    input.dispatchEvent(new Event('input'));
    render();
  }

  beforeEach(() => {
    // Failure scenarios are expected to log; keep the test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AppComponent);
    root = fixture.nativeElement as HTMLElement;
    render();
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  describe('loading', () => {
    it('shows a loading indicator while issues are being fetched', () => {
      expect(root.querySelector('[aria-busy="true"]')).not.toBeNull();
      expect(root.textContent).toContain('Loading issues');

      respondWithIssues();

      expect(root.querySelector('[aria-busy="true"]')).toBeNull();
    });

    it('displays all issues once loaded', () => {
      respondWithIssues();

      expect(visibleTitles()).toEqual(ISSUES.map((i) => i.title).sort());
    });

    it('shows an error state and recovers on retry', () => {
      http
        .expectOne('/api/issues')
        .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
      render();

      const alert = root.querySelector('[role="alert"]');
      expect(alert?.textContent).toContain('Something went wrong');
      expect(visibleTitles()).toEqual([]);

      buttonByText('Try again').click();
      render();
      respondWithIssues();

      expect(root.querySelector('[role="alert"]')).toBeNull();
      expect(visibleTitles()).toHaveLength(ISSUES.length);
    });
  });

  describe('filtering', () => {
    beforeEach(() => respondWithIssues());

    it('filters by status', () => {
      filterByStatus('Open');
      expect(visibleTitles()).toEqual(
        [
          'Stock discrepancy detected',
          'Tank measurement mismatch',
          'Unusual fuel consumption',
        ].sort(),
      );

      filterByStatus('Resolved');
      expect(visibleTitles()).toEqual(
        ['Delayed inspection report', 'Missing delivery declaration'].sort(),
      );

      filterByStatus('All');
      expect(visibleTitles()).toHaveLength(ISSUES.length);
    });

    it('indicates the selected status filter to assistive technologies', () => {
      filterByStatus('Resolved');

      expect(buttonByText('Resolved', statusFilterGroup()).getAttribute('aria-pressed')).toBe(
        'true',
      );
      expect(buttonByText('All', statusFilterGroup()).getAttribute('aria-pressed')).toBe('false');
    });

    it('filters by type', () => {
      filterByType('incident');
      expect(visibleTitles()).toEqual(
        ['Missing delivery declaration', 'Stock discrepancy detected'].sort(),
      );

      filterByType('warning');
      expect(visibleTitles()).toEqual(
        [
          'Delayed inspection report',
          'Tank measurement mismatch',
          'Unusual fuel consumption',
        ].sort(),
      );

      filterByType('all');
      expect(visibleTitles()).toHaveLength(ISSUES.length);
    });

    it('searches issues by title, case-insensitively', () => {
      search('MISMATCH');
      expect(visibleTitles()).toEqual(['Tank measurement mismatch']);

      search('de');
      expect(visibleTitles()).toEqual(
        [
          'Delayed inspection report',
          'Missing delivery declaration',
          'Stock discrepancy detected',
        ].sort(),
      );
    });

    it('does not match search terms against descriptions', () => {
      search('generator');
      expect(visibleTitles()).toEqual([]);
    });

    it('combines status, type and search filters', () => {
      filterByStatus('Open');
      filterByType('warning');
      expect(visibleTitles()).toEqual(
        ['Tank measurement mismatch', 'Unusual fuel consumption'].sort(),
      );

      search('fuel');
      expect(visibleTitles()).toEqual(['Unusual fuel consumption']);
    });

    it('shows an empty state when nothing matches and allows clearing filters', () => {
      filterByStatus('Resolved');
      search('fuel');

      expect(visibleTitles()).toEqual([]);
      expect(root.textContent).toContain('No results');

      buttonByText('Clear filters').click();
      render();

      expect(visibleTitles()).toHaveLength(ISSUES.length);
      expect(controlByLabel<HTMLInputElement>('Search issues').value).toBe('');
      expect(buttonByText('All', statusFilterGroup()).getAttribute('aria-pressed')).toBe('true');
    });

    it('shows an empty state when there are no issues at all', () => {
      fixture.componentRef.destroy();
      fixture = TestBed.createComponent(AppComponent);
      root = fixture.nativeElement as HTMLElement;
      render();
      respondWithIssues([]);

      expect(visibleTitles()).toEqual([]);
      expect(root.textContent).toContain('No results');
      expect(kpi('total')).toBe(0);
    });
  });

  describe('summary', () => {
    beforeEach(() => respondWithIssues());

    it('shows total, open and resolved counts', () => {
      expect(kpi('total')).toBe(5);
      expect(kpi('open')).toBe(3);
      expect(kpi('resolved')).toBe(2);
    });

    it('is not affected by the active filters', () => {
      filterByStatus('Resolved');
      filterByType('incident');
      search('missing');

      expect(kpi('total')).toBe(5);
      expect(kpi('open')).toBe(3);
      expect(kpi('resolved')).toBe(2);
    });
  });

  describe('status updates', () => {
    beforeEach(() => respondWithIssues());

    it('resolves an open issue and keeps the summary in sync', () => {
      buttonByLabel('Mark “Stock discrepancy detected” as resolved').click();
      render();

      const req = http.expectOne({ method: 'PATCH', url: '/api/issues/T-1' });
      expect(req.request.body).toMatchObject({ status: 'resolved' });
      req.flush({ ...ISSUES[0], status: 'resolved', updatedAt: '2026-10-10T08:00:00Z' });
      render();

      expect(kpi('total')).toBe(5);
      expect(kpi('open')).toBe(2);
      expect(kpi('resolved')).toBe(3);
      expect(buttonByLabel('Reopen “Stock discrepancy detected”')).toBeTruthy();

      filterByStatus('Resolved');
      expect(visibleTitles()).toContain('Stock discrepancy detected');
    });

    it('reopens a resolved issue and keeps the summary in sync', () => {
      buttonByLabel('Reopen “Delayed inspection report”').click();
      render();

      const req = http.expectOne({ method: 'PATCH', url: '/api/issues/T-5' });
      expect(req.request.body).toMatchObject({ status: 'open' });
      req.flush({ ...ISSUES[4], status: 'open', updatedAt: '2026-10-10T08:00:00Z' });
      render();

      expect(kpi('open')).toBe(4);
      expect(kpi('resolved')).toBe(1);

      filterByStatus('Open');
      expect(visibleTitles()).toContain('Delayed inspection report');
    });

    it('removes an updated issue from a filtered view it no longer matches', () => {
      filterByStatus('Open');
      buttonByLabel('Mark “Unusual fuel consumption” as resolved').click();
      render();
      http
        .expectOne('/api/issues/T-3')
        .flush({ ...ISSUES[2], status: 'resolved', updatedAt: '2026-10-10T08:00:00Z' });
      render();

      expect(visibleTitles()).not.toContain('Unusual fuel consumption');
      expect(visibleTitles()).toHaveLength(2);
    });

    it('keeps total = open + resolved across several updates', () => {
      const toggles: [string, string, Issue][] = [
        ['Mark “Stock discrepancy detected” as resolved', 'T-1', ISSUES[0]],
        ['Mark “Tank measurement mismatch” as resolved', 'T-4', ISSUES[3]],
        ['Reopen “Missing delivery declaration”', 'T-2', ISSUES[1]],
      ];

      for (const [label, id, issue] of toggles) {
        buttonByLabel(label).click();
        render();
        const req = http.expectOne(`/api/issues/${id}`);
        req.flush({ ...issue, ...req.request.body });
        render();
        expect(kpi('open') + kpi('resolved')).toBe(kpi('total'));
      }

      expect(kpi('open')).toBe(2);
      expect(kpi('resolved')).toBe(3);
    });

    it('restores the previous status and informs the user when the update fails', () => {
      buttonByLabel('Mark “Stock discrepancy detected” as resolved').click();
      render();
      http.expectOne('/api/issues/T-1').flush('Conflict', { status: 409, statusText: 'Conflict' });
      render();

      expect(kpi('open')).toBe(3);
      expect(kpi('resolved')).toBe(2);
      expect(buttonByLabel('Mark “Stock discrepancy detected” as resolved')).toBeTruthy();
      expect(root.querySelector('[role="alert"]')?.textContent).toContain('Could not update');
    });
  });
});
