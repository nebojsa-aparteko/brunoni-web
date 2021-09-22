import { useEffect, useState } from 'react';
import { format, utcToZonedTime } from 'date-fns-tz';

interface Timezone {
  city: string;
  timeZone: string;
}

export const CLOCKS: Timezone[] = [
  {
    city: 'L.A',
    timeZone: 'America/Los_Angeles',
  },
  {
    city: 'Houston',
    timeZone: 'US/Indiana-Starke',
  },
  {
    city: 'New York',
    timeZone: 'America/New_York',
  },
  {
    city: 'San Antonio',
    timeZone: 'America/Santiago',
  },
  {
    city: 'Santos',
    timeZone: 'America/Sao_Paulo',
  },
  {
    city: 'London',
    timeZone: 'Europe/London',
  },
  {
    city: 'Durban',
    timeZone: 'Africa/Bujumbura',
  },
  {
    city: 'Zurich',
    timeZone: 'Europe/Zurich',
  },
  {
    city: 'Istanbul',
    timeZone: 'Europe/Istanbul',
  },
  {
    city: 'Dubai',
    timeZone: 'Asia/Dubai',
  },
  {
    city: 'Mumbai',
    timeZone: 'Asia/Calcutta',
  },
  {
    city: 'Singapore',
    timeZone: 'Asia/Singapore',
  },
  {
    city: 'Shanghai',
    timeZone: 'Asia/Shanghai',
  },
  {
    city: 'Tokyo',
    timeZone: 'Asia/Tokyo',
  },
  {
    city: 'Sydney',
    timeZone: 'Australia/Sydney',
  },
  {
    city: 'Auckland',
    timeZone: 'Pacific/Auckland',
  },
];

const useZonedTime = () => {
  const [date, setDate] = useState(new Date());
  const pattern = 'EEE HH:mm';

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (timeZone: string) => {
    const zonedDate = utcToZonedTime(date, timeZone);
    return {
      zonedDate,
      formattedDate: format(zonedDate, pattern, { timeZone: timeZone }),
    };
  };
};

export default useZonedTime;
