import React from 'react';
import { Grid, Typography, ListItem, Box, Chip, makeStyles } from '@material-ui/core';
import List from '@material-ui/core/List';
import Container from '../../model/Container';
import CommodityType from '../../model/CommodityType';

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
        <Box display="block" alignItems="center">
          <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>
            Commodity:
          </Typography>
          <Typography variant="body1">{commodityTypes.map(commodityType => commodityType.name)}</Typography>
        </Box>
      )}
    </Grid>
  );
};

export default QuoteItemContainers;
