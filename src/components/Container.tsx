import React from 'react';
import { Box, Container } from '@material-ui/core';
import { ContainerProps } from '@material-ui/core/Container';

export default (props: ContainerProps) => <Container maxWidth="lg" {...props} />;
