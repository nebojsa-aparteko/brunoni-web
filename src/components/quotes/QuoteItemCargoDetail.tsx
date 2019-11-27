import { CargoDetailCargoDetail } from '../../model/quotes/QuotesResult';
import React, { Fragment } from 'react';
import { Grid, Typography, Link, ListItem, Box } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import CommodityTypesContext from '../../contexts/CommodityTypes';
import ContainerTypesContext from '../../contexts/ContainerTypes';

interface Props {
  cargoDetails: CargoDetailCargoDetail[];
}

const QuoteItemCargoDetail: React.FC<Props> = ({ cargoDetails }) => {
  const commodityTypes = React.useContext(CommodityTypesContext);
  const containerTypes = React.useContext(ContainerTypesContext);

  // helpers to find commodity type text for display
  const commType = (cargoDetail: CargoDetailCargoDetail) =>
    commodityTypes && commodityTypes.find(item => item.id === cargoDetail.CommodityID);
  const containerType = (cargoDetail: CargoDetailCargoDetail) =>
    containerTypes && containerTypes.find(item => item.id === cargoDetail.CtypID);

  console.debug('Commodity Types', commodityTypes);
  console.debug('Container Types', containerTypes);
  return (
    <Grid item xs={12}>
      <Typography variant="subtitle2">
        <Box display="inline" alignItems="center" fontWeight="fontWeightBold">
          Cargo details:
        </Box>
      </Typography>
      <Typography variant="body2">
        <List dense={true}>
          {cargoDetails.map((cargoDetail: CargoDetailCargoDetail) => {
            const foundContainerType = containerType(cargoDetail);
            const foundCommType = commType(cargoDetail);
            const commodityText = foundCommType ? ` - ${foundCommType.name}` : '';
            const cargoTypeDetailText = foundContainerType ? foundContainerType.description : cargoDetail.CtypID;
            return (
              <ListItem>
                <ListItemText primary={`${cargoDetail.Quantity} – ${cargoTypeDetailText}${commodityText}`} />
              </ListItem>
            );
          })}
        </List>
      </Typography>
    </Grid>
  );
};

export default QuoteItemCargoDetail;
