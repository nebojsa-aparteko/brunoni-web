import React, { Fragment } from 'react';
import {
  Grid,
  Typography,
  ListItem,
  Box,
  makeStyles,
  ListItemIcon,
  ListItemText,
  SvgIcon,
} from '@material-ui/core';
import List from '@material-ui/core/List';
// import flow from 'lodash/fp/flow';
// import filter from 'lodash/fp/filter';
// import identity from 'lodash/fp/identity';
// import map from 'lodash/fp/map';
// import get from 'lodash/fp/get';
// import uniqBy from 'lodash/fp/uniqBy';
import Container from '../../model/Container';
import CommodityType from '../../model/CommodityType';
import { getLocationLabel } from '../inputs/LocationInput';
import DepotLocationIcon from '@material-ui/icons/LocalShipping';
import { ReactComponent as ContainerIconSVG } from '../../assets/container.svg';
import { ReactComponent as PackageIconSVG } from '../../assets/package.svg';

interface Props {
  containers: Container[];
  commodityTypes?: CommodityType[];
}

const mediaPrint = '@media print';
const useStyles = makeStyles(theme => ({
  chip: {
    [mediaPrint]: {
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

const QuoteItemContainers: React.FC<Props> = ({ containers, commodityTypes }) => {
  const classes = useStyles();

  // const locations = useMemo(
  //   () =>
  //     flow(
  //       map(get('location')),
  //       filter(identity),
  //       filter(location => location.countryCode.trim() !== '0'),
  //       uniqBy('id'),
  //     )(containers),
  //   [containers],
  // );

  return (
    <Grid item xs={12}>
      <Typography variant="subtitle2">
        <Box display="inline" alignItems="center" component="span" fontWeight="fontWeightBold">
          Cargo details:
        </Box>
      </Typography>
      <List dense>
        {containers.map((container, i) => (
          <Fragment key={i}>
            <ListItem disableGutters>
              <ListItemIcon>
                <SvgIcon component={ContainerIconSVG} viewBox="0 0 512 512" />
              </ListItemIcon>
              <ListItemText
                primary={
                  (container.quantity > 1 ? container.quantity + ' × ' : '') +
                  (container!.containerType?.description || container!.containerType?.id)
                }
                primaryTypographyProps={{ variant: 'body1' }}
              />
            </ListItem>

            {container.commodityType && (
              <ListItem disableGutters className={classes.cargoDetails}>
                <ListItemIcon>
                  <SvgIcon component={PackageIconSVG} viewBox="0 0 473.8 473.8" />
                </ListItemIcon>
                <ListItemText
                  secondary={
                    container.commodityType.id
                      ? container.commodityType.name || container.commodityType.id
                      : 'N/A'
                  }
                />
              </ListItem>
            )}

            {container.pickupLocation && (
              <ListItem disableGutters className={classes.cargoDetails}>
                <ListItemIcon>
                  <DepotLocationIcon />
                </ListItemIcon>
                <ListItemText secondary={getLocationLabel(container.pickupLocation)} />
              </ListItem>
            )}
            <ListItem />
          </Fragment>
        ))}
      </List>
      {/*{commodityTypes && commodityTypes.length > 0 && (*/}
      {/*  <Box display="block" alignItems="center" mt={2}>*/}
      {/*    <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>*/}
      {/*      Commodity:*/}
      {/*    </Typography>*/}
      {/*    <Typography variant="body1">{commodityTypes.map(commodityType => commodityType.name).join(', ')}</Typography>*/}
      {/*  </Box>*/}
      {/*)}*/}
      {/*{locations && locations.length > 0 && (*/}
      {/*  <Box display="block" alignItems="center" mt={2}>*/}
      {/*    <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>*/}
      {/*      Depot Location:*/}
      {/*    </Typography>*/}
      {/*    <Box>*/}
      {/*      {locations.map((location: PickupLocation, index:number) => (*/}
      {/*        <Box key={index}>*/}
      {/*          <Typography variant="body1">{getLocationLabel(location)}</Typography>*/}
      {/*        </Box>*/}
      {/*      ))}*/}
      {/*    </Box>*/}
      {/*  </Box>*/}
      {/*)}*/}
    </Grid>
  );
};

export default QuoteItemContainers;
