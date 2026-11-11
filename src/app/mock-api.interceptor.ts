import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';
import { Issue } from './models';
import { MOCK_ISSUES } from './mock-issues';

// Temporary in-memory backend until the Operations API is available.
// Add `?simulateError=true` to the page URL to simulate a failing API.
const LATENCY_MS = 600;

let db: Issue[] = MOCK_ISSUES.map((issue) => ({ ...issue }));

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/issues')) {
    return next(req);
  }

  const simulateError =
    typeof window !== 'undefined' && window.location.search.includes('simulateError=true');

  if (simulateError) {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 503,
          statusText: 'Service Unavailable',
          url: req.url,
        }),
    ).pipe(delay(LATENCY_MS));
  }

  if (req.method === 'GET' && req.url === '/api/issues') {
    return of(new HttpResponse({ status: 200, body: db.map((issue) => ({ ...issue })) })).pipe(
      delay(LATENCY_MS),
    );
  }

  if (req.method === 'PATCH') {
    const id = req.url.split('/').pop();
    const existing = db.find((issue) => issue.id === id);
    if (!existing) {
      return throwError(
        () => new HttpErrorResponse({ status: 404, statusText: 'Not Found', url: req.url }),
      ).pipe(delay(LATENCY_MS));
    }
    const updated: Issue = { ...existing, ...(req.body as Partial<Issue>) };
    db = db.map((issue) => (issue.id === id ? updated : issue));
    return of(new HttpResponse({ status: 200, body: { ...updated } })).pipe(delay(LATENCY_MS));
  }

  return next(req);
};
