import { BookingRequest } from '../../model/BookingRequest';
import React, { useState } from 'react';
import { Box, Button, createStyles, Grid, makeStyles, TextField, Typography } from '@material-ui/core';
import DropZoneArea from '../dropzone/DropZoneArea';
import { BookingReqFiles } from './OnlineBookingContainer';

const useStyles = makeStyles(() =>
  createStyles({
    dialogBody: {
      minHeight: '100px',
    },
  }),
);

const AdditionalInfo: React.FC<Props> = ({
  handlePrevious,
  handleNext,
  bookingRequest,
  setBookingRequest,
  files,
  setFiles,
}) => {
  const classes = useStyles();
  const [additionalInfo, setAdditionalInfo] = useState<string | undefined>();

  const allGood = () => {
    return !(
      (bookingRequest?.soc && files.certificate.length === 0) ||
      (bookingRequest?.imo && files.imo.length === 0)
    );
  };

  const handleContinue = () => {
    setBookingRequest({
      ...bookingRequest,
      additionalInfo: additionalInfo,
    } as BookingRequest);
    handleNext();
  };

  // useEffect(() => {
  //   console.log(files)
  // }, [files])

  return (
    <Grid container direction="column" spacing={4}>
      <Grid container item direction="row" spacing={4} xs={12}>
        <Grid item sm={4} xs={12}>
          <TextField
            label="Special Requests or Comments"
            variant="outlined"
            margin="dense"
            rows={8}
            multiline
            fullWidth
            value={bookingRequest?.additionalInfo}
            onChange={event => setAdditionalInfo(event.target.value)}
          />
        </Grid>
        <Grid container item sm={6} xs={12} direction="column" spacing={1} style={{ margin: 4 }}>
          {bookingRequest?.soc && (
            <Grid item>
              <DropZoneArea
                dropzoneClass={classes.dialogBody}
                filesLimit={1}
                initialFiles={files.certificate}
                handleOnDrop={file =>
                  setFiles(prevFiles => ({
                    ...prevFiles,
                    certificate: [...prevFiles.certificate, file],
                  }))
                }
                handleOnDelete={file =>
                  setFiles(prevFiles => ({
                    ...prevFiles,
                    certificate: prevFiles.certificate.filter(prevFile => prevFile.name !== file.name),
                  }))
                }
                dropzoneText={'Upload Certificate'}
              />
            </Grid>
          )}
          {bookingRequest?.imo && (
            <Grid item>
              <DropZoneArea
                dropzoneClass={classes.dialogBody}
                filesLimit={10}
                initialFiles={files.imo}
                handleOnDrop={file =>
                  setFiles(prevFiles => ({
                    ...prevFiles,
                    imo: [...prevFiles.imo, file],
                  }))
                }
                handleOnDelete={file =>
                  setFiles(prevFiles => ({
                    ...prevFiles,
                    imo: prevFiles.imo.filter(prevFile => prevFile.name !== file.name),
                  }))
                }
                dropzoneText={'Upload IMO Documents'}
              />
            </Grid>
          )}
          <Grid item>
            <DropZoneArea
              dropzoneClass={classes.dialogBody}
              filesLimit={10}
              initialFiles={files.additional}
              handleOnDrop={file =>
                setFiles(prevFiles => ({
                  ...prevFiles,
                  additional: [...prevFiles.additional, file],
                }))
              }
              handleOnDelete={file =>
                setFiles(prevFiles => ({
                  ...prevFiles,
                  additional: prevFiles.additional.filter(prevFile => prevFile.name !== file.name),
                }))
              }
              dropzoneText={'Upload Additional Documents'}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Button variant="text" color="default" onClick={handlePrevious}>
          Previous
        </Button>
        <Button variant="contained" color="primary" onClick={handleContinue} disabled={!allGood()}>
          Next
        </Button>
        <Box display={'flex'} flexDirection={'column'}>
          {bookingRequest?.soc && files.certificate.length === 0 && (
            <Typography color={'error'}>Please upload certificate</Typography>
          )}
          {bookingRequest?.imo && files.imo.length === 0 && (
            <Typography color={'error'}>Please upload IMO Documents</Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

interface Props {
  handlePrevious: () => void;
  handleNext: () => void;
  bookingRequest: BookingRequest | undefined;
  setBookingRequest: React.Dispatch<React.SetStateAction<BookingRequest | undefined>>;
  files: BookingReqFiles;
  setFiles: React.Dispatch<React.SetStateAction<BookingReqFiles>>;
}

export default AdditionalInfo;
