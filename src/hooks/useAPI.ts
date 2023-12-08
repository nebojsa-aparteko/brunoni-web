import { useState } from 'react';
import useUser from './useUser';

interface Object {
  [key: string]: any;
}

const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [user] = useUser();
  return {
    loading,
    get: async (route: string, params?: Object) => {
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const url = `${process.env.REACT_APP_API_URL}/${route}?${new URLSearchParams(params)}`;
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        setLoading(false);
        if (response.ok) {
          return await response.json();
        } else {
          console.error(`Failed to request:`, response.status, response.statusText);
          return [];
        }
      } catch (e) {
        setLoading(false);
        console.error('Failed to perform request', e);
        return [];
      }
    },
    post: async (route: string, obj: Object) => {
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/${route}`, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(obj),
        });
        setLoading(false);
        if (response.ok) {
          return await response.json();
        } else {
          console.error(`Failed to request:`, response.status, response.statusText);
          return [];
        }
      } catch (e) {
        setLoading(false);
        console.error('Failed to perform request ', e);
        return [];
      }
    },
  };
};

export default useAPI;
