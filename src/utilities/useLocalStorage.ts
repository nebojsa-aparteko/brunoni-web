import { useState, useEffect } from 'react';
import formatDate from 'date-fns/format';
import parseDate from 'date-fns/parse';
import addDays from 'date-fns/addDays';
import parseISO from 'date-fns/parseISO';

// This is very specific implementation that handles object that are being passed to it specifically beacuse of dates being matched
// by the key and not by the type.

const stringifyReplacer = (key: string, value: any) => {
  if (key === 'date' || key === 'startDate' || key === 'endDate') {
    const dateToParse = value ? (typeof value === 'string' ? parseISO(value) : value) : addDays(new Date(), 2);
    return formatDate(dateToParse, 'yyyy-MM-dd HH:mm:ss');
  } else {
    return value;
  }
};

const clearLocalStorageAfter = (lastSavedKey: string, minutes: number) => {
  if (minutes === -1) return;
  const lastSavedKeyValue = localStorage.getItem(lastSavedKey);
  let saved = lastSavedKeyValue ? parseInt(lastSavedKeyValue) : new Date().getTime();
  if (saved && new Date().getTime() - saved > minutes * 60 * 1000) {
    localStorage.clear();
  }
};

const fixUpDateValue = (value: string, startOfDay: boolean = false) => {
  return value.length === 10 ? (startOfDay ? value.concat(' 23:59:59') : value.concat(' 00:00:00')) : value;
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
              if (key === 'date' || key === 'startDate' || key === 'endDate') {
                return value
                  ? parseDate(fixUpDateValue(value, key !== 'endDate'), 'yyyy-MM-dd HH:mm:ss', addDays(new Date(), 2))
                  : value;
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
