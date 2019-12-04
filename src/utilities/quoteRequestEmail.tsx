import formatDate from 'date-fns/format';
import DetailedRouteSearchParams from '../model/get-quotes/DetailedRouteSearchParams';
import { getLocationLabel } from '../components/inputs/LocationInput';
import IMO from '../model/IMO';
import OOG from '../model/OOG';

const renderIMO = (imo: IMO) => `   IMO Class ${imo.IMOClass}, UN Number: ${imo.UNNumber}, PG Number: ${imo.PGNumber}`;

const renderOOG = (oog: OOG) =>
  `   Out of gauge item ${oog.width}×${oog.height}×${oog.length} [cm] (W×H×L), ${oog.weight} [kg]`;

export const createEmailBody = (searchParams: DetailedRouteSearchParams): string => {
  const cargoDetailsString: string = searchParams.containers
    .flatMap((container, i) => {
      return (
        ' - ' +
        (container.quantity > 1 ? container.quantity + ' x ' : '') +
        container!.containerType?.description +
        ', ' +
        container?.commodityType?.name +
        '\n' +
        (container.location ? `   Depot Location: ${getLocationLabel(container.location)}\n` : '') +
        ((container.imo[1] || []).map(renderIMO).join('\n') + '\n') +
        ((container.oog[1] || []).map(renderOOG).join('\n') + '\n')
      );
    })
    .join('\n');

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
