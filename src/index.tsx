import React, { useContext, useEffect } from 'react';
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
import SpecialOffersProvider from './providers/SpecialOffers';
import ContainerTypesContext from './contexts/ContainerTypes';
import CommodityTypesContext from './contexts/CommodityTypes';
import PickupLocationsContext from './contexts/PickupLocations';
import StatisticsContext from './contexts/Statistics';
import CarriersContext from './contexts/Carriers';
import PortsContext from './contexts/Ports';
import UserContext from './contexts/UserContext';
import UserRecordsContext from './contexts/UserRecordsContext';
import * as serviceWorker from './serviceWorker';
import theme from './theme';
import firebase from './firebase';
import { RouteSearchProvider } from './contexts/RouteSearchContext';
import ActingAs from './contexts/ActingAs';
import UserRecordContext from './contexts/UserRecordContext';
import { isDashboardUser } from './model/UserRecord';
import ClientsContext from './contexts/ClientsContext';
import ClientUsersProvider from './providers/ClientUsersProvider';
import GlobalStore from './store/GlobalStore';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
} else {
  require('./vendor/hotjar').init();
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

export const showCrispChat = (show: Boolean) => {
  try {
    $crisp.push(['do', show ? 'chat:show' : 'chat:hide']);
  } catch (e) {
    console.warn('Failed to push crisp command.');
  }
};

const UserApp: React.FC = () => {
  const userRecord = useContext(UserRecordContext);
  const [actingAs] = useContext(ActingAs);

  if (userRecord) {
    try {
      $crisp.push([
        'set',
        'user:company',
        [userRecord.company?.name, { geolocation: [userRecord.company?.countryCode, userRecord.company?.city] }],
      ]);
      $crisp.push([
        'set',
        'user:name',
        [userRecord.company?.name, { geolocation: [userRecord.company?.countryCode, userRecord.company?.city] }],
      ]);
    } catch (e) {
      console.warn('Failed to push crisp command.');
    }
    try {
      $crisp.push([
        'set',
        'session:data',
        [
          [
            ['name', `${userRecord.firstName} ${userRecord.lastName}`],
            ['alphacomId', String(userRecord.alphacomId)],
          ],
        ],
      ]);
    } catch (e) {
      console.warn('Failed to push crisp command.');
    }
  }

  switch (actingAs) {
    case undefined:
      showCrispChat(true);
      return <App />;
    case null:
      switch (userRecord) {
        case undefined:
          showCrispChat(true);
          return <App />;
        case null:
          showCrispChat(true);
          // Company
          return (
            <FirestoreClientDocumentProvider collection="statistics" context={StatisticsContext}>
              <ClientUsersProvider>
                <App />
              </ClientUsersProvider>
            </FirestoreClientDocumentProvider>
          );
        default:
          if (isDashboardUser(userRecord)) {
            showCrispChat(false);
          } else {
            showCrispChat(true);
          }
          return isDashboardUser(userRecord) ? (
            <FirestoreCollectionProvider name="users" context={UserRecordsContext}>
              <FirestoreCollectionProvider name="clients" context={ClientsContext}>
                <App />
              </FirestoreCollectionProvider>
            </FirestoreCollectionProvider>
          ) : (
            <App />
          );
      }
    default:
      showCrispChat(true);
      return (
        // <FirestoreClientDocumentProvider collection="statistics" context={StatisticsContext}>
        <ClientUsersProvider>
          <App />
        </ClientUsersProvider>
        // </FirestoreClientDocumentProvider>
      );
  }
};

const CrispChatRouteUpdater = () => {
  const history = useHistory();

  useEffect(() => {
    try {
      $crisp.push(['set', 'session:data', [[['last-request-at', new Date().toISOString().slice(0, 10)]]]]);
    } catch (e) {
      console.warn('Failed to push crisp command.');
    }
  }, [history.location.pathname]);

  return null;
};

let prevUser: firebase.User | null | undefined = undefined;

const render = (user: firebase.User | null) => {
  if (prevUser && !user) {
    try {
      $crisp.push(['do', 'session:reset', [false]]);
    } catch (e) {
      console.warn('Failed to push crisp command.');
    }
  } else if (user) {
    try {
      $crisp.push(['set', 'user:email', [String(user.email)]]);
    } catch (e) {
      console.warn('Failed to push crisp command.');
    }

    try {
      $crisp.push([
        'set',
        'session:data',
        [
          [
            ['user-id', String(user.uid)],
            ['user-hash', '78006440b1b39b8027c8c865cc9f3b2ac92afb6e0fcceb4ac7da2182ec40237b'],
            ...(user.metadata && user.metadata.creationTime
              ? [['created-at', new Date(user.metadata.creationTime).toISOString().slice(0, 10)]]
              : []),
          ],
        ],
      ]);
    } catch (e) {
      console.warn('Failed to push crisp command.');
    }
  } else {
  }

  prevUser = user;

  const app = (
    <Router>
      <CrispChatRouteUpdater />
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <GlobalStore>
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
          </GlobalStore>
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
