import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import FontFaceObserver from 'fontfaceobserver';
import { ThemeProvider } from '@material-ui/styles';
import { CssBaseline } from '@material-ui/core';
import App from './App';
import LoginDialogProvider from './components/LoginDialogProvider';
import CookiesNotification from './components/CookiesNotification';
import UserInfoProvider from './components/UserInfoProvider';
import FirestoreCollectionProvider from './providers/FirestoreCollection';
import UserRecordProvider from './providers/UserRecord';
import QuotesEndpointProvider from './providers/QuotesEndpoint';
import ContainerTypesContext from './contexts/ContainerTypes';
import CommodityTypesContext from './contexts/CommodityTypes';
import PickupLocationsContext from './contexts/PickupLocations';
import CarriersContext from './contexts/Carriers';
import PortsContext from './contexts/Ports';
import UserContext from './contexts/User';
import * as serviceWorker from './serviceWorker';
import theme from './theme';
import firebase from './firebase';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const appFont = new FontFaceObserver('Montserrat');

const fontLoaded = appFont.load();

const render = (user: firebase.User | null) => {
  const app = user ? (
    <Router>
      <CookiesNotification />
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <LoginDialogProvider>
            <UserContext.Provider value={user}>
              <UserRecordProvider>
                <UserInfoProvider>
                  <FirestoreCollectionProvider name="carriers" context={CarriersContext}>
                    <FirestoreCollectionProvider name="ports" context={PortsContext}>
                      <FirestoreCollectionProvider name="container-types" context={ContainerTypesContext}>
                        <FirestoreCollectionProvider name="commodity-types" context={CommodityTypesContext}>
                          <FirestoreCollectionProvider name="pickup-locations" context={PickupLocationsContext}>
                            <QuotesEndpointProvider>
                              <App />
                            </QuotesEndpointProvider>
                          </FirestoreCollectionProvider>
                        </FirestoreCollectionProvider>
                      </FirestoreCollectionProvider>
                    </FirestoreCollectionProvider>
                  </FirestoreCollectionProvider>
                </UserInfoProvider>
              </UserRecordProvider>
            </UserContext.Provider>
          </LoginDialogProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </Router>
  ) : (
    <Router>
      <CookiesNotification />
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <LoginDialogProvider>
            <UserContext.Provider value={null}>
              <FirestoreCollectionProvider name="carriers" context={CarriersContext}>
                <FirestoreCollectionProvider name="ports" context={PortsContext}>
                  <QuotesEndpointProvider>
                    <App />
                  </QuotesEndpointProvider>
                </FirestoreCollectionProvider>
              </FirestoreCollectionProvider>
            </UserContext.Provider>
          </LoginDialogProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </Router>
  );

  ReactDOM.render(app, document.getElementById('root'));
};

firebase.auth().onAuthStateChanged(async user => {
  try {
    await fontLoaded;
  } catch (error) {
    console.warn('Application font failed to load', error);
  }

  render(user);
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
