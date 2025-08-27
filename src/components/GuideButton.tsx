import React, { Fragment, useState } from 'react';
import Shepherd from 'shepherd.js';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import 'shepherd.js/dist/css/shepherd.css';
import GuideDialog from './GuideDialog';
import useUser from '../hooks/useUser';
import { showCrispChat } from '../CrispChat';

const GuideButton: React.FC<Props> = ({ guide }) => {
  const [, user] = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(user ? !user.dontShowGuide : false);

  const handleDialogClose = () => {
    showCrispChat(true);
    setIsDialogOpen(false);
  };

  return (
    <Fragment>
      <IconButton
        id="helpButtonNav"
        aria-label="tour-button-icon"
        onClick={guide.start}
        style={{ padding: 8 }}
      >
        <HelpOutlineIcon color="disabled" fontSize="default" />
      </IconButton>
      <GuideDialog isOpen={isDialogOpen} handleClose={handleDialogClose} />
    </Fragment>
  );
};

interface Props {
  guide: Shepherd.Tour;
}

export default GuideButton;
