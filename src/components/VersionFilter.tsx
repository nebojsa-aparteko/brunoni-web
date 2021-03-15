import React from 'react';
import { FormControlLabel, makeStyles, Radio, RadioGroup, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  importOrExport: {
    flexDirection: 'row',
    marginLeft: theme.spacing(4),
  },
}));

const VersionFilter: React.FC<Props> = ({ value, onChange }) => {
  const classes = useStyles();

  return (
    <RadioGroup
      aria-label="long-short"
      name="long-short"
      value={value}
      onChange={onChange}
      className={classes.importOrExport}
    >
      <FormControlLabel value="Long" control={<Radio />} label="Long" />
      <FormControlLabel value="Short" control={<Radio />} label="Short" />
    </RadioGroup>
  );
};

export default VersionFilter;

interface Props {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
