import { Currency } from '../model/WeeklyPayment';

const formatUSDCurrency = (amount: number) =>
  new Intl.NumberFormat('en-CH', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

const formatEURCurrency = (amount: number) =>
  new Intl.NumberFormat('en-CH', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);

const formatCHFCurrency = (amount: number) =>
  new Intl.NumberFormat('en-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(amount);

export default (currency: Currency) => (amount: number) => {
  switch (currency) {
    case Currency.CHF:
      return formatCHFCurrency(amount);
    case Currency.EUR:
      return formatEURCurrency(amount);
    case Currency.USD:
      return formatUSDCurrency(amount);
    default:
      return '-';
  }
};
