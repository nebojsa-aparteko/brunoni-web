import { useEffect, useState } from 'react';
import useUser from './useUser';

export default function useEndpoint<B, T>(uri: string, bodyTransform: (body: B) => T, initialResults: T) {
  const [user] = useUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState();
  const [request, setRequest] = useState(0);

  useEffect(() => {
    if (!user) {
      if (busy) setBusy(false);
      if (error !== undefined) setError(undefined);
      if (result !== initialResults) setResult(initialResults);
      if (request !== 0) setRequest(0);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        const token = await user.getIdToken();

        const response = await fetch(`${process.env.REACT_APP_API_URL}${uri}`, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal,
        });

        if (response.ok) {
          const body = await response.json();
          setResult(bodyTransform(body as B));
        } else {
          const body = await response.json();
          setError(body.error);
          console.error(`Failed to request ${uri}`, response, body);
        }
      } catch (e) {
        setError('Something went wrong. Please try again later.');
        console.error('Failed to request the login email', e);
      } finally {
        setBusy(false);
      }
    })();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, uri, request, bodyTransform]);

  const refresh = () => setRequest(request + 1);

  return { busy, error, result: result || initialResults, refresh };
}
