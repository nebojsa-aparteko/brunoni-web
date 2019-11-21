import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import FontFaceObserver from 'fontfaceobserver';
import { ThemeProvider } from '@material-ui/styles';
import { CssBaseline } from '@material-ui/core';
import theme from './theme';
import App from './App';
import LoginDialogProvider from './components/LoginDialogProvider';
import UserProvider from './components/UserProvider';
import * as serviceWorker from './serviceWorker';

const appFont = new FontFaceObserver('Montserrat');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = (
  <Router>
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <LoginDialogProvider>
          <UserProvider>
            <CssBaseline />
            <App />
          </UserProvider>
        </LoginDialogProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </Router>
);

appFont.load().then(() => {
  ReactDOM.render(app, document.getElementById('root'));
});
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
