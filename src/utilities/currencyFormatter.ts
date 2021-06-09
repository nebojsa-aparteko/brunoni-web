import { Currency } from '../model/Payment';

const formatUSDCurrency = (amount: number) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);

const formatEURCurrency = (amount: number) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);

const formatCHFCurrency = (amount: number): string =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
  }).format(amount);

export const formatCurrencyAmount = (amount: number, locale?: string): string =>
  new Intl.NumberFormat(locale || 'de-CH', {
    minimumFractionDigits: 2,
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
