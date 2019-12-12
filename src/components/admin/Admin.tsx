import React from 'react';
import { Theme, makeStyles } from '@material-ui/core';
import { Route, RouterProps, Switch } from 'react-router';
import Dashboard from '../../pages/Dashboard';
import Routes from '../../pages/Routes';
import QuoteGroups from '../../pages/QuoteGroups';
import QuoteGroup from '../../pages/QuoteGroup';
import GetQuotes from '../../pages/GetQuotes';
import Quote from '../../pages/Quote';
import EquipmentSituation from '../../pages/EquipmentSituation';
import SideCharges from '../../pages/SideCharges';
import NotFound from '../../pages/NotFound';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontWeight: 'bold',
  },
}));

// const routes = (
//   <Switch>
//     <Route exact path="/" component={switchUser(requireUser(Dashboard), Routes)} />
//     <Route exact path="/schedule" component={requireUser(Routes)} />
//     <Route exact path="/quotes/groups" component={requireUser(QuoteGroups)} />
//     <Route exact path="/quotes/groups/:id" component={requireUser(QuoteGroup)} />
//     <Route exact path="/quotes/get" component={requireUser(GetQuotes)} />
//     <Route exact path="/quotes/:id" component={requireUser(Quote)} />
//     <Route exact path="/equipment" component={requireUser(EquipmentSituation)} />
//     <Route exact path="/charges" component={requireUser(SideCharges)} />
//     <Route exact path="/admin" component={requireAdmin(Admin)} />
//     <Route component={NotFound} />
//   </Switch>
// );

const Admin: React.FC<Props> = () => {
  const classes = useStyles();

  return <span>Admin</span>;
};

export default Admin;
