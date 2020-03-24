import React from 'react';
import {
  createStyles,
  Theme,
  makeStyles
} from '@material-ui/core';
import { useDropzone } from 'react-dropzone';
import { PictureAsPdf } from '@material-ui/icons';

interface DropZoneProps {
  onDrop: any;
  accept: string;
  documents: DropZoneDocument[];
}

interface DropZoneDocument {
  url: string;
}

interface DocumentsListProps {
  documents: DropZoneDocument[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    dragZone: {
      border: '1px dashed #ccc',
      padding: '10px',
      textAlign: 'center',
      fontSize: '12px',
      lineHeight: 1,
      cursor: 'pointer',
      '&:hover': {
        borderColor: '#999',
      },
      '&:focus': {
        outline: 'none',
      }
    },
    documents: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexWrap: 'wrap',
    },
    documentItem: {
      margin: '5px',
    }
  }),
);

export const DocumentsList: React.FC<DocumentsListProps> = ({ documents }) => {
  const classes = useStyles();

  return (
    <ul className={classes.documents}>
      {documents.map((item: DropZoneDocument, index: number) => {
        console.log('item: ', item.url);

        return (
          <li key={`document-${index}`} className={classes.documentItem}>
            <PictureAsPdf />
          </li>
        );
      })}
    </ul>
  );
};

const DropZone: React.FC<DropZoneProps>  = ({ onDrop, accept, documents }) => {
  const classes = useStyles();

  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({ onDrop, accept });

  return (
    <div {...getRootProps()} className={classes.dragZone}>
      <input {...getInputProps()} />

      {documents && documents.length > 0 ? (
        <DocumentsList documents={documents} />
      ) : (isDragActive ? (
      <small>Drop the files here...</small>
      ) : (
      <small>Drag &amp; drop files here,<br/>or click to upload</small>)
      )}
    </div>
  );
};

export default DropZone;
