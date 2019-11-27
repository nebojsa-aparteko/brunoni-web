import React, { ChangeEvent, Fragment } from 'react';
import { Theme, makeStyles, Box, TextField, InputAdornment, IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import InputProps from '../../model/InputProps';

interface Props extends InputProps<number> {}

const useStyles = makeStyles((theme: Theme) => ({
  adornment: {
    marginRight: theme.spacing(-1),
  },
}));

const QuantityInput: React.FC<Props> = ({ value, onChange }) => {
  const classes = useStyles();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <Box>
      <TextField
        label="Quantity"
        variant="outlined"
        value={String(value)}
        onChange={handleChange}
        InputProps={{
          endAdornment: (
            <Fragment>
              <InputAdornment position="end" className={classes.adornment}>
                <IconButton aria-label="remove" onClick={() => onChange(Math.max(1, value - 1))}>
                  <RemoveIcon />
                </IconButton>
              </InputAdornment>
              <InputAdornment position="end" className={classes.adornment}>
                <IconButton aria-label="add" onClick={() => onChange(value + 1)}>
                  <AddIcon />
                </IconButton>
              </InputAdornment>
            </Fragment>
          ),
        }}
      />
    </Box>
  );
};

export default QuantityInput;
