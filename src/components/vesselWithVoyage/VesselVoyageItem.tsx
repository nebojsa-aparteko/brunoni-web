import React, { Fragment, useMemo } from 'react';
import { Box, Paper, Typography } from '@material-ui/core';
import theme from '../../theme';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import { DateFormats, formatDateSafe } from '../../utilities/formattingHelpers';
import VesselWithVoyage from '../../model/VesselWithVoyage';
import VesselAllocationButton from '../vesselAllocation/VesselAllocationButton';
import { RouteSearchResultVoyageInfo } from '../../model/route-search/RouteSearchResults';
import VesselFullyBookedSwitch from '../VesselFullyBookedSwitch';

const SeparatorArrow = () => (
  <Box mx={4} display="flex" flexDirection="column" alignItems="center">
    →
  </Box>
);

const findCarrierId = (items: any[]) => {
  const obj = items.find(u => u.erpCarrierId && u.erpServiceId);
  return obj ? `${obj.erpCarrierId} ${obj.erpServiceId}` : undefined;
};

const VesselVoyageItem: React.FC<Props> = ({ vessel, items, handleDialogOpen }) => {
  const entries = useMemo(() => Object.entries(items), [items]);

  const vesselItems = useMemo(
    () =>
      Object.entries(items)
        .map(i => i[1])
        .flat() as VesselWithVoyage[],
    [items],
  );

  const voyageInfo = useMemo(
    () =>
      vesselItems && vesselItems.length > 0
        ? ({
            VesselName: vesselItems[0].vesselWithVoyage
              ?.split(' ')
              .slice(0, -2)
              .join(' '),
            VoyageNr: vesselItems[0].vesselWithVoyage
              ?.split(' ')
              .slice(-2)
              .join(' '),
            Carrier: vesselItems[0].carrier,
          } as RouteSearchResultVoyageInfo)
        : undefined,
    [vesselItems],
  );
  const service = useMemo(
    () =>
      vesselItems && vesselItems.length > 0 ? vesselItems.find(item => item.erpServiceId)?.erpServiceId : undefined,
    [vesselItems],
  );

  const etsDate = useMemo(() => formatDateSafe(entries[entries.length - 1][1][0].ets, 'yyyy-MM-dd') as string, [
    entries,
  ]);

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
        {voyageInfo && (
          <Box mr={4} ml="auto" display="flex">
            <VesselFullyBookedSwitch vessel={vessel} />
            <VesselAllocationButton
              vesselVoyage={voyageInfo}
              service={service}
              POL={entries[entries.length - 1][1][0].pol}
              etsDate={etsDate}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default VesselVoyageItem;

interface Props {
  vessel: string;
  items: any[];
  handleDialogOpen: (item: VesselWithVoyage[], vessel: string) => void;
}
