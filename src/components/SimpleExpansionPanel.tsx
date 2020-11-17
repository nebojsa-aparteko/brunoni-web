import React from 'react';
import {
  createStyles,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  makeStyles,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ReactNode } from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    elevatedComponent: {
      boxShadow: '0 0 0 1px rgba(63,63,68,0.05), 0 1px 3px 0 rgba(63,63,68,0.15)',
    },
  }),
);

const SimpleExpansionPanel = ({ label, children }: Props) => {
  const classes = useStyles();

  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} className={classes.elevatedComponent}>
        <Typography>{label}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.elevatedComponent}>{children}</ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

interface Props {
  label: string;
  children: ReactNode;
}

export default SimpleExpansionPanel;
