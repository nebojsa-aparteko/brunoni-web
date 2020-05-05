/* eslint-disable no-undef */
import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import Meta from '../Meta';

const { NODE_ENV, REACT_APP_GA_MEASUREMENT_ID: GA_MEASUREMENT_ID } = process.env;

const useStyles = makeStyles(theme => ({
  divider: {
    margin: theme.spacing(2, 0),
  },
}));

function Page({ title, children, ...rest }) {
  const location = useLocation();

  useEffect(() => {
    if (NODE_ENV !== 'production') {
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
