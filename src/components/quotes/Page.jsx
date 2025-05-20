/* eslint-disable no-undef */
import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import PropTypes from 'prop-types';
import Meta from '../Meta';

const { MODE, REACT_APP_GA_MEASUREMENT_ID: GA_MEASUREMENT_ID } = import.meta.env;

function Page({ title, children, ...rest }) {
  const location = useLocation();

  useEffect(() => {
    if (MODE !== 'production') {
      return;
    }

    if (window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname,
        page_name: title,
      });
    }

    // eslint-disable-next-line
  }, []);

  return (
    <div {...rest}>
      <Meta title={title} />
      {children}
    </div>
  );
}

Page.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
};

export default Page;
