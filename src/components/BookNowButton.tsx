import React from 'react';
import { Button } from '@material-ui/core';

const BookNowButton = ({ bookNow, disabled }: { bookNow: () => void; disabled?: boolean }) => (
  <Button color="primary" variant="contained" size="small" onClick={bookNow} disabled={disabled}>
    Book Now
  </Button>
);

export default BookNowButton;
