import React, { Fragment, useMemo } from 'react';
import { Box, Paper, Typography } from '@material-ui/core';
import theme from '../../theme';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import { DateFormats, formatDateSafe } from '../../utilities/formattingHelpers';
import VesselWithVoyage from '../../model/VesselWithVoyage';

const SeparatorArrow = () => (
  <Box mx={4} display="flex" flexDirection="column" alignItems="center">
    →
  </Box>
);

const findCarrierId = (items: any[]) => {
  const obj = items.find(u => u.erpCarrierId && u.erpServiceId);
  return obj ? `${obj.erpCarrierId} ${obj.erpServiceId}` : undefined;
};

const VesselVoyageItem: React.FC<Props> = ({ vessel, items, expanded, handleExpand, handleDialogOpen }) => {
  const entries = useMemo(() => Object.entries(items), [items]);
  const vesselItems = useMemo(() => Object.entries(items).map(i => i[1])[0] as VesselWithVoyage[], [entries]);

  return (
    <Paper
      style={{ padding: 4, marginBottom: 4, cursor: 'pointer' }}
      onClick={() => handleDialogOpen(vesselItems, vessel)}
    >
      <Box display="flex" my={2}>
        <Box display="flex" alignItems="center">
          <DirectionsBoatIcon style={{ marginRight: theme.spacing(1) }} />
          <Box display="flex" flexDirection="column">
            <Typography style={{ width: theme.spacing(30) }}>{vessel}</Typography>
            {findCarrierId(entries[0][1]) && (
              <Typography style={{ width: theme.spacing(30) }}>{findCarrierId(entries[0][1])}</Typography>
            )}
          </Box>
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
  expanded: string | false;
  handleExpand: (name: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => void;
  handleDialogOpen: (item: VesselWithVoyage[], vessel: string) => void;
}
