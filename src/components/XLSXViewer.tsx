import React, { useEffect, useState } from 'react';
import isString from '../utilities/isString';
import XLSX from 'xlsx';

const XLSXViewer: React.FC<{
  file: string | { url: string };
}> = ({ file }) => {
  const [fileData, setFileData] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isString(file)) return;
    fetch(file.url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        setFileData(
          '<style>table, td {border: 1px solid dimgray; background-color: white; border-collapse: collapse;  padding: 8px;}</style>' +
            XLSX.write(XLSX.read(arrayBuffer, { type: 'array' }), { type: 'binary', bookType: 'html' }),
        );
      });
  }, [file]);

  return fileData ? <div dangerouslySetInnerHTML={{ __html: fileData }} style={{ padding: 12 }} /> : null;
};

export default XLSXViewer;
