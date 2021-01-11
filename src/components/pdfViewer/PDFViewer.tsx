import React, { useState } from 'react';

import { Box, Fab, Grid } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import GetAppIcon from '@material-ui/icons/GetApp';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { ChecklistItemValueDocument } from '../bookings/checklist/ChecklistItemModel';
import DocumentView from './DocumentView';

const PDFViewer: React.FC<Props> = ({ file }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.4);

  const onDocumentLoadSuccess = (determinedNumPages: PDFDocumentProxy) => {
    setNumPages(determinedNumPages.numPages);
  };

  const changeScale = (offset: number) => {
    setScale(scale + offset);
  };

  return (
    <Box flex={1}>
      <Box style={{ position: 'absolute', bottom: 64, right: 32, zIndex: 200 }}>
        <Grid container direction="column-reverse" spacing={1}>
          <Grid item>
            <Fab size="medium" disabled={scale <= 0.4} onClick={() => changeScale(-0.1)}>
              <RemoveIcon />
            </Fab>
          </Grid>
          <Grid item>
            <Fab size="medium" disabled={scale >= 1.35} onClick={() => changeScale(0.1)}>
              <AddIcon />
            </Fab>
          </Grid>
        </Grid>
      </Box>
      <Box style={{ position: 'absolute', top: 64, right: 32, zIndex: 200 }}>
        <Fab href={file.url} size="small" download={file.name} target="_blank">
          <GetAppIcon />
        </Fab>
      </Box>
      <DocumentView scale={scale} file={file} onDocumentLoadSuccess={onDocumentLoadSuccess} numPages={numPages} />
    </Box>
  );
};

export default PDFViewer;

interface Props {
  file: ChecklistItemValueDocument;
}
