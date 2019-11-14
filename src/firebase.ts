// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from 'firebase/app';

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import 'firebase/analytics';

// Add the Firebase products that you want to use
import 'firebase/auth';
import 'firebase/firestore';

const developmentConfig = {
  apiKey: 'AIzaSyCGqNPUnvvO9sGCfYeC3IdeAw_jMUpJ5NQ',
  authDomain: 'brunoni-allmarine.firebaseapp.com',
  databaseURL: 'https://brunoni-allmarine.firebaseio.com',
  projectId: 'brunoni-allmarine',
  storageBucket: 'brunoni-allmarine.appspot.com',
  messagingSenderId: '954272298910',
  appId: '1:954272298910:web:e52f968551a80bbadbc88f',
};

const productionConfig = {
  brunoni: {
    apiKey: 'AIzaSyBuI3STGixq5uWBcCzrUuMGfbifkDOZYN0',
    authDomain: 'brunoni.firebaseapp.com',
    databaseURL: 'https://brunoni.firebaseio.com',
    projectId: 'brunoni',
    storageBucket: 'brunoni.appspot.com',
    messagingSenderId: '154343276895',
    appId: '1:154343276895:web:a30fe5aced02b0373af6ea',
  },
  allmarine: {
    apiKey: 'AIzaSyBfF4OAXLNZsNgER4bKnZhABWIZron9T4o',
    authDomain: 'allmarine.firebaseapp.com',
    databaseURL: 'https://allmarine.firebaseio.com',
    projectId: 'allmarine',
    storageBucket: 'allmarine.appspot.com',
    messagingSenderId: '707393375364',
    appId: '1:707393375364:web:283aa80ae0e376749f86d1',
  },
};

const firebaseConfig =
  process.env.NODE_ENV === 'production'
    ? productionConfig[process.env.REACT_APP_BRAND as 'brunoni' | 'allmarine']
    : developmentConfig;

firebase.initializeApp(firebaseConfig);

export default firebase;
