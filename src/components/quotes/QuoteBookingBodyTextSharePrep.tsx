import formatDate from 'date-fns/format';
import { Quote } from '../../providers/QuotesEndpoint';
import firebase from '../../firebase';
import UserRecord from '../../model/UserRecord';

export const quoteInfoEmailBody = (quote: Quote): string => {
  const cargoDetailsString: string = quote.containers
    .flatMap(
      (container, i) =>
        ' - ' +
        (container.quantity > 1 ? container.quantity + ' x ' : '') +
        container!.containerType?.description +
        ', ' +
        container?.commodityType?.name +
        '\n',
    )
    .join('');

  return [
    'Dear Sirs,',
    'I want to request a booking based on the following quote received:',
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
          'body=' + encodeURI(quoteInfoEmailBody(quote)),
        ].join('&'),
      )
    );
  } else return mailtoAddress;
};
