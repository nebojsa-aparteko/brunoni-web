import React, { Fragment } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

const App: React.FC = () => (
  <Fragment>
    <Navbar />
    <Hero />
  </Fragment>
);

export default App;
