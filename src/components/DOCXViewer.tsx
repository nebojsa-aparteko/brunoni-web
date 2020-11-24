import { renderAsync } from 'docx-preview';
import { useContext, useEffect } from 'react';
import React from 'react';
import { GlobalContext } from '../store/GlobalStore';

const DOCXViewer: React.FC<{ url: string }> = ({ url }) => {
  const [, dispatch] = useContext(GlobalContext);
  useEffect(() => {
    if (!url) {
      dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Please provide us an url to the file.' });
      return;
    }
    fetch(url)
      .then(res => res.blob())
      .then(res => {
        const container = document.getElementById('container');
        if (!container) return Promise.reject(() => 'Cant load file');
        return renderAsync(res, container);
      })
      .catch(error => {
        dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: `${error}` });
      });
  }, [dispatch, url]);
  return <div id="container" />;
};

export default DOCXViewer;
