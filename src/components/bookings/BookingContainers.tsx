import React, { useMemo, Fragment } from 'react';
import { Grid, Typography, ListItem, Box, makeStyles, ListItemIcon, ListItemText, SvgIcon } from '@material-ui/core';
import List from '@material-ui/core/List';
import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
import identity from 'lodash/fp/identity';
import map from 'lodash/fp/map';
import get from 'lodash/fp/get';
import uniqBy from 'lodash/fp/uniqBy';
import Container from '../../model/Container';
import { CargoDetail } from '../../model/Booking';
import CommodityType from '../../model/CommodityType';
import { getLocationLabel } from '../inputs/LocationInput';
import DepotLocationIcon from '@material-ui/icons/LocalShipping';
import { ReactComponent as ContainerIconSVG } from '../../assets/container.svg';
import { ReactComponent as PackageIconSVG } from '../../assets/package.svg';

interface Props {
  cargoDetail: CargoDetail;
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
  cargoDetails: {
    paddingTop: 0,
    paddingBottom: 0,
  },
}));

const BookingContainers: React.FC<Props> = ({ cargoDetail }) => {
  const classes = useStyles();

  const quantity = (cargoDetail.CtrQuantity && cargoDetail.CommodityTXT) ? `${cargoDetail.CtrQuantity} × ${cargoDetail.CommodityTXT}` : null;

  return (
    <Grid item xs={12}>
      <Typography variant="subtitle2">
        <Box display="inline" alignItems="center" component="span" fontWeight="fontWeightBold">
          Cargo details:
        </Box>
      </Typography>
      <List dense>
        <Fragment>
          {quantity ? (
            <ListItem disableGutters>
              <ListItemIcon>
                <SvgIcon component={ContainerIconSVG} viewBox="0 0 512 512" />
              </ListItemIcon>
              <ListItemText
                primary={quantity}
                primaryTypographyProps={{ variant: 'body1' }}
              />
            </ListItem>
          ) : null}

          {cargoDetail.CargoDetailRermarks ? (
            <ListItem disableGutters className={classes.cargoDetails}>
              <ListItemIcon>
                <SvgIcon component={PackageIconSVG} viewBox="0 0 473.8 473.8" />
              </ListItemIcon>
              <ListItemText
                secondary={cargoDetail.CargoDetailRermarks}
              />
            </ListItem>
          ) : null}
        </Fragment>
      </List>
    </Grid>
  );
};

export default BookingContainers;
