import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import {
  addLandTransportProvider,
  deleteLandTransportProvider,
  editLandTransportProvider,
} from '../api/landTransportConfig';
import useLandTransportProviders from '../hooks/useLandTransportProviders';
import EditableTable from '../components/EditableTable';
import { Container, IconButton } from '@material-ui/core';
import { format } from 'date-fns';
import { useHistory } from 'react-router';
import SettingsIcon from '@material-ui/icons/Settings';
import useModal from '../hooks/useModal';
import PredefinedAddOnRatesModal from '../components/landTransport/config/PredefinedAddOnRatesModal';

const LandTransportConfigPage: React.FC = () => {
  const providers = useLandTransportProviders();
  const history = useHistory();
  const { isOpen, openModal, closeModal } = useModal();
  return (
    <Fragment>
      <Meta title={'Land Transport Config'} />
      <Container style={{ display: 'flex', flexDirection: 'column' }}>
        <IconButton onClick={openModal} style={{ alignSelf: 'flex-end' }}>
          <SettingsIcon />
        </IconButton>
        <EditableTable
          cells={[
            { label: 'Name', fieldName: 'name', fieldType: 'input' },
            {
              label: 'Created At',
              fieldName: 'createdAt',
              fieldType: 'date',
              renderDate: date => (date ? format(date, 'dd.MM.yyyy') : ''),
            },
            { label: 'Active', fieldName: 'active', fieldType: 'switch' },
          ]}
          data={providers}
          defaultItem={{ name: '', active: false, id: '', createdAt: new Date() }}
          addItem={item => addLandTransportProvider(item)}
          editItem={(id, item) => editLandTransportProvider(id, item)}
          deleteItem={id => deleteLandTransportProvider(id)}
          onRowClick={item => history.push(`/land-transport-config/${item.id}`)}
        />
      </Container>
      {isOpen && <PredefinedAddOnRatesModal isOpen={isOpen} handleClose={closeModal} providerId="Default" />}
    </Fragment>
  );
};

export default LandTransportConfigPage;
