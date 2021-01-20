import React, { useEffect, useMemo, useState } from 'react';
import XLSX from 'xlsx';
import { AppBar, Box, Tab, Tabs } from '@material-ui/core';

const XLSXViewer: React.FC<{
  url: string;
}> = ({ url }) => {
  const [fileData, setFileData] = useState<XLSX.WorkBook | undefined>(undefined);
  const [currentSheet, setCurrentSheet] = useState<string | undefined>(undefined);
  const sheetHTML = useMemo(
    () =>
      fileData &&
      fileData.Sheets &&
      currentSheet &&
      fileData.Sheets[currentSheet] &&
      Object.keys(fileData.Sheets[currentSheet]).length > 1
        ? '<style>#xlsxContainer table, #xlsxContainer td {border: 1px solid dimgray; background-color: white; border-collapse: collapse;  padding: 8px;}</style>' +
          XLSX.utils.sheet_to_html(fileData.Sheets[currentSheet])
        : undefined,
    [fileData, currentSheet],
  );

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    event.stopPropagation();
    setCurrentSheet(newValue);
  };

  useEffect(() => {
    if (url)
      fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
          const file = XLSX.read(arrayBuffer, { type: 'array' });
          setFileData(file);
          setCurrentSheet(file && file.SheetNames.length > 0 ? file.SheetNames[0] : undefined);
        });
  }, [url]);

  return fileData ? (
    <Box style={{ display: 'flex' }}>
      {sheetHTML && <div dangerouslySetInnerHTML={{ __html: sheetHTML }} style={{ padding: 12, paddingBottom: 60 }} />}
      {fileData && fileData.SheetNames && currentSheet && (
        <Box style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white' }}>
          <AppBar position="static" color="default" elevation={0}>
            <Tabs
              value={currentSheet}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              {fileData?.SheetNames.map(sheet =>
                fileData?.Sheets && fileData.Sheets[sheet] && Object.keys(fileData.Sheets[sheet]).length > 1 ? (
                  <Tab key={sheet} label={sheet} value={sheet} />
                ) : null,
              )}
            </Tabs>
          </AppBar>
        </Box>
      )}
    </Box>
  ) : null;
};

export default XLSXViewer;
