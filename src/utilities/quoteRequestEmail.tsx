import formatDate from 'date-fns/format';
import flatMap from 'lodash/fp/flatMap';
import DetailedRouteSearchParams from '../model/get-quotes/DetailedRouteSearchParams';
import { getLocationLabel } from '../components/inputs/LocationInput';
import IMO from '../model/IMO';
import OOG from '../model/OOG';
import Container from '../model/Container';
import ContainerDetails from '../model/ContainerDetails';

const renderIMO = (imo: IMO) => `   IMO Class ${imo.IMOClass}, UN Number: ${imo.UNNumber}, PG Number: ${imo.PGNumber}`;

const renderOOG = (oog: OOG) =>
  `   Out of gauge item ${oog.length}×${oog.width}×${oog.height} [cm] (W×H×L), ${oog.weight} [kg]`;

export const createEmailBody = (searchParams: DetailedRouteSearchParams): string => {
  const cargoDetailsString: string = flatMap(
    (container: Container & ContainerDetails) =>
      ' - ' +
      (container.quantity > 1 ? container.quantity + ' × ' : '') +
      container!.containerType?.description +
      ', ' +
      container?.commodityType?.name +
      '\n' +
      (container.pickupLocation ? `   Depot Location: ${getLocationLabel(container.pickupLocation)}\n` : '') +
      ((container.imo[1] || []).map(renderIMO).join('\n') + '\n') +
      ((container.oog[1] || []).map(renderOOG).join('\n') + '\n'),
  )(searchParams.containers).join('\n');

  return `Dear Sirs,

I want to request a quote with following contents:

Origin Port: ${searchParams.originPort!.city} - ${searchParams.originPort!.country} (${searchParams.originPort!.id})
Destination Port: ${searchParams.destinationPort!.city} - ${searchParams.destinationPort!.country} (${
    searchParams.destinationPort!.id
  })
Starting from ${formatDate(searchParams.date, 'dd.MM.yyyy')} throughout following ${
    searchParams.weeks > 1 ? `${searchParams.weeks} weeks` : 'week'
  }

Cargo Details:

${cargoDetailsString}`;
};

export const buildMailToLink = (searchParams: DetailedRouteSearchParams) => {
  const mailtoAddress =
    process.env.REACT_APP_BRAND === 'brunoni' ? 'mailto:platform@mybrunoni.ch' : 'mailto:platform@myallmarine.ch';
  return (
    mailtoAddress +
    '?'.concat(
      [
        'subject=' +
          encodeURI('Request quote - ' + searchParams.originPort!.city + ' → ' + searchParams.destinationPort!.city),
        'body=' + encodeURI(createEmailBody(searchParams)),
      ].join('&'),
    )
  );
};
