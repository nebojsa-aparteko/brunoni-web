import { Button, IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import React from 'react';

const EditButton: React.FC<EditButtonProps> = ({ editing, startEditing, disabled, handleCancelEditing, handleSave }) =>
  editing ? (
    <>
      <Button variant="contained" onClick={handleCancelEditing} size="small">
        Cancel
      </Button>
      <Button color={'primary'} variant="contained" onClick={handleSave} size="small" style={{ marginLeft: '1em' }}>
        Save changes
      </Button>
    </>
  ) : (
    <IconButton size="small" aria-label="Edit" component="span" onClick={startEditing} disabled={disabled}>
      <EditIcon />
    </IconButton>
  );

export default EditButton;

interface EditButtonProps {
  handleCancelEditing: () => void;
  handleSave: () => void;
  disabled: boolean;
  editing: boolean;
  startEditing: () => void;
}
