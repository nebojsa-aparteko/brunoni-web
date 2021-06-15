import React, { Fragment, useState } from 'react';
import Meta from '../components/Meta';
import { Box, Button, createStyles, makeStyles, Paper } from '@material-ui/core';
import DropZoneArea from '../components/dropzone/DropZoneArea';
import theme from '../theme';
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
    formData.append('files', files.pop()!);
    const response = await fetch('https://europe-west6-brunoni-allmarine.cloudfunctions.net/land-transport', {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: { ContentType: 'multipart/form-data', Accept: 'application/json' },
      body: formData,
    });

    console.log(JSON.parse(await response.json()));
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
    </Fragment>
  );
};

export default LandTransportPage;
