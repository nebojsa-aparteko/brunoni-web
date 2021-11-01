import React from 'react';
import { Drawer } from '@material-ui/core';
import TeamsRowForm from './TeamsRowForm';
import { Team } from '../../../model/Teams';
import { makeStyles } from '@material-ui/core/styles';

interface Props {
  team?: Team;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});

const TeamsRowDrawer: React.FC<Props> = ({ team, open, setOpen }) => {
  const classes = useStyles();

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Drawer
      open={open}
      onClose={(event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        handleClose();
      }}
      anchor="right"
      classes={{ paper: classes.paper }}
    >
      <TeamsRowForm team={team} handleClose={handleClose} />
    </Drawer>
  );
};

export default TeamsRowDrawer;
