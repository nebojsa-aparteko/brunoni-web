import React, { useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Box, Paper, Typography } from '@material-ui/core';
import TagsMultiInput from '../inputs/TagsMultiInput';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  tagsContainer: {
    maxWidth: 600,
  },
}));

const TagsContainer: React.FC = () => {
  const classes = useStyles();
  const [selectedTags, setSelectedTags] = useState<string[]>(['urgent', 'priority', 'export']);

  // Sample predefined tags
  const availableTags = [
    'urgent',
    'priority',
    'export',
    'import',
    'hazardous',
    'oversized',
    'refrigerated',
    'fragile',
    'bulk',
    'container',
    'liquid',
    'dry',
    'perishable',
    'valuable',
    'express',
    'economy',
  ];

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    console.debug('Tags updated:', tags);
  };

  return (
    <Box className={classes.container}>
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>
          Opportunity Tags Configuration
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Configure tags that can be used to categorize and filter opportunities. You can select
          from existing tags or create new ones by typing and pressing Enter.
        </Typography>

        <Box className={classes.tagsContainer} mt={3}>
          <TagsMultiInput
            data={availableTags}
            selectedTags={selectedTags}
            onChange={handleTagsChange}
            label="Available Tags"
          />
        </Box>

        {selectedTags.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Currently selected tags: {selectedTags.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedTags.join(', ')}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
//Tags should be free text without duplicates

export default TagsContainer;
