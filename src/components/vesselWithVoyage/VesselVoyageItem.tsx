import React from 'react';
import { Box, Typography } from '@material-ui/core';
import formatDate from 'date-fns/format';
import theme from '../../theme';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';

const VesselVoyageItem: React.FC<Props> = ({ vessel, items }) => {
  return (
    <Box display="flex" my={2}>
      <Box display="flex" alignItems="center">
        <DirectionsBoatIcon style={{ marginRight: theme.spacing(1) }} />
        <Typography style={{ width: theme.spacing(30) }}>{vessel}</Typography>
      </Box>
      {Object.entries(items).map(([pol, items]: any, index: number) => (
        <Box display="flex" flexDirection="column" mx={2} style={{ width: theme.spacing(15) }} key={`${vessel}-${pol}`}>
          <Typography>{pol}</Typography>
          <Typography>{`ETS ${formatDate(items?.[0].ets || new Date(), 'd. MMMM yyyy')}`}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default VesselVoyageItem;

interface Props {
  vessel: string;
  items: any[];
}
