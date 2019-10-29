import React, { Fragment } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Routes from './Routes';

const App: React.FC = () => (
  <Fragment>
    <Navbar />
    <Hero />
    <Routes />
  </Fragment>
);

export default App;
