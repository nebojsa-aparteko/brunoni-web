import React from 'react';
import { Theme, makeStyles, Button, Radio, Typography, Grid } from '@material-ui/core';
import { Sorting, sortingOptions } from './RouteSearchSorting';
import { useId } from 'react-id-generator';

interface Props {
  value: Sorting;
  selected: boolean;
  onSelect: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    display: 'flex',
  },
  button: {
    flex: 1,
    justifyContent: 'start',
  },
  label: {
    textTransform: 'initial',
  },
}));

const RouteSearchSortingOption: React.FC<Props> = ({ value, selected, onSelect }) => {
  const classes = useStyles();
  const [id] = useId();

  return (
    <Grid item sm={Math.floor(12 / sortingOptions.length) as any} className={classes.item}>
      <Button className={classes.button} onClick={onSelect}>
        <Radio checked={selected} tabIndex={-1} disableRipple inputProps={{ 'aria-labelledby': id }} />
        <Typography id={id} variant="body2" className={classes.label}>
          {value.name}
        </Typography>
      </Button>
    </Grid>
  );
};

export default RouteSearchSortingOption;
