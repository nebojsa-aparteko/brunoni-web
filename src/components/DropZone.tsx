import React from 'react';
import {
  Button,
  createStyles,
  Divider,
  makeStyles,
  Menu,
  MenuItem,
  Theme,
  Typography
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
    },
    documentButton: {
      padding: 0,
      minWidth: 'auto',
    }
  }),
);

export const DocumentsList: React.FC<DocumentsListProps> = ({ documents }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleDocumentClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: React.MouseEvent<unknown>) => {
    event.preventDefault();
    event.stopPropagation();

    setAnchorEl(null);
  };

  const handleDownload = (event: React.MouseEvent<unknown>) => {
    event.preventDefault();
    event.stopPropagation();

    console.log('download');
  };

  const handleDelete = (event: React.MouseEvent<unknown>) => {
    event.preventDefault();
    event.stopPropagation();

    console.log('delete');
  };

  return (
    <ul className={classes.documents}>
      {documents.map((item: DropZoneDocument, index: number) => {
        return (
          <li key={`document-${index}`} className={classes.documentItem}>
            <Button
              aria-controls={`document-menu-${index}`}
              aria-haspopup="true"
              onClick={handleDocumentClick}
              className={classes.documentButton}
            >
              <PictureAsPdf />
            </Button>
            <Menu
              id={`document-menu-${index}`}
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                <Typography variant="body2">{item.url}</Typography>
              </MenuItem>
              <MenuItem onClick={handleDownload}>Download</MenuItem>
              <Divider />
              <MenuItem onClick={handleDelete}>
                <Typography color="error">Delete</Typography>
              </MenuItem>
            </Menu>
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
