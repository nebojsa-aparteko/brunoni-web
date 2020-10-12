import React, { useEffect, useState } from 'react';
import isString from '../utilities/isString';

const HTMLViewer: React.FC<{
  file: string | { url: string };
}> = ({ file }) => {
  const [fileData, setFileData] = useState(isString(file) ? file : undefined);

  useEffect(() => {
    if (isString(file)) return;
    fetch(file.url)
      .then(response => response.text())
      .then(response => {
        setFileData(response);
      });
  }, [file]);

  return fileData ? <div dangerouslySetInnerHTML={{ __html: fileData }} /> : null;
};

export default HTMLViewer;
