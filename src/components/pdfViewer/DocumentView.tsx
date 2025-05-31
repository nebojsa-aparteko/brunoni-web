import React from 'react';
import { ChecklistItemValueDocument } from '../bookings/checklist/ChecklistItemModel';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, createStyles, makeStyles } from '@material-ui/core';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const useStyles = makeStyles(() =>
  createStyles({
    page: {
      display: 'flex',
      alignItems: 'center',
      justifyItems: 'center',
    },
  }),
);

const DocumentView: React.FC<{
  file: ChecklistItemValueDocument;
  scale: number;
  onDocumentLoadSuccess: (value: any) => void;
  numPages: number;
}> = ({ file, scale, numPages, onDocumentLoadSuccess }) => {
  const classes = useStyles();

  return (
    <Document file={file.url} onLoadSuccess={onDocumentLoadSuccess}>
      <Box flex={1} flexDirection="column" overflow="scroll" bgcolor="grey">
        {Array.from(new Array(numPages), (el, index) => (
          <Box
            key={index}
            paddingY={1}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              scale={scale}
              className={classes.page}
            />
          </Box>
        ))}
      </Box>
    </Document>
  );
};

export default DocumentView;
