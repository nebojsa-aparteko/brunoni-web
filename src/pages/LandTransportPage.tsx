import React, { Fragment, useState } from 'react';
import Meta from '../components/Meta';
import { Box, Button, createStyles, Grid, makeStyles, Paper } from '@material-ui/core';
import DropZoneArea from '../components/dropzone/DropZoneArea';
import theme from '../theme';
import LandTransportSearchBar from '../components/landTransport/LandTransportSearchBar';
import LandTransportDateIntervalBar from '../components/landTransport/LandTransportDateIntervalBar';
import LandTransportFare from '../components/landTransport/LandTransportFare';

const useStyles = makeStyles(() =>
  createStyles({
    dialogBody: {
      minHeight: '100px',
    },
  }),
);
const LandTransportPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const classes = useStyles();

  const sendFiles = async () => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const response = await fetch('https://europe-west6-brunoni-allmarine.cloudfunctions.net/land-transport', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      // credentials: 'include',
      headers: { Accept: 'application/json' },
      body: formData,
    });

    console.log(await response.json());
  };
  return (
    <Fragment>
      <Meta title="Land Transport" />
      <Paper
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: theme.spacing(5),
        }}
      >
        <Box width="50%">
          <DropZoneArea
            dropzoneClass={classes.dialogBody}
            filesLimit={10}
            initialFiles={files}
            handleOnDrop={file => setFiles(prevFiles => [...prevFiles, file])}
            handleOnDelete={file => setFiles(prevFiles => prevFiles.filter(prevFile => prevFile.name !== file.name))}
            dropzoneText={'Upload Land transport '}
          />
        </Box>
        <Button onClick={sendFiles}>Send</Button>
      </Paper>
      {/todo *Test*/}
      <Grid container spacing={2}>
        <Grid item sm={6} xs={12}>
          <LandTransportSearchBar />
        </Grid>
        <Grid item sm={6} xs={12}>
          <LandTransportDateIntervalBar />
        </Grid>
        <Grid item sm={6} xs={12}>
          <LandTransportFare />
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default LandTransportPage;
