import formatDate from 'date-fns/format';
import { formatDistanceToNow } from 'date-fns';

export enum DateFormats {
  SHORT_HUMAN = 'd. MMMM',
  SHORT = 'dd.MM',
  LONG = 'dd.MM.yyyy',
}

export const formatDateSafe = (date: Date, dateFormat: DateFormats | string) => {
  if (date) {
    try {
      return formatDate(date, dateFormat);
    } catch (err) {
      return date; // this is not a date
    }
  } else {
    return '???';
  }
};

export const formatDistanceToNowConfigured = (date: Date) =>
  formatDistanceToNow(date, { includeSeconds: true, addSuffix: true });
