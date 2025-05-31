import React, { useState } from 'react';
import {
  Theme,
  makeStyles,
  ListItemIcon,
  CircularProgress,
  ListItemText,
  ListItem,
  Radio,
} from '@material-ui/core';
import { useId } from 'react-id-generator';

interface Props {
  label: string;
  selected: boolean;
  onSelect: (callback: () => void) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontWeight: 'bold',
  },
  spinner: {
    padding: 12,
  },
}));

const RouteSearchFilter: React.FC<Props> = ({ label, selected, onSelect }) => {
  const classes = useStyles();
  const [id] = useId();
  const [busy, setBusy] = useState(false);

  const handleClick = () => {
    // setBusy(true);
    onSelect(() => setBusy(false));
  };

  return (
    <ListItem role={undefined} dense button onClick={handleClick}>
      <ListItemIcon>
        {busy ? (
          <CircularProgress size={42} className={classes.spinner} />
        ) : (
          <Radio
            checked={selected}
            tabIndex={-1}
            disableRipple
            inputProps={{ 'aria-labelledby': id }}
          />
        )}
      </ListItemIcon>
      <ListItemText id={id} primary={label} />
    </ListItem>
  );
};

export default RouteSearchFilter;
