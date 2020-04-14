import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, createStyles, makeStyles, Theme, Typography } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import PublishIcon from '@material-ui/icons/Publish';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      '&:focus': {
        outline: 'none',
      },
    },
    documentlist: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    tableRow: {
      '& td': {
        whiteSpace: 'nowrap',
        padding: '6px 6px',
      },
      ['@media print']: {
        '& td': {
          padding: theme.spacing(0),
          width: '10%',
        },
      },
    },
    itemLabel: {
      whiteSpace: 'normal',
      ['@media print']: {
        whiteSpace: 'nowrap',
      },
    },
    hidePrint: {
      ['@media print']: {
        display: 'none',
      },
    },
    dropZone: {
      border: '1px dashed #ccc',
      cursor: 'pointer',
      borderColor: '#999',
      '&:focus': {
        outline: 'none',
      },
    },
    defaultDropZone: {
      border: '1px solid #ccc',
      cursor: 'pointer',
      borderColor: '#999',
      '&:focus': {
        outline: 'none',
      },
    },
    dropZoneHint: {
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    buttonLink: {
      textTransform: 'none',
      fontSize: '0.8em',
    },
    fileItemLink: {
      textDecoration: 'none',
      color: 'inherit',
      cursor: 'pointer',
      display: 'flex',
    },
    progressWrapper: {
      margin: theme.spacing(1),
      position: 'relative',
    },
    iconDeleteProgress: {
      color: green[500],
      position: 'absolute',
      top: -6,
      left: -6,
      zIndex: 1,
    },
    tinyIconButton: {
      '& svg': {
        fontSize: 10,
      },
    },
  }),
);
const InternalChecklist = () => {
  const classes = useStyles();

  const onDrop = () => {};
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({ onDrop });
  return (
    <Box
      {...getRootProps()}
      className={isDragActive ? classes.dropZone : classes.defaultDropZone}
      display="flex"
      flexDirection="column"
      style={{ width: '100%', height: '300px' }}
      alignItems="center"
      justifyContent="center"
    >
      <input {...getInputProps()} />
      <PublishIcon fontSize="large" />
      <Typography>Drag and drop here</Typography>
      <Typography>or</Typography>
      <Typography>Click to browse files</Typography>
    </Box>
  );
};

export default InternalChecklist;
