import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

export default createMuiTheme({
  typography: {
    fontFamily: 'Montserrat,Helvetica,Arial,sans-serif',
    fontSize: 14,
  },
  palette: {
    background: {
      // TODO Review this.
      default: 'white',
      paper: 'lightgrey',
    },
  },
});
