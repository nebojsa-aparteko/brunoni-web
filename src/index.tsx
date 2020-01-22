import React, { useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, useHistory, useLocation } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import FontFaceObserver from 'fontfaceobserver';
import { ThemeProvider } from '@material-ui/styles';
import { CssBaseline } from '@material-ui/core';
import App from './App';
import LoginDialogProvider from './components/LoginDialogProvider';
import CookiesNotification from './components/CookiesNotification';
import ActingAsProvider from './providers/ActingAs';
import FirestoreCollectionProvider from './providers/FirestoreCollection';
import FirestoreClientDocumentProvider from './providers/FirestoreClientDocument';
import UserRecordProvider from './providers/UserRecord';
import QuotesProvider from './providers/Quotes';
import QuoteGroupsProvider from './providers/QuoteGroups';
import AdminQuotesProvider from './providers/AdminQuotes';
import SpecialOffersProvider from './providers/SpecialOffers';
import ContainerTypesContext from './contexts/ContainerTypes';
import CommodityTypesContext from './contexts/CommodityTypes';
import PickupLocationsContext from './contexts/PickupLocations';
import StatisticsContext from './contexts/Statistics';
import CarriersContext from './contexts/Carriers';
import PortsContext from './contexts/Ports';
import UserContext from './contexts/User';
import UserRecordsContext from './contexts/UserRecords';
import * as serviceWorker from './serviceWorker';
import theme from './theme';
import firebase from './firebase';
import { RouteSearchProvider } from './contexts/RouteSearchContext';
import { QuoteListProvider } from './contexts/QuoteListContext';
import ActingAs from './contexts/ActingAs';
import UserRecordContext from './contexts/UserRecord';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const appFont = new FontFaceObserver('Montserrat');

const fontLoaded = appFont.load();

const showIntercom = (show: Boolean) => {
  Intercom('update', {
    hide_default_launcher: !show,
  });
};

const UserApp: React.FC = () => {
  const userRecord = useContext(UserRecordContext);
  const [actingAs] = useContext(ActingAs);

  if (userRecord) {
    Intercom('update', {
      name: `${userRecord.firstName} ${userRecord.lastName}`,
      alphacomId: userRecord.alphacomId,
      company: {
        id: userRecord.alphacomClientId,
        name: userRecord.company.name,
        city: userRecord.company.city,
        countryCode: userRecord.company.countryCode,
      },
    });
  }

  switch (actingAs) {
    case undefined:
      showIntercom(true);
      return <App />;
    case null:
      switch (userRecord) {
        case undefined:
          showIntercom(true);
          return <App />;
        case null:
          showIntercom(true);
          // Company
          return (
            <FirestoreClientDocumentProvider collection="statistics" context={StatisticsContext}>
              <QuotesProvider>
                <QuoteGroupsProvider>
                  <QuoteListProvider>
                    <App />
                  </QuoteListProvider>
                </QuoteGroupsProvider>
              </QuotesProvider>
            </FirestoreClientDocumentProvider>
          );
        default:
          if (userRecord.isAdmin) {
            showIntercom(false);
          } else {
            showIntercom(true);
          }
          return userRecord.isAdmin ? (
            <AdminQuotesProvider>
              <QuoteGroupsProvider>
                <QuoteListProvider>
                  <FirestoreCollectionProvider name="users" context={UserRecordsContext}>
                    <App />
                  </FirestoreCollectionProvider>
                </QuoteListProvider>
              </QuoteGroupsProvider>
            </AdminQuotesProvider>
          ) : (
            <App />
          );
      }
    default:
      showIntercom(true);
      return (
        <FirestoreClientDocumentProvider collection="statistics" context={StatisticsContext}>
          <QuotesProvider>
            <QuoteGroupsProvider>
              <QuoteListProvider>
                <App />
              </QuoteListProvider>
            </QuoteGroupsProvider>
          </QuotesProvider>
        </FirestoreClientDocumentProvider>
      );
  }
};

const IntercomRouteUpdater = () => {
  const history = useHistory();

  useEffect(() => {
    Intercom('update', { last_request_at: new Date().getTime() / 1000 });
  }, [history.location.pathname]);

  return null;
};

let prevUser: firebase.User | null | undefined = undefined;

const render = (user: firebase.User | null) => {
  if (prevUser && !user) {
    Intercom('shutdown');
  } else {
    Intercom('boot', {
      app_id: 'p6unnr5i',
      ...(user
        ? {
            email: user.email,
            user_id: user.uid,
            user_hash: '78006440b1b39b8027c8c865cc9f3b2ac92afb6e0fcceb4ac7da2182ec40237b',
            ...(user.metadata && user.metadata.creationTime
              ? {
                  created_at: new Date(user.metadata.creationTime).getTime() / 1000,
                }
              : {}),
          }
        : {}),
    });
  }

  prevUser = user;

  const app = (
    <Router>
      <IntercomRouteUpdater />
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <LoginDialogProvider>
            <ScrollToTop />
            <CssBaseline />
            <CookiesNotification />
            <RouteSearchProvider>
              {user ? (
                <UserContext.Provider value={user}>
                  <UserRecordProvider>
                    <FirestoreCollectionProvider name="carriers" context={CarriersContext}>
                      <FirestoreCollectionProvider name="ports" context={PortsContext}>
                        <FirestoreCollectionProvider name="container-types" context={ContainerTypesContext}>
                          <SpecialOffersProvider>
                            <FirestoreCollectionProvider name="commodity-types" context={CommodityTypesContext}>
                              <FirestoreCollectionProvider name="pickup-locations" context={PickupLocationsContext}>
                                <ActingAsProvider>
                                  <UserApp />
                                </ActingAsProvider>
                              </FirestoreCollectionProvider>
                            </FirestoreCollectionProvider>
                          </SpecialOffersProvider>
                        </FirestoreCollectionProvider>
                      </FirestoreCollectionProvider>
                    </FirestoreCollectionProvider>
                  </UserRecordProvider>
                </UserContext.Provider>
              ) : (
                <UserContext.Provider value={null}>
                  <FirestoreCollectionProvider name="carriers" context={CarriersContext}>
                    <FirestoreCollectionProvider name="ports" context={PortsContext}>
                      <FirestoreCollectionProvider name="container-types" context={ContainerTypesContext}>
                        <SpecialOffersProvider>
                          <ActingAsProvider anonymous>
                            <App />
                          </ActingAsProvider>
                        </SpecialOffersProvider>
                      </FirestoreCollectionProvider>
                    </FirestoreCollectionProvider>
                  </FirestoreCollectionProvider>
                </UserContext.Provider>
              )}
            </RouteSearchProvider>
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
