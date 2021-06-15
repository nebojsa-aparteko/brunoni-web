import React from 'react';
import { Button } from '@material-ui/core';

const BookNowButton = ({ bookNow }: { bookNow: () => void }) => (
  <Button color="primary" variant="contained" size="small" onClick={bookNow}>
    Book Now
  </Button>
);

export default BookNowButton;
