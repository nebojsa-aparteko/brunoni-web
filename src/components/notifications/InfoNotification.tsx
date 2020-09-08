import { Box, Typography } from '@material-ui/core';
import React from 'react';
import { InfoType, InfoTypeDescription } from '../../model/Notification';

const makeInfoTypeText = (type: InfoType) => {
  return Object.entries(InfoTypeDescription).find(t => t[0] === type)?.[1] || '-';
};

const InfoNotification: React.FC<Props> = ({ infoType }) => (
  <Box>
    <Typography>{makeInfoTypeText(infoType)}</Typography>
  </Box>
);

export default InfoNotification;

interface Props {
  infoType: InfoType;
}
