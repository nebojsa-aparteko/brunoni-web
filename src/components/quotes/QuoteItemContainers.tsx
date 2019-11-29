import React from 'react';
import { Grid, Typography, ListItem, Box, Chip } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import Container from '../../model/Container';

interface Props {
  containers: Container[];
}

const QuoteItemContainers: React.FC<Props> = ({ containers }) => (
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
  </Grid>
);

export default QuoteItemContainers;
