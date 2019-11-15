import React from 'react';
import { Theme, makeStyles } from '@material-ui/core';

interface Props {
  noLine: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  dotAndLine: {
    position: 'absolute',
    height: '100%',
  },
  dot: {
    width: '2em',
    height: '2em',
    borderRadius: '16px',
    backgroundColor: theme.palette.common.white,
    border: `3px solid ${theme.palette.primary.main}`,
    position: 'absolute',
    left: '2em',
    top: '3.45em',
    zIndex: 2,
  },
  line: {
    content: '',
    width: '3px',
    height: '100%',
    position: 'absolute',
    left: '2.9em',
    top: '3.45em',
    backgroundColor: theme.palette.primary.main,
    zIndex: 1,
  },
}));

const DotAndLine: React.FC<Props> = ({ noLine }) => {
  const classes = useStyles();

  return (
    <div className={classes.dotAndLine}>
      <div className={classes.dot} />
      {!noLine && <div className={classes.line} />}
    </div>
  );
};

export default DotAndLine;
