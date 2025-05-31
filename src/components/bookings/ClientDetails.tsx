import React from 'react';
import UserRecord from '../../model/UserRecord';

export interface ClientDetails {
  forwarder?: UserRecord;
  bkgRef?: string;
}

export const ClientDetails: React.FC<ClientDetails> = ({ forwarder }) => {
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
