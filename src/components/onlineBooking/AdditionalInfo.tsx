import { BookingRequest } from '../../model/BookingRequest';
import React, { useState } from 'react';
import { Button, Grid, TextField } from '@material-ui/core';
import DropZone from '../DropZone';

const AdditionalInfo: React.FC<Props> = ({ handlePrevious, handleNext, bookingRequest, setBookingRequest }) => {
  const [additionalInfo, setAdditionalInfo] = useState<string | undefined>();

  const handleContinue = () => {
    setBookingRequest({
      ...bookingRequest,
      additionalInfo: additionalInfo,
    } as BookingRequest);
    handleNext();
  };

  return (
    <Grid container direction="column" spacing={4}>
      <Grid container item direction="row" spacing={4} xs={12}>
        <Grid item sm={4} xs={12}>
          <TextField
            label="Special Requests or Comments"
            variant="outlined"
            margin="dense"
            rows={4}
            multiline
            fullWidth
            value={additionalInfo}
            onChange={event => setAdditionalInfo(event.target.value)}
          />
        </Grid>
        <Grid container item sm={3} xs={12} direction="column" spacing={1} style={{ margin: 4 }}>
          {bookingRequest?.soc && (
            <Grid item>
              <DropZone label="Upload Certificate" storageBasePath={'booking-requests/certificates'} internal={false} />
            </Grid>
          )}
          {bookingRequest?.imo && (
            <Grid item>
              <DropZone
                label="Upload IMO Documents"
                storageBasePath={'booking-requests/IMO-documents'}
                internal={false}
              />
            </Grid>
          )}
          <Grid item>
            <DropZone
              label="Upload Additional Documents"
              storageBasePath={'booking-requests/additional-documents'}
              internal={false}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Button variant="text" color="default" onClick={handlePrevious}>
          Previous
        </Button>
        <Button variant="contained" color="primary" onClick={handleContinue}>
          Next
        </Button>
      </Grid>
    </Grid>
  );
};

interface Props {
  handlePrevious: () => void;
  handleNext: () => void;
  bookingRequest: BookingRequest | undefined;
  setBookingRequest: React.Dispatch<React.SetStateAction<BookingRequest | undefined>>;
}

export default AdditionalInfo;
