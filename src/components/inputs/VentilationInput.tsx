import React from 'react';
import {
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  useTheme,
} from '@material-ui/core';
import { Ventilation } from '../../model/Container';

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    minWidth: 120,
    marginTop: theme.spacing(1),
    [theme.breakpoints.up('xs')]: {
      width: '100%',
    },
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const VentilationInput: React.FC<Props> = ({ value, onChange }) => {
  const theme = useTheme();
  const classes = useStyles();

  const inputLabel = React.useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = React.useState(0);
  React.useEffect(() => {
    setLabelWidth(inputLabel.current!.offsetWidth);
  }, []);

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="ventilation-label" ref={inputLabel} margin="dense" variant="outlined">
        Ventilation
      </InputLabel>
      <Select
        labelId="ventilation-label"
        id="ventilation-select"
        value={value || Ventilation.CLOSED}
        onChange={event => {
          onChange(event.target.value as Ventilation);
        }}
        displayEmpty={true}
        variant="outlined"
        margin="dense"
        inputProps={{ shrink: !!value, focused: !!value }}
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
        {Object.keys(Ventilation)?.map(ventilation => (
          <MenuItem key={ventilation} value={ventilation}>
            {ventilation}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

interface Props {
  value?: Ventilation;
  onChange: (ventilation: Ventilation) => void;
}

export default VentilationInput;
