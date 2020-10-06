import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { Box, Fab, Grid } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { ChecklistItemValueDocument } from './bookings/checklist/ChecklistItemModel';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const DocumentView: React.FC<{
  file: ChecklistItemValueDocument;
  scale: number;
  onDocumentLoadSuccess: (value: any) => void;
  numPages: number;
}> = ({ file, scale, numPages, onDocumentLoadSuccess }) => (
  <Document file={file.url} onLoadSuccess={onDocumentLoadSuccess} options={''}>
    {Array.from(new Array(numPages), (el, index) => (
      <Box key={index} paddingY={1}>
        <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={scale} />
      </Box>
    ))}
    {/*<Page pageNumber={pageNumber} />*/}
  </Document>
  // {/*<Box flex={1} flexDirection="row" justifyContent="center" style={{position: "absolute", bottom: "64px"}}>*/}
  // {/*  <Button disabled={pageNumber <= 1} onClick={previousPage}>*/}
  // {/*    Previous*/}
  // {/*  </Button>*/}
  // {/*  <Typography>{`${pageNumber} / ${numPages}`}</Typography>*/}
  // {/*  <Button*/}
  // {/*    disabled={pageNumber >= numPages}*/}
  // {/*    onClick={nextPage}*/}
  // {/*  >*/}
  // {/*    Next*/}
  // {/*  </Button>*/}
  // {/*</Box>*/}
);

const PDFViewer: React.FC<Props> = ({ file }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);

  const onDocumentLoadSuccess = (determinedNumPages: PDFDocumentProxy) => {
    setNumPages(determinedNumPages.numPages);
  };

  const changeScale = (offset: number) => {
    setScale(scale + offset);
  };

  // const DownloadableDocument = () => (
  //   <DocumentForDownload ref={file.url}>
  //     {Array.from(new Array(numPages), (el, index) => (
  //       <PageForDownload key={`page_${index + 1}`} />
  //     ))}
  //     {/*<Page pageNumber={pageNumber} />*/}
  //   </DocumentForDownload>
  // );

  return (
    // <MyDocument/>
    <Box paddingX={2} paddingY={1}>
      <Box style={{ flex: 1, flexDirection: 'column', position: 'absolute', bottom: 64, right: 32, zIndex: 200 }}>
        <Grid container direction="column-reverse" spacing={1}>
          <Grid item>
            <Fab
              size="medium"
              disabled={scale <= 0.4}
              onClick={() => changeScale(scale <= 1.5 ? -0.1 : -0.5)}
              color="primary"
            >
              <RemoveIcon />
            </Fab>
          </Grid>
          <Grid item>
            <Fab
              size="medium"
              disabled={scale >= 5}
              onClick={() => changeScale(scale < 1.5 ? 0.1 : 0.5)}
              color="primary"
            >
              <AddIcon />
            </Fab>
          </Grid>
        </Grid>
        {/*<Button variant="contained" disabled={scale <= 0.1} onClick={() => changeScale(-0.1)}>*/}
        {/*  -*/}
        {/*</Button>*/}
        {/*<Button*/}
        {/*  variant="contained"*/}
        {/*  disabled={scale >= 10}*/}
        {/*  onClick={() => changeScale(0.1)}*/}
        {/*>*/}
        {/*  +*/}
        {/*</Button>*/}
      </Box>
      <div>
        {/*<PDFDownloadLink document={file.url} fileName={file.name}>*/}
        {/*  {({ blob, url, loading, error }) => (loading ? 'Loading document...' : 'Download now!')}*/}
        {/*</PDFDownloadLink>*/}
      </div>
      <DocumentView scale={scale} file={file} onDocumentLoadSuccess={onDocumentLoadSuccess} numPages={numPages} />
    </Box>
  );
};

export default PDFViewer;

interface Props {
  file: ChecklistItemValueDocument;
}
