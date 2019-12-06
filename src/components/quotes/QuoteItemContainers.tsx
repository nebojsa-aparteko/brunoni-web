import React, { useMemo } from 'react';
import { Grid, Typography, ListItem, Box, Chip, makeStyles } from '@material-ui/core';
import List from '@material-ui/core/List';
import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
import map from 'lodash/fp/map';
import get from 'lodash/fp/get';
import uniqBy from 'lodash/fp/uniqBy';
import Container from '../../model/Container';
import CommodityType from '../../model/CommodityType';
import { getLocationLabel } from '../inputs/LocationInput';
import PickupLocation from '../../model/PickupLocation';

interface Props {
  containers: Container[];
  commodityTypes?: CommodityType[];
}

const useStyles = makeStyles(theme => ({
  chip: {
    ['@media print']: {
      padding: theme.spacing(0),
      background: 'transparent',
      height: 'auto',

      '& > *': {
        padding: theme.spacing(0),
      },
    },
  },
}));

const QuoteItemContainers: React.FC<Props> = ({ containers, commodityTypes }) => {
  const classes = useStyles();

  const locations = useMemo(() => {
    return flow(
      map(get('pickupLocation')),
      filter(location => location.countryCode.trim() !== '0'),
      uniqBy('id'),
    )(containers);
  }, [containers]);
  console.log('locations', locations);
  return (
    <Grid item xs={12}>
      <Typography variant="subtitle2">
        <Box display="inline" alignItems="center" fontWeight="fontWeightBold">
          Cargo details:
        </Box>
      </Typography>
      <Typography variant="body2">
        <List dense={true}>
          {containers.map((container, i) => (
            <ListItem key={i} disableGutters>
              <Chip
                label={
                  (container.quantity > 1 ? container.quantity + ' × ' : '') +
                  container!.containerType?.description +
                  (container?.commodityType?.name ? `, ${container.commodityType.name}` : '')
                }
                className={classes.chip}
              />
            </ListItem>
          ))}
        </List>
      </Typography>
      {commodityTypes && commodityTypes.length > 0 && (
        <Box display="block" alignItems="center" mt={2}>
          <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>
            Commodity:
          </Typography>
          <Typography variant="body1">{commodityTypes.map(commodityType => commodityType.name).join(', ')}</Typography>
        </Box>
      )}
      {locations && locations.length > 0 && (
        <Box display="block" alignItems="center" mt={2}>
          <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>
            Depot Location:
          </Typography>
          <Box>
            {locations.map((location: PickupLocation) => (
              <Box>
                <Typography variant="body1">{getLocationLabel(location)}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Grid>
  );
};

export default QuoteItemContainers;
