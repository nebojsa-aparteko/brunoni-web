import React, { useCallback, useEffect, useState } from 'react';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { Box, Fab } from '@material-ui/core';

interface Props {
  className: any;
}

const ScrollToTop: React.FC<Props> = ({ className }) => {
  const [shouldShow, setShouldShow] = useState(false);

  const scrollListener = useCallback(() => {
    if (window.scrollY > 170) {
      setShouldShow(true);
    } else {
      setShouldShow(false);
    }
  }, [setShouldShow]);

  useEffect(() => {
    document.addEventListener('scroll', scrollListener);
    window.scrollTo(0, 0);
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.removeEventListener('scroll', scrollListener);
    };
  }, [scrollListener]);

  const scrollToTop = () => {
    window['scrollTo']({ top: 0, behavior: 'smooth' });
  };

  const renderGoTopIcon = () => {
    if (shouldShow) {
      return (
        <Box displayPrint="none">
          <Fab onClick={scrollToTop} color="primary" className={className}>
            <KeyboardArrowUpIcon />
          </Fab>
        </Box>
      );
    }
  };

  return <React.Fragment>{renderGoTopIcon()}</React.Fragment>;
};

export default ScrollToTop;
