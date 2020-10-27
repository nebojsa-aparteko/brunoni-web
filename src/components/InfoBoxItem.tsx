import { Box, makeStyles, Typography } from '@material-ui/core';
import React, { Fragment } from 'react';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

interface Props {
  IconComponent?: React.ComponentType<SvgIconProps>;
  title?: React.ReactNode;
  label1?: React.ReactNode | string;
  label1HTML?: any;
  label2?: React.ReactNode;
  gutterBottom?: boolean;
  occupySpaceForTitle?: boolean;
}

const useStyles = makeStyles(() => ({
  printText: {
    ['@media print']: {
      fontSize: '10px',
    },
  },
  titleBox: {
    minHeight: '29px', // theme.typography.subtitle2.lineHeight + '8',
  },
}));

const InfoBoxItem: React.FC<Props> = ({
  IconComponent,
  title,
  label1,
  label1HTML,
  label2,
  gutterBottom,
  occupySpaceForTitle = false,
}) => {
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
      {occupySpaceForTitle && <Box className={classes.titleBox} />}
      {hasLabel1 ? (
        <Typography variant="body1" display="block" className={classes.printText} component={'span'}>
          {label1HTML ? <span dangerouslySetInnerHTML={label1HTML} /> : <span>{label1}</span>}
        </Typography>
      ) : (
        label1
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
