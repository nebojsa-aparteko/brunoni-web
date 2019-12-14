import formatDate from 'date-fns/format';
import flatMap from 'lodash/fp/flatMap';
import firebase from '../../firebase';
import UserRecord from '../../model/UserRecord';
import { Quote } from '../../providers/QuoteGroups';
import Container from '../../model/Container';
import { portLongFormatLabel, portShortFormatLabel } from '../../utilities/formattedPortDisplay';
import { getLocationLabel } from '../inputs/LocationInput';

export const quoteInfoEmailBody = (quote: Quote, firstLine: string, userData: UserRecord): string => {
  const cargoDetailsString: string = flatMap(
    (container: Container) =>
      ' - ' +
      (container.quantity > 1 ? container.quantity + ' × ' : '') +
      container!.containerType?.description +
      ', ' +
      container?.commodityType?.name +
      (container.pickupLocation ? `\n   Depot Location: ${getLocationLabel(container.pickupLocation)}` : '') +
      '\n   WEIGHT:' +
      '\n   PICK UP DATE:\n',
  )(quote.containers).join('\n');

  return [
    'Dear Sirs,',
    firstLine,
    `Quote Date: ${formatDate(quote.dateIssued, 'dd.MM.yyyy')} \n` +
      `Quote Number: ${quote.id} \n` +
      `Company: ${userData.company.name}, ${userData.company.city} \n\n` +
      `Port of Loading: ${portLongFormatLabel(quote.origin)} \n` +
      `Port of Discharge: ${portLongFormatLabel(quote.destination)} \n` +
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
                portShortFormatLabel(quote.origin) +
                ' → ' +
                portShortFormatLabel(quote.destination),
            ),
          'body=' +
            encodeURI(
              quoteInfoEmailBody(quote, 'I want to request a booking based on the following quote received:', userData),
            ),
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
                portShortFormatLabel(quote.origin) +
                ' → ' +
                portShortFormatLabel(quote.destination),
            ),
          'body=' +
            encodeURI(
              quoteInfoEmailBody(
                quote,
                'I want to file a special request for the following quote received:\n\n<<TYPE IN YOUR SPECIAL REQUEST HERE>>',
                userData,
              ),
            ),
        ].join('&'),
      )
    );
  } else return mailtoAddress;
};
