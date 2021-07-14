import { Tag } from '../../model/Tag';
import React, { Fragment } from 'react';
import { Chip, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  smallTag: {
    maxWidth: 280,
    fontWeight: 700,
    fontSize: 12,
    color: 'white',
    borderRadius: 4,
    marginRight: '2px',
    paddingTop: 0,
    paddingBottom: 0,
  },
}));

const TagsPreviewList: React.FC<TagPreviewListProps> = ({ tags }) => {
  const classes = useStyles();

  return tags && tags[0] ? (
    <Fragment>
      {tags.map(tag => (
        <Chip label={tag.text} className={classes.smallTag} size="small" style={{ backgroundColor: tag.color }} />
      ))}
    </Fragment>
  ) : null;
};

interface TagPreviewListProps {
  tags?: Tag[];
}

export default TagsPreviewList;
