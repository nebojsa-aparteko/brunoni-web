import React from 'react';
import { Avatar } from '@material-ui/core';
import { getInitials } from '../../../utilities/getInitials';

export const ActivityLogAvatar = ({ name }: Props) => {
  return <Avatar alt={name}>{getInitials(name)}</Avatar>;
};

interface Props {
  name: any;
}
