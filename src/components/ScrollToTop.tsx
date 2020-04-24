import React, { useCallback, useEffect, useState } from 'react';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { Box, Fab } from '@material-ui/core';

interface Props {
  scrollStepInPx: number;
  delayInMs: number;
  className: any;
}

const ScrollToTop: React.FC<Props> = ({ scrollStepInPx, delayInMs, className }) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | undefined>(undefined);

  const scrollListener = useCallback(() => {
    if (window.scrollY > 170) {
      setShouldShow(true);
    } else {
      setShouldShow(false);
    }
  }, [setShouldShow]);

  const onScrollStep = useCallback(() => {
    if (window.pageYOffset === 0 && intervalId) {
      clearInterval(intervalId);
      setIntervalId(undefined);
    }
    window.scroll(0, window.pageYOffset - scrollStepInPx);
  }, [scrollStepInPx, intervalId]);

  useEffect(() => {
    document.addEventListener('scroll', scrollListener);
    window.scrollTo(0, 0);
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.removeEventListener('scroll', scrollListener);
    };
  }, [scrollListener]);

  const scrollToTop = useCallback(() => {
    let intervalId = setInterval(onScrollStep, delayInMs);
    setIntervalId(intervalId);
  }, [setIntervalId, delayInMs, onScrollStep]);

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
