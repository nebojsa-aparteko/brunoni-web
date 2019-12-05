import { useState, useEffect } from 'react';
import formatDate from 'date-fns/format';
import parseDate from 'date-fns/parse';
import addDays from 'date-fns/addDays';
import parseISO from 'date-fns/parseISO';
import DetailedRouteSearchParams from '../model/get-quotes/DetailedRouteSearchParams';

const stringifyReplacer = (key: string, value: any) => {
  if (key === 'date') {
    const dateToParse = value ? (typeof value === 'string' ? parseISO(value) : value) : addDays(new Date(), 2);
    return formatDate(dateToParse, 'yyyy-MM-dd');
  } else {
    return value;
  }
};

const clearLocalStorageAfter = (lastSavedKey: string, minutes: number) => {
  const lastSavedKeyValue = localStorage.getItem(lastSavedKey);
  let saved = lastSavedKeyValue ? parseInt(lastSavedKeyValue) : new Date().getTime();
  if (saved && new Date().getTime() - saved > minutes * 60 * 1000) {
    console.log('clearing local storage');
    localStorage.clear();
  }
};

const useLocalStorage = (key: any, initialValue: any, useRawValues: boolean, timeoutMinutes: number = 5) => {
  const [value, setValue] = useState(() => {
    try {
      clearLocalStorageAfter(key + '_saved', timeoutMinutes);
      const localStorageValue = localStorage.getItem(key);
      if (typeof localStorageValue !== 'string') {
        localStorage.setItem(
          key,
          useRawValues ? String(initialValue) : JSON.stringify(initialValue, stringifyReplacer),
        );
        localStorage.setItem(key + '_saved', new Date().getTime().toString());
        return initialValue;
      } else {
        return useRawValues
          ? localStorageValue
          : JSON.parse(localStorageValue || 'null', (key, value) => {
              if (key === 'date') {
                return value ? parseDate(value, 'yyyy-MM-dd', addDays(new Date(), 2)) : value;
              } else {
                return value;
              }
            });
      }
    } catch (e) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const serializedState = useRawValues ? String(value) : JSON.stringify(value, stringifyReplacer);
      clearLocalStorageAfter(key + '_saved', timeoutMinutes);
      localStorage.setItem(key, serializedState);
      localStorage.setItem(key + '_saved', new Date().getTime().toString());
    } catch (e) {}
  });

  return [value, setValue];
};

export default useLocalStorage;
