import React, { ChangeEvent } from 'react';
import { Theme, makeStyles, FormControl, InputLabel, Select, MenuItem, useTheme } from '@material-ui/core';

interface Props {
  value?: number;
  onChange: (weeks: number) => void;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const WeeksInput: React.FC<Props> = ({ value, onChange, open, onOpen, onClose }) => {
  const theme = useTheme();
  const classes = useStyles();

  const inputLabel = React.useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = React.useState(0);
  React.useEffect(() => {
    setLabelWidth(inputLabel.current!.offsetWidth);
  }, []);

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel ref={inputLabel} id="demo-simple-select-outlined-label">
        Weeks
      </InputLabel>
      <Select
        labelId="demo-simple-select-outlined-label"
        id="demo-simple-select-outlined"
        value={value || ''}
        onChange={(e: ChangeEvent<{ value: unknown }>) => onChange(e.target.value as number)}
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        labelWidth={labelWidth}
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
          style: {
            marginTop: theme.spacing(0.5),
          },
          getContentAnchorEl: null,
        }}
      >
        <MenuItem value={1}>1 Week</MenuItem>
        <MenuItem value={2}>2 Weeks</MenuItem>
        <MenuItem value={3}>3 Weeks</MenuItem>
        <MenuItem value={4}>4 Weeks</MenuItem>
      </Select>
    </FormControl>
  );
};

export default WeeksInput;
