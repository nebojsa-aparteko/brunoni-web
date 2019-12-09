import formatDate from 'date-fns/format';
import flatMap from 'lodash/fp/flatMap';
import firebase from '../../firebase';
import UserRecord from '../../model/UserRecord';
import { Quote } from '../../providers/QuoteGroups';
import Container from '../../model/Container';

export const quoteInfoEmailBody = (quote: Quote, firstLine: string): string => {
  const cargoDetailsString: string = flatMap(
    (container: Container) =>
      ' - ' +
      (container.quantity > 1 ? container.quantity + ' × ' : '') +
      container!.containerType?.description +
      ', ' +
      container?.commodityType?.name +
      '\n',
  )(quote.containers).join('');

  return [
    'Dear Sirs,',
    firstLine,
    `Quote Date: ${formatDate(quote.dateIssued, 'dd.MM.yyyy')} \n` +
      `Quote Number: ${quote.id} \n` +
      `Quote Reference: ${quote.clientId} \n` +
      `Port of Loading: ${quote.origin.city}, ${quote.origin.country} \n` +
      `Port of Discharge: ${quote.destination.city}, ${quote.destination.country} \n` +
      `Carrier: ${quote.carrier.name || quote.carrier.id} \n` +
      `Quote Validity: ${formatDate(quote.validityPeriod.from, 'd. MMMM')} – ${formatDate(
        quote.validityPeriod.to,
        'd. MMMM',
      )}`,
    'Cargo Details: ',
    cargoDetailsString,
  ].join('\n\n');
};

export const buildMailToLink = (quote: Quote | undefined, [user, userData]: [firebase.User, UserRecord]) => {
  const mailtoAddress =
    process.env.REACT_APP_BRAND === 'brunoni' ? 'mailto:platform@mybrunoni.ch' : 'mailto:platform@myallmarine.ch';
  if (quote) {
    return (
      mailtoAddress +
      '?'.concat(
        [
          'subject=' +
            encodeURI(
              'Request booking - ' +
                (quote.carrier.name || quote.carrier.id) +
                ', ' +
                quote.origin.city +
                ' → ' +
                quote.destination.city,
            ),
          'body=' +
            encodeURI(quoteInfoEmailBody(quote, 'I want to request a booking based on the following quote received:')),
        ].join('&'),
      )
    );
  } else return mailtoAddress;
};

export const buildSpecialRequestLink = (quote: Quote | undefined, [user, userData]: [firebase.User, UserRecord]) => {
  const mailtoAddress =
    process.env.REACT_APP_BRAND === 'brunoni' ? 'mailto:platform@mybrunoni.ch' : 'mailto:platform@myallmarine.ch';
  if (quote) {
    return (
      mailtoAddress +
      '?'.concat(
        [
          'subject=' +
            encodeURI(
              'Special request for quote - ' +
                (quote.carrier.name || quote.carrier.id) +
                ', ' +
                quote.origin.city +
                ' → ' +
                quote.destination.city,
            ),
          'body=' +
            encodeURI(
              quoteInfoEmailBody(
                quote,
                'I want to file a special request for the following quote received:\n\n<<TYPE IN YOUR SPECIAL REQUEST HERE>>',
              ),
            ),
        ].join('&'),
      )
    );
  } else return mailtoAddress;
};
