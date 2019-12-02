import React, { Fragment } from 'react';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import formatDate from 'date-fns/format';

const paragraphStyles = {
  fontFamily: 'Calibri, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSize: '11pt',
};

const formatDateString = (date: string) => formatDate(new Date(date), 'dd.MM.yyyy');

interface Props {
  route: RouteSearchResult;
}

export const RouteInfoBodyHTML: React.FC<Props> = ({ route }) => (
  <Fragment>
    <p style={paragraphStyles}>
      {route.OriginInfo.VoyageInfo.VesselName} {route.OriginInfo.VoyageInfo.VoyageNr}
      <br />
      {route.OriginInfo.Port.HarbourName},{route.OriginInfo.Port.Land} ETS{' '}
      {formatDateString(route.OriginInfo.DepartureDate)}
      {route.IntermediatePortInfos.map((intermediatePort, index) => (
        <Fragment key={index}>
          <br />
          {intermediatePort.Port.HarbourName}, {intermediatePort.Port.Land} ETA{' '}
          {formatDateString(intermediatePort.ArrivalDate)}
          <br />
          {intermediatePort.VoyageInfo.VesselName} {intermediatePort.VoyageInfo.VoyageNr}
          <br />
          {intermediatePort.Port.HarbourName}, {intermediatePort.Port.Land} ETS{' '}
          {formatDateString(intermediatePort.DepartureDate)}
        </Fragment>
      ))}
      <br />
      {route.DestinationInfo.Port.HarbourName}, {route.DestinationInfo.Port.Land} ETA{' '}
      {formatDateString(route.DestinationInfo.ArrivalDate)}
      <br />
    </p>
    <p style={paragraphStyles}>
      {route.Deadlines.flatMap(deadline => (
        <Fragment>
          {deadline.Typ} closing - {deadline.Time}
          <br />
        </Fragment>
      ))}
    </p>
    <p style={paragraphStyles}>
      Origin Address:
      <br />
      <span dangerouslySetInnerHTML={{ __html: route.OriginInfo.Port.PortName }} />
    </p>
    <p style={paragraphStyles}>
      Destination Address:
      <br />
      <span dangerouslySetInnerHTML={{ __html: route.DestinationInfo.Port.PortName }} />
    </p>
    <p style={paragraphStyles}>
      Source:{' '}
      {process.env.REACT_APP_BRAND === 'brunoni' ? (
        <a href="https://mybrunoni.ch">mybrunoni.ch</a>
      ) : (
        <a href="https://myallmarine.ch">myallmarine.ch</a>
      )}
    </p>
    <p style={paragraphStyles}>
      ALL ETS/ETA DATES, PORTS AND ROTATIONS ARE GIVEN FOR INFORMATION ONLY AND ARE NOT LEGALLY BINDING. ALL DATA IS
      SUBJECT TO ALTERATION WITHOUT NOTICE.
    </p>
  </Fragment>
);

export const routeInfoBodyPlainText = (route: RouteSearchResult) => {
  return `${route.OriginInfo.VoyageInfo.VesselName} ${route.OriginInfo.VoyageInfo.VoyageNr}
${route.OriginInfo.Port.HarbourName}, ${route.OriginInfo.Port.Land} ETS ${formatDateString(
    route.OriginInfo.DepartureDate,
  )}
${route.IntermediatePortInfos.map(
  (intermediatePort, index) =>
    `${intermediatePort.Port.HarbourName}, ${intermediatePort.Port.Land} ETA ${formatDateString(
      intermediatePort.ArrivalDate,
    )}
${intermediatePort.VoyageInfo.VesselName} ${intermediatePort.VoyageInfo.VoyageNr}
${intermediatePort.Port.HarbourName}, ${intermediatePort.Port.Land} ETS ${formatDateString(
      intermediatePort.DepartureDate,
    )}`,
)}
${route.DestinationInfo.Port.HarbourName}, ${route.DestinationInfo.Port.Land} ETA ${formatDateString(
    route.DestinationInfo.ArrivalDate,
  )}

${route.Deadlines.flatMap(deadline => {
  return `${deadline.Typ} closing - ${deadline.Time}`;
})
  .toString()
  .split(',')
  .join('\n')}

Origin Address:
${route.OriginInfo.Port.PortName.split('<br/> ').join('\n')}

Destination Address:
${route.DestinationInfo.Port.PortName.split('<br/> ').join('\n')}

Source: ${process.env.REACT_APP_BRAND === 'brunoni' ? 'https://mybrunoni.ch' : 'https://myallmarine.ch'}

ALL ETS/ETA DATES, PORTS AND ROTATIONS ARE GIVEN FOR INFORMATION ONLY AND ARE NOT LEGALLY BINDING. ALL DATA IS SUBJECT TO ALTERATION WITHOUT NOTICE.`;
};

export const routeInfoEmailBody = (route: RouteSearchResult) => {
  return [
    'Dear Sirs,',
    'I want to book the following route with this cargo specification:',
    '<< PLEASE TYPE HERE YOUR CARGO INFORMATION>>',
    'EQUIPMENT TYPE: \n' +
      'COMMODITY: \n' +
      'WEIGHT: \n' +
      'PICK UP DEPOT: \n' +
      'PICK UP DATE: \n' +
      'AGREEMENT NO.: ',
    'Schedule data follows: ',
    routeInfoBodyPlainText(route),
  ].join('\n\n');
};
