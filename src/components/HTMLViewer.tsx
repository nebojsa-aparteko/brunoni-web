import React, { useEffect, useState } from 'react';

const HTMLViewer: React.FC<{
  url: string;
}> = ({ url }) => {
  const [fileData, setFileData] = useState(url);

  useEffect(() => {
    if (url)
      fetch(url)
        .then(response => response.text())
        .then(response => {
          setFileData(response);
        });
  }, [url]);

  return fileData ? <div dangerouslySetInnerHTML={{ __html: fileData }} /> : null;
};

export default HTMLViewer;
