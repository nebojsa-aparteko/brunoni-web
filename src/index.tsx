import * as serviceWorker from './serviceWorker';

// Initialize the app
import { createRoot } from 'react-dom/client';
import MainApp from './MainApp';

const container = document.getElementById('root');
const root = createRoot(container!);

// React 18 development mode intentionally double-renders components
// This is normal behavior and doesn't happen in production
root.render(<MainApp />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
