import React, { useCallback } from 'react';
import { Button, createStyles, Divider, makeStyles, Menu, MenuItem, Theme, Typography } from '@material-ui/core';
import { useDropzone } from 'react-dropzone';
import { PictureAsPdf } from '@material-ui/icons';

interface DropZoneProps {
  onDrop: any;
  documents: DropZoneDocument[] | [];
  onDelete?: any;
}

interface DropZoneDocument {
  url: string;
  name: string;
}

interface DocumentsListProps {
  documents: DropZoneDocument[];
  onDelete?: any;
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
      },
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
    },
    menuLink: {
      textDecoration: 'none',
      color: 'inherit',
    },
  }),
);

export const DocumentsList: React.FC<DocumentsListProps> = ({ documents, onDelete }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleDocumentClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback((event: React.MouseEvent<unknown>) => {
    event.preventDefault();
    event.stopPropagation();

    setAnchorEl(null);
  }, []);

  const handleDownload = useCallback((event: React.MouseEvent<unknown>) => {
    event.stopPropagation();
  }, []);

  const handleDelete = useCallback(
    (event: React.MouseEvent<unknown>, name: string) => {
      event.preventDefault();
      event.stopPropagation();

      onDelete(name);
    },
    [onDelete],
  );

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
                <Typography variant="body2">{item.name}</Typography>
              </MenuItem>

              <MenuItem>
                <a
                  onClick={handleDownload}
                  href={item.url}
                  download={item.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes.menuLink}
                >
                  Download
                </a>
              </MenuItem>

              <Divider />
              <MenuItem onClick={event => handleDelete(event, item.name)}>
                <Typography color="error">Delete</Typography>
              </MenuItem>
            </Menu>
          </li>
        );
      })}
    </ul>
  );
};

const DropZone: React.FC<DropZoneProps> = ({ onDrop, documents, onDelete }) => {
  const classes = useStyles();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className={classes.dragZone}>
      <input {...getInputProps()} />

      {documents && documents.length > 0 ? (
        <DocumentsList documents={documents} onDelete={onDelete} />
      ) : isDragActive ? (
        <small>Drop the files here...</small>
      ) : (
        <small>
          Drag &amp; drop files here,
          <br />
          or click to upload
        </small>
      )}
    </div>
  );
};

export default DropZone;
