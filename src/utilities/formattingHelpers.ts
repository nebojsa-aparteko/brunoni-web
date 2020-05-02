import formatDate from 'date-fns/format';

export enum DateFormats {
  SHORT_HUMAN = 'd. MMMM',
  SHORT = 'dd.MM',
  LONG = 'dd.MM.yyyy',
}

export const formatDateSafe = (date: Date, dateFormat: DateFormats) => {
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
