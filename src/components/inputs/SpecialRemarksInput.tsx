import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Theme,
} from '@material-ui/core';
import SpecialRemarks from '../../contexts/SpecialRemarks';
import SpecialRemark from '../../model/SpecialRemark';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import AddIcon from '@material-ui/icons/Add';
import palette from '../../theme/palette';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    marginBottom: theme.spacing(1),
    '&:hover': {
      backgroundColor: palette.background.hover,
    },
  },
  actionSection: {
    backgroundColor: theme.palette.grey['50'],
  },
}));

const emptyValue = {
  id: '',
  text: '',
} as SpecialRemark;

interface SingleInputProps {
  specialRemark?: SpecialRemark;
  specialRemarkText?: string;
  handleChange?: (specialRemark: SpecialRemark) => void;
  margin?: any;
}

const SingleSpecialRemarkInput: React.FC<SingleInputProps> = ({ specialRemark, margin, handleChange }) => {
  const specialRemarks = useContext(SpecialRemarks);
  const [selectedValue, setSelectedValue] = React.useState<string>(specialRemark?.id || emptyValue.id);
  const [specialRemarkValue, setSpecialRemarkValue] = useState<string>(specialRemark?.text || emptyValue.text || '');

  useEffect(() => {
    setSelectedValue(specialRemark?.id || emptyValue.id);
    setSpecialRemarkValue(specialRemark?.text || emptyValue.text || '');
  }, [specialRemark]);

  const handleSelectNewRemarkId = (event: React.ChangeEvent<{ value: string }>) => {
    const selectedSpecialRemark = event.target.value
      ? specialRemarks?.find(remark => remark.id === event.target.value)
      : emptyValue;
    setSelectedValue(event.target.value || emptyValue.id);
    const newText = selectedSpecialRemark?.text?.replaceAll('<br/>', '\n') || '';
    setSpecialRemarkValue(newText);
    handleSetSelectedValue({ id: selectedSpecialRemark?.id, text: newText } as SpecialRemark);
  };

  const handleChangeText = (event: React.ChangeEvent<{ value: string }>) => {
    handleSetSelectedValue({ id: selectedValue, text: event.target.value } as SpecialRemark);
  };

  const handleSetSelectedValue = (newRemarkValues: SpecialRemark) => {
    handleChange && handleChange(newRemarkValues);
  };

  const handleOnTextChange = (newText: string | undefined) => {
    setSpecialRemarkValue(newText || '');
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item md={3} xs={12} style={{ display: 'flex' }}>
        <Select
          value={selectedValue}
          margin={margin}
          onChange={event => handleSelectNewRemarkId(event as React.ChangeEvent<{ value: string }>)}
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
          onBlur={event => handleChangeText(event as React.ChangeEvent<{ value: string }>)}
        />
      </Grid>
    </Grid>
  );
};

const SpecialRemarksInput: React.FC<Props> = ({ specialRemarks, margin, handleChange }) => {
  const classes = useStyles();

  const handleAdd = () => {
    handleChange(specialRemarks ? specialRemarks.concat(emptyValue) : [emptyValue]);
  };

  const handleRemove = (item: SpecialRemark) => () => {
    specialRemarks && handleChange(specialRemarks.filter(remark => remark !== item));
  };

  const handleChangeSingleRemark = (specialRemark: SpecialRemark, index: number) => {
    if (specialRemarks) {
      const newRemarks = [...specialRemarks];
      newRemarks[index] = specialRemark;
      handleChange(newRemarks);
    }
  };

  return (
    <Box>
      {specialRemarks &&
        specialRemarks.map((item, i) => (
          <Paper key={i} className={classes.paper}>
            <Box display="flex">
              <Box flex="1" p={2}>
                <SingleSpecialRemarkInput
                  specialRemark={item}
                  handleChange={(remark: SpecialRemark) => handleChangeSingleRemark(remark, i)}
                  margin={margin}
                />
              </Box>
              <Box
                py={2}
                px={1}
                display="flex"
                alignContent="center"
                alignItems="center"
                className={classes.actionSection}
              >
                <IconButton onClick={handleRemove(item)} aria-label="delete" size="small">
                  <DeleteForeverIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        ))}
      <Box pt={specialRemarks && specialRemarks.length > 0 ? 1 : 0}>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleAdd}>
          Add special remark
        </Button>
      </Box>
    </Box>
  );
};

interface Props {
  specialRemarks?: SpecialRemark[];
  handleChange: (specialRemarks: SpecialRemark[]) => void;
  margin?: any;
}

export default SpecialRemarksInput;
