import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import FontFaceObserver from 'fontfaceobserver';
import { ThemeProvider } from '@material-ui/styles';
import { CssBaseline } from '@material-ui/core';
import App from './App';
import LoginDialogProvider from './components/LoginDialogProvider';
import UserProvider from './components/UserProvider';
import UserRecordProvider from './components/UserRecordProvider';
import ContainerTypesProvider from './components/ContainerTypesProvider';
import CarriersProvider from './components/CarriersProvider';
import CommodityTypesProvider from './components/CommodityTypesProvider';
import LocationsProvider from './components/LocationsProvider';
import PortsProvider from './components/PortsProvider';
import QuotesProvider from './components/QuotesProvider';
import * as serviceWorker from './serviceWorker';
import theme from './theme';
import CookiesNotification from './components/CookiesNotification';

const appFont = new FontFaceObserver('Montserrat');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = (
  <Router>
    <CookiesNotification />
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <LoginDialogProvider>
          <UserProvider>
            <UserRecordProvider>
              <ContainerTypesProvider>
                <CommodityTypesProvider>
                  <LocationsProvider>
                    <CarriersProvider>
                      <PortsProvider>
                        <QuotesProvider>
                          <CssBaseline />
                          <App />
                        </QuotesProvider>
                      </PortsProvider>
                    </CarriersProvider>
                  </LocationsProvider>
                </CommodityTypesProvider>
              </ContainerTypesProvider>
            </UserRecordProvider>
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
