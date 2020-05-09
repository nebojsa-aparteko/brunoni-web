import React from 'react';
import { IconButton } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

const WatcherIconButton: React.FC<Props> = ({ isWatching, handleWatch }) => {
  return (
    <IconButton
      color="primary"
      size="small"
      aria-label="Watch"
      component="span"
      onClick={() => handleWatch(isWatching)}
    >
      {isWatching ? <VisibilityOffIcon /> : <VisibilityIcon />}
    </IconButton>
  );
};

export default WatcherIconButton;

interface Props {
  isWatching: boolean;
  handleWatch: (isWatching: boolean) => void;
}
