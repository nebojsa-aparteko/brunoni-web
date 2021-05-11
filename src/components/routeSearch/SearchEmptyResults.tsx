import Container from '../Container';
import { Box, Grid } from '@material-ui/core';
import Image from 'material-ui-image';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import empty from '../../assets/state.server.overload.svg';

interface Props {
  message?: string;
}

const SearchEmptyResults: React.FC<Props> = ({ message }) => (
  <Container>
    <Grid container justify="center" alignItems="center">
      <Grid item md={6}>
        <Box p={6} textAlign="center">
          <Image src={empty} aspectRatio={16 / 9} color="transparent" disableSpinner />
          <Typography variant="h5" gutterBottom>
            <Box fontWeight="fontWeightBold">No Results :(</Box>
          </Typography>
          <Typography variant="subtitle1">{message}</Typography>
        </Box>
      </Grid>
    </Grid>
  </Container>
);

SearchEmptyResults.defaultProps = {
  message:
    'There are no results for the port combination selected. Please try searching for different origin/destination combination.',
};

export default SearchEmptyResults;
