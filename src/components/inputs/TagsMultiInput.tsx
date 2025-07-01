import React, { useCallback, useState, KeyboardEvent } from 'react';
import { TextField, Box, Chip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

interface TagsMultiInputProps {
  label?: string;
  selectedTags?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
}

const useStyles = makeStyles({
  customTextField: {
    '& input::placeholder': {
      fontSize: '15px',
    },
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '4px',
    color: '#666',
  },
  deletableChip: {
    '& .MuiChip-deleteIcon': {
      fontSize: '18px',
      color: '#f44336',
      '&:hover': {
        color: '#d32f2f',
      },
    },
  },
});

const TagsMultiInput: React.FC<TagsMultiInputProps> = ({
  label = 'Tags',
  selectedTags = [],
  onChange,
  placeholder = 'Add tag and press Enter ↵',
}) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');

  const handleTagChange = useCallback(
    (newTags: string[]) => {
      onChange?.(newTags);
    },
    [onChange],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && inputValue.trim()) {
        event.preventDefault();
        const newTag = inputValue.trim();
        if (!selectedTags.includes(newTag)) {
          const newTags = [...selectedTags, newTag];
          handleTagChange(newTags);
        }
        setInputValue('');
      }
    },
    [inputValue, selectedTags, handleTagChange],
  );

  const handleTagDelete = useCallback(
    (tagToDelete: string) => {
      const newTags = selectedTags.filter(tag => tag !== tagToDelete);
      handleTagChange(newTags);
    },
    [selectedTags, handleTagChange],
  );

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <TextField
        className={classes.customTextField}
        label={label}
        placeholder={placeholder}
        variant="outlined"
        fullWidth
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
      />

      {selectedTags.length > 0 && (
        <Box>
          <Typography className={classes.sectionTitle}>Selected tags:</Typography>
          <Box className={classes.tagsContainer}>
            {selectedTags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleTagDelete(tag)}
                deleteIcon={<span>×</span>}
                className={classes.deletableChip}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TagsMultiInput;
