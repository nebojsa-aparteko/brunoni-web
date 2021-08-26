import React from 'react';
import { IconButton } from '@material-ui/core';
import CompareIcon from '@material-ui/icons/Compare';

const CompareWithInitialButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
  <IconButton size="small" onClick={onClick} disabled={disabled}>
    <CompareIcon />
  </IconButton>
);

export default CompareWithInitialButton;
