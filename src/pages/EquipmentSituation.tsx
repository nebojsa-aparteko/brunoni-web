import React, { Fragment } from 'react';
import Navbar from '../components/Navbar';
import EquipmentSituationView from '../components/EquipmentSituation';
import Footer from '../components/Footer';

const GetQuotes: React.FC = () => (
  <Fragment>
    <Navbar />
    <EquipmentSituationView />
    <Footer />
  </Fragment>
);

export default GetQuotes;
