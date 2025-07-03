import React, { useState, useEffect, useCallback, useContext } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Box, Paper, Typography, Button, Chip } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import firebase from 'firebase/compat/app';
import { GlobalContext } from '../../store/GlobalStore';
import TagsMultiInput from '../inputs/TagsMultiInput';
import { OpportunityTag } from '../../model/OpportunityTag';

interface TagsContainerProps {
  opportunityId?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
  },
  tagsContainer: {
    maxWidth: 600,
  },
  existingTagsContainer: {
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
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(1),
  },
}));

const COLLECTION_NAME = 'opportunity-tags';

const TagsContainer: React.FC<TagsContainerProps> = () => {
  const classes = useStyles();
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<OpportunityTag[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExistingTags = useCallback(async () => {
    try {
      const existingTagsSnapshot = await firebase.firestore().collection(COLLECTION_NAME).get();

      const tags = existingTagsSnapshot.docs.map(doc => ({
        id: doc.id,
        tag: doc.data().tag,
      }));

      setExistingTags(tags);
    } catch (error) {
      console.error('Error loading existing tags:', error);
      enqueueSnackbar('Error loading tags from database!', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadExistingTags();
  }, [loadExistingTags]);

  const handleTagsChange = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, []);

  const handleDeleteTagFromDatabase = useCallback(
    async (tagId: string, tagName: string) => {
      if (!window.confirm(`Are you sure you want to delete the tag "${tagName}"?`)) {
        return;
      }

      dispatch({ type: 'START_GLOBAL_LOADING' });
      try {
        await firebase.firestore().collection(COLLECTION_NAME).doc(tagId).delete();

        setExistingTags(prev => prev.filter(t => t.id !== tagId));

        setSelectedTags(prev => prev.filter(tag => tag !== tagName));

        enqueueSnackbar(`Tag "${tagName}" deleted successfully!`, {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error('Error deleting tag:', error);
        enqueueSnackbar('Error deleting tag from database!', {
          variant: 'error',
          autoHideDuration: 3000,
        });
      } finally {
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
      }
    },
    [dispatch, enqueueSnackbar],
  );

  const handleSaveTags = useCallback(async () => {
    if (selectedTags.length === 0) {
      enqueueSnackbar('No tags selected to save!', {
        variant: 'warning',
        autoHideDuration: 2000,
      });
      return;
    }

    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      const existingTagNames = existingTags.map(t => t.tag);
      const newTags = selectedTags.filter(tag => !existingTagNames.includes(tag));

      if (newTags.length > 0) {
        const savePromises = newTags.map(tag =>
          firebase.firestore().collection(COLLECTION_NAME).add({ tag }),
        );

        const savedDocs = await Promise.all(savePromises);

        const newTagObjects: OpportunityTag[] = savedDocs.map((doc, index) => ({
          id: doc.id,
          tag: newTags[index],
        }));
        setExistingTags(prev => [...prev, ...newTagObjects]);

        enqueueSnackbar(
          `${newTags.length} new tag${newTags.length > 1 ? 's' : ''} saved successfully!`,
          {
            variant: 'success',
            autoHideDuration: 2000,
          },
        );
      } else {
        enqueueSnackbar('No new tags to save (all tags already exist)', {
          variant: 'info',
          autoHideDuration: 2000,
        });
      }

      setSelectedTags([]);
    } catch (error) {
      console.error('Error saving tags:', error);
      enqueueSnackbar('Error saving tags!', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    } finally {
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    }
  }, [selectedTags, existingTags, dispatch, enqueueSnackbar]);

  const handleClearSelection = useCallback(() => {
    setSelectedTags([]);
  }, []);

  if (loading) {
    return (
      <Box className={classes.container}>
        <Paper className={classes.paper}>
          <Typography>Loading tags...</Typography>
        </Paper>
      </Box>
    );
  }

  const hasNewTags = selectedTags.some(
    tag => !existingTags.some(existingTag => existingTag.tag === tag),
  );

  return (
    <Box className={classes.container}>
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>
          Opportunity Tags Configuration
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Configure tags that can be used to categorize and filter opportunities. Create new tags by
          typing and pressing Enter.
        </Typography>

        <Box className={classes.tagsContainer} mt={3}>
          <TagsMultiInput
            selectedTags={selectedTags}
            onChange={handleTagsChange}
            label="Add New Tags"
            placeholder="Type tag name and press Enter ↵"
          />

          {existingTags.length > 0 && (
            <Box mt={3}>
              <Typography className={classes.sectionTitle}>
                Existing tags in database ({existingTags.length}):
              </Typography>
              <Box className={classes.existingTagsContainer}>
                {existingTags.map(tagObj => (
                  <Chip
                    key={tagObj.id}
                    label={tagObj.tag}
                    onDelete={() => handleDeleteTagFromDatabase(tagObj.id, tagObj.tag)}
                    deleteIcon={<span>×</span>}
                    className={classes.deletableChip}
                    color="default"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}

          {selectedTags.length > 0 && (
            <Box className={classes.buttonContainer}>
              <Button
                onClick={handleSaveTags}
                size="small"
                color="primary"
                variant="contained"
                disabled={!hasNewTags}
              >
                Save {hasNewTags ? 'New ' : ''}Tags to Database
              </Button>
              <Button
                onClick={handleClearSelection}
                size="small"
                color="default"
                variant="outlined"
              >
                Clear Selection
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TagsContainer;
