import React from 'react';
import { Grid, Typography, ListItem, Box, Chip } from '@material-ui/core';
import List from '@material-ui/core/List';
import Container from '../../model/Container';
import CommodityType from '../../model/CommodityType';

interface Props {
  containers: Container[];
  commodityTypes?: CommodityType[];
}

const QuoteItemContainers: React.FC<Props> = ({ containers, commodityTypes }) => (
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
                (container.quantity > 1 ? container.quantity + ' x ' : '') +
                container!.containerType?.description +
                ', ' +
                container?.commodityType?.name
              }
            />
          </ListItem>
        ))}
      </List>
    </Typography>
    {commodityTypes && (
      <Box display="block" alignItems="center">
        <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>
          Commodity:
        </Typography>
        <Typography variant="body1">{commodityTypes.map(commodityType => commodityType.name)}</Typography>
      </Box>
    )}
  </Grid>
);

export default QuoteItemContainers;
