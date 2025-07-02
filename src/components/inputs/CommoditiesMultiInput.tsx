import React, { useCallback, useState, KeyboardEvent } from 'react';
import { TextField, Box, Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

interface CommoditiesMultiInputProps {
  label?: string;
  selectedCommodities?: string[];
  onChange?: (commodities: string[]) => void;
  placeholder?: string;
}

const useStyles = makeStyles({
  root: {
    '& .MuiOutlinedInput-root': {
      paddingTop: '8px',
      paddingBottom: '8px',
      paddingLeft: '12px',
      paddingRight: '12px',
    },
    '& .MuiOutlinedInput-input': {
      padding: '8px 0',
    },
  },
  chipsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginBottom: '8px',
  },
  chip: {
    height: '24px',
    '& .MuiChip-deleteIcon': {
      fontSize: '16px',
      color: '#f44336',
      '&:hover': {
        color: '#d32f2f',
      },
    },
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      minHeight: '56px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      paddingTop: '8px',
      paddingBottom: '8px',
    },
    '& .MuiOutlinedInput-input': {
      padding: '4px 0',
      marginTop: selectedCommodities => (selectedCommodities.length > 0 ? '4px' : '8px'),
    },
  },
});

const CommoditiesMultiInput: React.FC<CommoditiesMultiInputProps> = ({
  label = 'Commodities',
  selectedCommodities = [],
  onChange,
  placeholder = 'Add commodity and press Enter ↵',
}) => {
  const classes = useStyles(selectedCommodities);
  const [inputValue, setInputValue] = useState('');

  const handleCommodityChange = useCallback(
    (newCommodities: string[]) => {
      onChange?.(newCommodities);
    },
    [onChange],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && inputValue.trim()) {
        event.preventDefault();
        const newCommodity = inputValue.trim();
        if (!selectedCommodities.includes(newCommodity)) {
          const newCommodities = [...selectedCommodities, newCommodity];
          handleCommodityChange(newCommodities);
        }
        setInputValue('');
      }
    },
    [inputValue, selectedCommodities, handleCommodityChange],
  );

  const handleCommodityDelete = useCallback(
    (commodityToDelete: string) => {
      const newCommodities = selectedCommodities.filter(
        commodity => commodity !== commodityToDelete,
      );
      handleCommodityChange(newCommodities);
    },
    [selectedCommodities, handleCommodityChange],
  );

  return (
    <TextField
      className={classes.textField}
      label={label}
      variant="outlined"
      fullWidth
      multiline
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder={selectedCommodities.length === 0 ? placeholder : 'Add another...'}
      InputProps={{
        startAdornment: selectedCommodities.length > 0 && (
          <Box className={classes.chipsContainer}>
            {selectedCommodities.map((commodity, index) => (
              <Chip
                key={index}
                label={commodity}
                onDelete={() => handleCommodityDelete(commodity)}
                deleteIcon={<span>×</span>}
                className={classes.chip}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        ),
      }}
    />
  );
};

export default CommoditiesMultiInput;
