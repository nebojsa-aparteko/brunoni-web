import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
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

import theme from './theme';
import firebase from './firebase';
import { RouteSearchProvider } from './contexts/RouteSearchContext';
import ActingAs from './contexts/ActingAs';
import UserRecordContext from './contexts/UserRecordContext';
import { isDashboardUser } from './model/UserRecord';
import ClientsContext from './contexts/ClientsContext';
import ClientUsersProvider from './providers/ClientUsersProvider';
import GlobalStore from './store/GlobalStore';
import { showCrispChat } from './CrispChat';

// Environment variables are handled by Vite automatically
// https://vitejs.dev/guide/env-and-mode.html
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const appFont = new FontFaceObserver('Montserrat');

const UserApp: React.FC = () => {
  const userRecord = useContext(UserRecordContext);
  const [actingAs] = useContext(ActingAs);

  useEffect(() => {
    if (userRecord) {
      try {
        $crisp.push([
          'set',
          'user:company',
          [
            userRecord.company?.name,
            { geolocation: [userRecord.company?.countryCode, userRecord.company?.city] },
          ],
        ]);
        $crisp.push([
          'set',
          'user:name',
          [
            userRecord.company?.name,
            { geolocation: [userRecord.company?.countryCode, userRecord.company?.city] },
          ],
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
  }, [userRecord]);

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
        <ClientUsersProvider>
          <App />
        </ClientUsersProvider>
      );
  }
};

const CrispChatRouteUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    try {
      $crisp.push([
        'set',
        'session:data',
        [[['last-request-at', new Date().toISOString().slice(0, 10)]]],
      ]);
    } catch (e) {
      console.warn('Failed to push crisp command.');
    }
  }, [location.pathname]);

  return null;
};

// Main App Component that handles auth state
const MainApp: React.FC = () => {
  const [user, setUser] = useState<firebase.User | null | undefined>(undefined);
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // Handle font loading
    appFont
      .load()
      .then(() => {
        setFontLoaded(true);
      })
      .catch(error => {
        console.warn('Application font failed to load', error);
        setFontLoaded(true);
      });
  }, []);

  useEffect(() => {
    let prevUser: firebase.User | null | undefined = undefined;

    const unsubscribe = firebase.auth().onAuthStateChanged(async currentUser => {
      // Handle Crisp chat user changes
      if (prevUser && !currentUser) {
        try {
          $crisp.push(['do', 'session:reset', [false]]);
        } catch (e) {
          console.warn('Failed to push crisp command.');
        }
      } else if (currentUser) {
        try {
          $crisp.push(['set', 'user:email', [String(currentUser.email)]]);
        } catch (e) {
          console.warn('Failed to push crisp command.');
        }

        try {
          $crisp.push([
            'set',
            'session:data',
            [
              [
                ['user-id', String(currentUser.uid)],
                ['user-hash', '78006440b1b39b8027c8c865cc9f3b2ac92afb6e0fcceb4ac7da2182ec40237b'],
                ...(currentUser.metadata && currentUser.metadata.creationTime
                  ? [
                      [
                        'created-at',
                        new Date(currentUser.metadata.creationTime).toISOString().slice(0, 10),
                      ],
                    ]
                  : []),
              ],
            ],
          ]);
        } catch (e) {
          console.warn('Failed to push crisp command.');
        }
      }

      prevUser = currentUser;
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Don't render until we have font loaded and user state
  if (!fontLoaded || user === undefined) {
    console.debug('App initializing...');
    return null;
  }

  return (
    <Router>
      <CrispChatRouteUpdater />
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <GlobalStore>
            <>
              <ScrollToTop />
              <CssBaseline />
              <CookiesNotification />
              <RouteSearchProvider>
                {user ? (
                  <UserContext.Provider value={user}>
                    <AuthenticatedMain />
                  </UserContext.Provider>
                ) : (
                  <LoginDialogProvider>
                    <UserContext.Provider value={null}>
                      <AnonymousMain />
                    </UserContext.Provider>
                  </LoginDialogProvider>
                )}
              </RouteSearchProvider>
            </>
          </GlobalStore>
        </SnackbarProvider>
      </ThemeProvider>
    </Router>
  );
};

const AuthenticatedMain = () => (
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
);

const AnonymousMain = () => (
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
);

export default MainApp;
