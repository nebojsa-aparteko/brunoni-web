import React from 'react';
import type { ClientDetails as ClientDetailsType } from './BookingSummary.types';

interface Props extends ClientDetailsType {}

export const ClientDetails: React.FC<Props> = ({ forwarder }) => {
  if (!forwarder) {
    return null;
  }

  return (
    <a href={`mailto:${forwarder.emailAddress}`}>
      {forwarder.firstName} {forwarder.lastName}
    </a>
  );
};

export default ClientDetails;
