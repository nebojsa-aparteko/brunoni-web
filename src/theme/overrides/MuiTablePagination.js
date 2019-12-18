import { createMuiTheme } from '@material-ui/core';

const theme = createMuiTheme();

export default {
  toolbar: {
    [theme.breakpoints.down('sm')]: {
      padding: 0,
      flex: 1,
    },
  },
  selectRoot: {
    [theme.breakpoints.down('sm')]: {
      marginRight: '1em',
    },
  },
  actions: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    },
  },
};
