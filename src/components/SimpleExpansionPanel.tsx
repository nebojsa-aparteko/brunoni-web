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
import { TransitionProps } from '@material-ui/core/transitions';

const useStyles = makeStyles(() =>
  createStyles({
    elevatedComponent: {
      boxShadow: '0 0 0 1px rgba(63,63,68,0.05), 0 1px 3px 0 rgba(63,63,68,0.15)',
    },
    fullWidth: {
      width: '100%',
    },
  }),
);

const SimpleExpansionPanel = ({
  label,
  defaultExpanded,
  children,
  fullWidth = false,
  TransitionProps,
}: Props) => {
  const classes = useStyles();

  return (
    <ExpansionPanel
      defaultExpanded={defaultExpanded}
      className={fullWidth ? classes.fullWidth : ''}
      TransitionProps={TransitionProps}
    >
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} className={classes.elevatedComponent}>
        <Typography>{label}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.elevatedComponent}>
        {children}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

interface Props {
  label: string;
  defaultExpanded?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
  TransitionProps?: TransitionProps;
}

export default SimpleExpansionPanel;
