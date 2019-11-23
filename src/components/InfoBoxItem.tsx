import { Box, Typography } from '@material-ui/core';
import React, { Fragment } from 'react';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

interface Props {
  IconComponent?: React.ComponentType<SvgIconProps>;
  title?: String | null;
  label1?: String;
  label1HTML?: any;
  label2?: String;
  gutterBottom?: boolean;
}

const InfoBoxItem: React.FC<Props> = ({ IconComponent, title, label1, label1HTML, label2, gutterBottom }) => {
  const hasLabel1 = label1 || label1HTML;
  return (
    <Fragment>
      <Typography variant="subtitle2" display="block" gutterBottom>
        <Box display="flex" alignItems="center" fontWeight="fontWeightBold">
          {IconComponent && <IconComponent fontSize="small" color="secondary" />}
          <Box ml={IconComponent && '.5em'}>{title || ''}</Box>
        </Box>
      </Typography>
      {hasLabel1 && (
        <Typography variant="body1" display="block">
          {label1HTML ? <span dangerouslySetInnerHTML={label1HTML} /> : <span>{label1}</span>}
        </Typography>
      )}
      {label2 && (
        <Typography variant="body2" display="block" gutterBottom={gutterBottom}>
          {label2}
        </Typography>
      )}
    </Fragment>
  );
};

export default InfoBoxItem;
