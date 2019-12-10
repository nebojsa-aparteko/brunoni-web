import { Box, makeStyles, Theme, Typography } from '@material-ui/core';
import React, { Fragment } from 'react';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

interface Props {
  IconComponent?: React.ComponentType<SvgIconProps>;
  title?: React.ReactNode;
  label1?: React.ReactNode;
  label1HTML?: any;
  label2?: React.ReactNode;
  gutterBottom?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  printText: {
    ['@media print']: {
      fontSize: '10px',
    },
  },
}));

const InfoBoxItem: React.FC<Props> = ({ IconComponent, title, label1, label1HTML, label2, gutterBottom }) => {
  const classes = useStyles();
  const hasLabel1 = label1 || label1HTML;
  return (
    <Fragment>
      {title && (
        <Typography variant="subtitle2" display="block" gutterBottom className={classes.printText}>
          <Box display="flex" alignItems="center" fontWeight="fontWeightBold">
            {IconComponent && <IconComponent fontSize="small" color="secondary" />}
            <Box ml={IconComponent && '.5em'}>{title}</Box>
          </Box>
        </Typography>
      )}
      {hasLabel1 && (
        <Typography variant="body1" display="block" className={classes.printText}>
          {label1HTML ? <span dangerouslySetInnerHTML={label1HTML} /> : <span>{label1}</span>}
        </Typography>
      )}
      {label2 && (
        <Typography variant="body2" display="block" gutterBottom={gutterBottom} className={classes.printText}>
          {label2}
        </Typography>
      )}
    </Fragment>
  );
};

export default InfoBoxItem;
