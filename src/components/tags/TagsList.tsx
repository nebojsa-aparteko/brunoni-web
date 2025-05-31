import React, { useContext, useState } from 'react';
import { Tag, TagCategory } from '../../model/Tag';
import { Box, Chip, IconButton, makeStyles, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import TagManagementDialog from './TagManagementDialog';
import Tags from '../../contexts/Tags';

const useStyles = makeStyles(() => ({
  tagList: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
  },
  tag: {
    maxWidth: 280,
    fontWeight: 700,
    color: 'white',
    borderRadius: 4,
    marginRight: '2px',
    marginTop: '1px',
    marginBottom: '1px',
  },
  hidePrint: {
    '@media print': {
      display: 'none',
    },
  },
}));

interface TagItemProps {
  tag: Tag;
}

export const TagItem: React.FC<TagItemProps> = ({ tag }) => {
  const classes = useStyles();

  return (
    <Chip
      label={tag.text}
      size="small"
      className={classes.tag}
      style={{ backgroundColor: tag.color }}
    />
  );
};

const TagsList: React.FC<TagsListProps> = ({ tags, tagCategory, documentId }) => {
  const classes = useStyles();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const availableTags = useContext(Tags);
  return (
    <Box
      display="flex"
      flexDirection="row"
      mb={1}
      alignItems="center"
      border="1px solid rgba(0,0,0,0.15)"
      p={1}
      maxWidth="100%"
      className={classes.hidePrint}
    >
      <Typography variant="subtitle2">Tags:</Typography>
      <Box display="flex" flexDirection="row" className={classes.tagList} mx={1}>
        {tags.map(tag => (
          <TagItem key={tag.id} tag={tag} />
        ))}
      </Box>
      <IconButton size="small" onClick={() => setIsDialogOpen(true)}>
        <AddIcon />
      </IconButton>
      <TagManagementDialog
        isOpen={isDialogOpen}
        handleClose={() => setIsDialogOpen(false)}
        tags={availableTags || []}
        tagCategory={tagCategory}
        selectedTags={tags}
        documentId={documentId}
      />
    </Box>
  );
};

interface TagsListProps {
  tags: Tag[];
  tagCategory: TagCategory;
  documentId?: string;
}

export default TagsList;
