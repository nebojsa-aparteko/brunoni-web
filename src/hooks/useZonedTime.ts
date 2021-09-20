import { useEffect, useState } from 'react';
import { format, utcToZonedTime } from 'date-fns-tz';

interface Timezone {
  city: string;
  timeZone: string;
}

export const CLOCKS: Timezone[] = [
  {
    city: 'New York',
    timeZone: 'America/New_York',
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
    city: 'Shanghai',
    timeZone: 'Asia/Shanghai',
  },
  // {
  //   city: 'Ningbo',
  //   timeZone: 'Asia/Ningbo',
  // },
  {
    city: 'Singapore',
    timeZone: 'Asia/Singapore',
  },
  {
    city: 'Dubai',
    timeZone: 'Asia/Dubai',
  },
  {
    city: 'Istanbul',
    timeZone: 'Europe/Istanbul',
  },
  // {
  //   city: 'Durban',
  //   timeZone: 'Africa/Durban',
  // },
  {
    city: 'Hamburg',
    timeZone: 'Europe/Hamburg',
  },
  {
    city: 'Zurich',
    timeZone: 'Europe/Zurich',
  },
  {
    city: 'London',
    timeZone: 'Europe/London',
  },
  {
    city: 'Lagos',
    timeZone: 'Africa/Lagos',
  },
  // {
  //   city: 'Santos',
  //   timeZone: 'America/Santos',
  // },
  // {
  //   city: 'Houston',
  //   timeZone: 'America/Houston',
  // },
  {
    city: 'Los Angeles',
    timeZone: 'America/Los_Angeles',
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
