import { useState, useEffect } from 'react';
import formatDate from 'date-fns/format';
import parseDate from 'date-fns/parse';
import addDays from 'date-fns/addDays';
import DetailedRouteSearchParams from '../model/get-quotes/DetailedRouteSearchParams';

const stringifyReplacer = (key: string, value: any) => {
  if (key === 'date') {
    const dateToParse = value ? value : addDays(new Date(), 2);
    return formatDate(dateToParse, 'yyyy-MM-dd');
  } else {
    return value;
  }
};

const useLocalStorage = (key: any, initialValue: DetailedRouteSearchParams, useRawValues: boolean) => {
  const [value, setValue] = useState(() => {
    try {
      const localStorageValue = localStorage.getItem(key);
      if (typeof localStorageValue !== 'string') {
        localStorage.setItem(
          key,
          useRawValues ? String(initialValue) : JSON.stringify(initialValue, stringifyReplacer),
        );
        return initialValue;
      } else {
        return useRawValues
          ? localStorageValue
          : JSON.parse(localStorageValue || 'null', (key, value) => {
              if (key === 'date') {
                return value ? value : parseDate(value, 'yyyy-MM-dd', addDays(new Date(), 2));
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
      localStorage.setItem(key, serializedState);
    } catch (e) {}
  });

  return [value, setValue];
};

export default useLocalStorage;
