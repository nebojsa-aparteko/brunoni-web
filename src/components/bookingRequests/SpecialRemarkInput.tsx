import React, { useContext, useState } from 'react';
import { Grid, MenuItem, Select, TextField } from '@material-ui/core';
import SpecialRemarks from '../../contexts/SpecialRemarks';
import SpecialRemark from '../../model/SpecialRemark';

const emptyValue = {
  id: '',
  text: '',
} as SpecialRemark;

const SpecialRemarkInput: React.FC<Props> = ({ specialRemark, specialRemarkText, margin, handleChange }) => {
  const specialRemarks = useContext(SpecialRemarks);
  const [value, setValue] = React.useState<string>(specialRemark || emptyValue.id);
  const [specialRemarkValue, setSpecialRemarkValue] = useState<string>(specialRemarkText || emptyValue.text || '');

  const handleSetSelectedValue = (event: React.ChangeEvent<{ value: string }>) => {
    const selectedSpecialRemark = event.target.value
      ? specialRemarks?.find(remark => remark.id === event.target.value)
      : emptyValue;
    setValue(event.target.value || emptyValue.id);
    const newText = selectedSpecialRemark?.text?.replaceAll('<br/>', '\n') || '';
    setSpecialRemarkValue(newText);
    handleChange && handleChange(value, newText);
  };

  const handleOnTextChange = (newText: string | undefined) => {
    setSpecialRemarkValue(newText || '');
    handleChange && handleChange(value, newText);
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item md={3} xs={12} style={{ display: 'flex' }}>
        <Select
          value={value}
          margin={margin}
          onChange={event => handleSetSelectedValue(event as React.ChangeEvent<{ value: string }>)}
          style={{ flex: 1, height: 'fit-content' }}
        >
          {specialRemarks?.map(specialRemark => (
            <MenuItem key={specialRemark.id} value={specialRemark.id}>
              {specialRemark.id}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid item md={12} xs={12}>
        <TextField
          label="Special Remark Text"
          variant="outlined"
          margin="dense"
          rows={5}
          multiline
          fullWidth
          value={specialRemarkValue || ''}
          onChange={event => handleOnTextChange(event.target.value)}
        />
      </Grid>
    </Grid>
  );
};

interface Props {
  specialRemark?: string;
  specialRemarkText?: string;
  handleChange?: (specialRemarkId: string | undefined, specialRemarkText: string | undefined) => void;
  margin?: any;
}

export default SpecialRemarkInput;
