import { DependencyList, useEffect, useMemo, useState } from 'react';
import isArray from 'lodash/fp/isArray';

export type Callback = (err?: Error, response?: Response, body?: any) => void;

export class RequestError extends Error {
  response: Response;
  body: any;

  constructor(response: Response, body: any) {
    super('Request returned bad response');

    this.response = response;
    this.body = body;

    Object.setPrototypeOf(this, RequestError.prototype);
  }
}

export default function useRequest<T>(
  requestProvider: () => RequestInfo | [RequestInfo, RequestInit & Omit<RequestInit, 'signal'>],
  deps: DependencyList | undefined,
  timeoutInSeconds?: number,
): [boolean, Error | null, T | null, (callback: Callback) => void] {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [action, setAction] = useState<{ callback?: Callback } | undefined>();

  const request = useMemo(requestProvider, deps);

  const invoke = (callback: Callback) => setAction({ callback });

  useEffect(() => {
    if (!action) {
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    setBusy(true);
    setError(null);

    let timedOut = false;

    (async () => {
      try {
        const params: [RequestInfo, RequestInit] = isArray(request)
          ? [request[0], { ...request[1], signal }]
          : [request, { signal }];

        const timeout = timeoutInSeconds
          ? setTimeout(() => {
              timedOut = true;
              controller.abort();
            }, timeoutInSeconds * 1000)
          : null;

        const response = await fetch(...params);

        if (timeout) {
          clearTimeout(timeout);
        }

        const body = await response.json();

        if (response.status - (response.status % 100) === 200) {
          setResult(body as T);

          if (action.callback) {
            action.callback(undefined, response, body as T);
          }
        } else {
          const e = new RequestError(response, body);

          setError(e);

          if (action.callback) {
            action!.callback(e);
          }
        }
      } catch (e) {
        if (e.name !== 'AbortError' || timedOut) {
          setError(e);
        }

        if (action.callback) {
          action!.callback(e);
        }
      } finally {
        setBusy(false);

        setAction(undefined);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [action, request, timeoutInSeconds]);

  return [busy, error, result, invoke];
}
