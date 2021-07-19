import React, { useContext, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import theme from '../../theme';
import { Tag, TagCategory } from '../../model/Tag';
import EditIcon from '@material-ui/icons/Edit';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import firebase from '../../firebase';
import { flow, isNil, omitBy, set } from 'lodash/fp';
import { SHOW_SUCCESS_SNACKBAR } from '../../store/types/globalAppState';
import { GlobalContext } from '../../store/GlobalStore';

const useStyles = makeStyles(() => ({
  dialogTitleBar: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
  },
  dialogBody: {},
  dialogContent: {
    paddingBottom: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
  },
  tagList: {
    maxHeight: '50vh',
    overflow: 'scroll',
  },
  tag: {
    width: 240,
    fontWeight: 700,
    color: 'white',
    borderRadius: 4,
  },
  hoverableTag: {
    width: 240,
    fontWeight: 700,
    color: 'white',
    borderRadius: 4,
    '&:hover': {
      borderRadius: 12,
    },
  },
}));

interface TagManagementProps {
  tag?: Tag;
  tagCategory: TagCategory;
  stopEditing: () => void;
}

const addTag = async (tagText: string, tagColor: string, tagCategory: TagCategory) => {
  firebase
    .firestore()
    .collection('tags')
    .add(
      flow(omitBy(isNil))({
        category: tagCategory,
        text: tagText,
        color: tagColor,
        createdAt: new Date(),
      }),
    );
};

const updateTag = async (tag: Tag, tagText: string, tagColor: string) => {
  firebase
    .firestore()
    .collection('tags')
    .doc(tag.id)
    .set(
      flow(omitBy(isNil))({
        category: tag.category,
        text: tagText || tag.text,
        color: tagColor || tag.color,
      } as Tag),
    );
};

const deleteTag = async (tag: Tag) => {
  tag &&
    tag.id &&
    firebase
      .firestore()
      .collection('tags')
      .doc(tag.id)
      .delete();
};

const TagManagementContent: React.FC<TagManagementProps> = ({ tag, tagCategory, stopEditing }) => {
  const [, dispatch] = useContext(GlobalContext);
  const [tagText, setTagText] = useState(tag?.text || '');
  const [tagColor, setTagColor] = useState(tag?.color || '');

  const handleManageTag = (tag?: Tag) => {
    if (tag) {
      updateTag(tag, tagText, tagColor)
        .then(() =>
          dispatch({
            type: SHOW_SUCCESS_SNACKBAR,
            message: `The tag has been updated.`,
          }),
        )
        .catch(() =>
          dispatch({
            type: 'SHOW_ERROR_SNACKBAR',
            message: `An error has occurred during the updating of the tag.`,
          }),
        );
    } else {
      addTag(tagText, tagColor, tagCategory)
        .then(() =>
          dispatch({
            type: SHOW_SUCCESS_SNACKBAR,
            message: `The tag has been created.`,
          }),
        )
        .catch(() =>
          dispatch({
            type: 'SHOW_ERROR_SNACKBAR',
            message: `An error has occurred during tag creation.`,
          }),
        );
    }
    stopEditing();
  };

  const handleDeleteTag = (tag: Tag) => {
    deleteTag(tag)
      .then(() =>
        dispatch({
          type: SHOW_SUCCESS_SNACKBAR,
          message: `The tag has been deleted.`,
        }),
      )
      .catch(() =>
        dispatch({
          type: 'SHOW_ERROR_SNACKBAR',
          message: `An error has occurred during tag deletion.`,
        }),
      )
      .finally(() => stopEditing());
  };

  return (
    <React.Fragment>
      <TextField
        label="Name"
        value={tagText || ''}
        onChange={event => setTagText(event.target.value)}
        variant="outlined"
        margin="dense"
      />
      <TextField
        label="Color"
        value={tagColor || ''}
        onChange={event => setTagColor(event.target.value)}
        variant="outlined"
        margin="dense"
      />
      <Box flex={1} display="flex" justifyContent="space-between" mt={1}>
        <Button
          onClick={() => handleManageTag(tag)}
          size="small"
          variant="contained"
          color="primary"
          disabled={!tagText || tagText.trim() === '' || !tagColor || tagColor.trim() === ''}
        >
          {tag ? 'Save' : 'Create'}
        </Button>
        {tag && (
          <Button
            onClick={() => handleDeleteTag(tag)}
            size="small"
            variant="contained"
            color="secondary"
            style={{ backgroundColor: '#cd0000' }}
          >
            Delete
          </Button>
        )}
      </Box>
    </React.Fragment>
  );
};

interface TagRepresentationListProps {
  tags: Tag[];
  setTagToBeEdited: (tag: Tag) => void;
  selectedTags?: Tag[];
  tagCategory: TagCategory;
  documentId?: string;
}

