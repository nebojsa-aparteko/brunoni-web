import { useEffect, useState } from 'react';
import { format, utcToZonedTime } from 'date-fns-tz';

interface Timezone {
  city: string;
  timeZone: string;
}

export const CLOCKS: Timezone[] = [
  {
    city: 'Auckland',
    timeZone: 'Pacific/Auckland',
  },
  {
    city: 'Dubai',
    timeZone: 'Asia/Dubai',
  },
  {
    city: 'Durban',
    timeZone: 'Africa/Durban',
  },
  {
    city: 'Hamburg',
    timeZone: 'Europe/Hamburg',
  },
  {
    city: 'Houston',
    timeZone: 'America/Houston',
  },
  {
    city: 'Istanbul',
    timeZone: 'Europe/Istanbul',
  },
  {
    city: 'Lagos',
    timeZone: 'Africa/Lagos',
  },
  {
    city: 'London',
    timeZone: 'Europe/London',
  },
  {
    city: 'Los Angeles',
    timeZone: 'America/Los_Angeles',
  },
  {
    city: 'Mumbai',
    timeZone: 'Asia/Calcutta',
  },
  {
    city: 'New York',
    timeZone: 'America/New_York',
  },
  {
    city: 'Ningbo',
    timeZone: 'Asia/Ningbo',
  },
  {
    city: 'Santos',
    timeZone: 'America/Santos',
  },
  {
    city: 'San Antonio (Chile)',
    timeZone: 'America/Santiago',
  },
  {
    city: 'Shanghai',
    timeZone: 'Asia/Shanghai',
  },
  {
    city: 'Singapore',
    timeZone: 'Asia/Singapore',
  },
  {
    city: 'Sydney',
    timeZone: 'Australia/Sydney',
  },
  {
    city: 'Tokyo',
    timeZone: 'Asia/Tokyo',
  },
  {
    city: 'Zurich',
    timeZone: 'Europe/Zurich',
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
