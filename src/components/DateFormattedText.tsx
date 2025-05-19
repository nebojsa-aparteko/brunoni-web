import React, { useState } from 'react';
import { Tooltip, Typography } from '@material-ui/core';
import formatDate from 'date-fns/format';
import { formatDateSafe, formatDistanceToNowConfigured } from '../utilities/formattingHelpers';

const DateFormattedText: React.FC<Props> = ({ date }) => {
  const [isFullDateFormat, setIsFullDateFormat] = useState(false);

  return (
    <Tooltip title="Click here to change date format" placement="bottom">
      <Typography
        variant="caption"
        onClick={() => setIsFullDateFormat(prevState => !prevState)}
        style={{ cursor: 'default' }}
      >
        {isFullDateFormat
          ? `${formatDateSafe(date, 'dd.MM.yyyy HH:mm:ss')}`
          : `${formatDistanceToNowConfigured(date)}`}
      </Typography>
    </Tooltip>
  );
};

export default DateFormattedText;

interface Props {
  date: Date;
}