const TagRepresentationList: React.FC<TagRepresentationListProps> = ({
  tags,
  setTagToBeEdited,
  selectedTags,
  tagCategory,
  documentId,
}) => {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column" mb={1} className={classes.tagList}>
      {tags.map(tag => (
        <TagRepresentation
          key={tag.id}
          tag={tag}
          setTagToBeEdited={setTagToBeEdited}
          selectedTags={selectedTags}
          tagCategory={tagCategory}
          documentId={documentId}
        />
      ))}
    </Box>
  );
};

interface TagRepresentationProps {
  tag: Tag;
  setTagToBeEdited: (tag: Tag) => void;
  selectedTags?: Tag[];
  tagCategory: TagCategory;
  documentId?: string;
}

const addSelectedTag = (tagCategory: TagCategory, tag: Tag, documentId: string) => {
  return firebase
    .firestore()
    .collection(tagCategory === TagCategory.BOOKING ? 'bookings' : 'bookings-requests')
    .doc(documentId)
    .collection(tagCategory === TagCategory.BOOKING ? 'tags-booking' : 'tags-booking-request')
    .doc(tag.id)
    .set(set('createdAt', new Date())(tag));
};

const removeSelectedTag = (tagCategory: TagCategory, tagId: string, documentId: string) => {
  return firebase
    .firestore()
    .collection(tagCategory === TagCategory.BOOKING ? 'bookings' : 'bookings-requests')
    .doc(documentId)
    .collection(tagCategory === TagCategory.BOOKING ? 'tags-booking' : 'tags-booking-request')
    .doc(tagId)
    .delete();
};

const TagRepresentation: React.FC<TagRepresentationProps> = ({
  tag,
  setTagToBeEdited,
  selectedTags,
  tagCategory,
  documentId,
}) => {
  const classes = useStyles();
  const isSelected = useMemo(() => selectedTags?.some(selectedTag => selectedTag.id === tag.id), [
    selectedTags,
    tag.id,
  ]);
  const [, dispatch] = useContext(GlobalContext);

  const handleChangeSelected = () => {
    if (isSelected) {
      documentId &&
        tagCategory &&
        tag.id &&
        removeSelectedTag(tagCategory, tag.id, documentId)
          .then(() =>
            dispatch({
              type: SHOW_SUCCESS_SNACKBAR,
              message: `The tag has been deselected.`,
            }),
          )
          .catch(() =>
            dispatch({
              type: 'SHOW_ERROR_SNACKBAR',
              message: `An error has occurred during the deselection of the tag.`,
            }),
          );
    } else {
      documentId &&
        tagCategory &&
        tag.id &&
        addSelectedTag(tagCategory, tag, documentId)
          .then(() =>
            dispatch({
              type: SHOW_SUCCESS_SNACKBAR,
              message: `The tag has been selected.`,
            }),
          )
          .catch(() =>
            dispatch({
              type: 'SHOW_ERROR_SNACKBAR',
              message: `An error has occurred during the selection of the tag.`,
            }),
          );
    }
  };

  return (
    <Box display="flex" flexDirection="row" p="2px">
      <Chip
        label={tag.text}
        icon={isSelected ? <CheckCircleIcon style={{ color: 'white' }} /> : undefined}
        onClick={documentId ? handleChangeSelected : undefined}
        className={documentId ? classes.hoverableTag : classes.tag}
        style={{ backgroundColor: tag.color }}
      />
      <IconButton size={'small'} onClick={() => setTagToBeEdited(tag)}>
        <EditIcon />
      </IconButton>
    </Box>
  );
};

const TagManagementDialog: React.FC<TagManagementDialogProps> = ({
  isOpen,
  handleClose,
  tags,
  tagCategory,
  selectedTags,
  documentId,
}) => {
  const classes = useStyles();
  const [isEditingOrCreating, setIsEditingOrCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>(undefined);

  const handleAddNewTag = () => {
    setEditingTag(undefined);
    setIsEditingOrCreating(true);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setIsEditingOrCreating(true);
  };

  const handleFinishEditing = () => {
    setEditingTag(undefined);
    setIsEditingOrCreating(false);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      onExited={handleFinishEditing}
      aria-labelledby="dialog-title-tags"
      maxWidth="md"
    >
      <span className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-tags" className={classes.dialogTitleBar}>
          {isEditingOrCreating && (
            <IconButton size="small" onClick={() => setIsEditingOrCreating(false)}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h4">Tags</Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {isEditingOrCreating ? (
            <TagManagementContent tag={editingTag} tagCategory={tagCategory} stopEditing={handleFinishEditing} />
          ) : (
            <React.Fragment>
              <TagRepresentationList
                tags={tags}
                setTagToBeEdited={handleEditTag}
                selectedTags={selectedTags}
                tagCategory={tagCategory}
                documentId={documentId}
              />
              <Button variant="contained" onClick={handleAddNewTag} style={{ margin: 'auto' }}>
                Add New Tag
              </Button>
            </React.Fragment>
          )}
        </DialogContent>
      </span>
    </Dialog>
  );
};

interface TagManagementDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  tags: Tag[];
  tagCategory: TagCategory;
  selectedTags?: Tag[];
  documentId?: string;
}

export default TagManagementDialog;
