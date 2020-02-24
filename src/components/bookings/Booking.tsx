import React from 'react';
import {
  Container,
  Paper
} from '@material-ui/core';
import Page from './Page';

interface Props {
  id: string;
}

const Quote: React.FC<Props> = ({ id }) => {
  return (
    <Page title={'Booking Detail'}>
      <Container maxWidth="lg">
        {/* <ScrollToTopOnMount /> */}
        <Paper>
          BOOKING VIEW: {id}
        </Paper>
      </Container>
    </Page>
  );
};

export default Quote;
