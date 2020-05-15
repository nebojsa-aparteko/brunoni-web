import React, { Fragment } from 'react';
import { Box, Paper, Typography } from '@material-ui/core';
import theme from '../../theme';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import { DateFormats, formatDateSafe } from '../../utilities/formattingHelpers';

const SeparatorArrow = () => (
  <Box mx={4} display="flex" flexDirection="column" alignItems="center">
    →
  </Box>
);

const VesselVoyageItem: React.FC<Props> = ({ vessel, items }) => {
  const entries = Object.entries(items);

  return (
    <Paper style={{ padding: 4, marginBottom: 4 }}>
      <Box display="flex" my={2}>
        <Box display="flex" alignItems="center">
          <DirectionsBoatIcon style={{ marginRight: theme.spacing(1) }} />
          <Typography style={{ width: theme.spacing(30) }}>{vessel}</Typography>
        </Box>
        {entries.map(([pol, items]: any, index: number) => (
          <Fragment key={`${vessel}-${pol}`}>
            {index > 0 && <SeparatorArrow />}
            <Box display="flex" flexDirection="column" mx={2} style={{ width: theme.spacing(15) }}>
              <Typography variant="subtitle1">{pol}</Typography>
              <Typography variant="body1">{`ETS ${formatDateSafe(items?.[0].ets, DateFormats.LONG)}`}</Typography>
            </Box>
          </Fragment>
        ))}
        {entries[entries.length - 1][1][0].pod && (
          <Fragment>
            <SeparatorArrow />
            <Box display="flex" flexDirection="column" mx={2} style={{ width: theme.spacing(15) }}>
              <Typography variant="subtitle1">{entries[entries.length - 1][1][0].pod}</Typography>
              <Typography variant="body1">{`ETA ${formatDateSafe(
                entries[entries.length - 1][1][0].eta,
                DateFormats.LONG,
              )}`}</Typography>
            </Box>
          </Fragment>
        )}
      </Box>
    </Paper>
  );
};

export default VesselVoyageItem;

interface Props {
  vessel: string;
  items: any[];
}
