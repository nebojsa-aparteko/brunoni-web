import React from 'react';
import Shepherd from 'shepherd.js';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import 'shepherd.js/dist/css/shepherd.css';

const GuideButton: React.FC<Props> = ({ guide }) => {
  return (
    <IconButton id="helpButtonNav" aria-label="tour-button-icon" onClick={guide.start} style={{ padding: 8 }}>
      <HelpOutlineIcon color="disabled" fontSize="default" />
    </IconButton>
  );
};

interface Props {
  guide: Shepherd.Tour;
}

export default GuideButton;
