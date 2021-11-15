import React, { useMemo, useState } from 'react';
import useLandTransportRoutes from '../../../../hooks/useLandTransportRoutes';
import { Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { EnhancedTableToolbar } from '../../../EnhancedTableToolbar';
import ConfirmationDialog from '../../../ConfirmationDialog';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';
import RoutesTableRow from './RoutesTableRow';
import RoutesFileUploadDialog, { decrementRouteVersion } from './RoutesFileUploadDialog';
import firebase from '../../../../firebase';
import useSaveFiles from '../../../../hooks/useSaveFiles';
import { ChecklistItemValueDocument } from '../../../bookings/checklist/ChecklistItemModel';
import { AutomaticProviderRoute } from '../../../../model/land-transport/providers/ProviderRoutes';

interface RoutesTableProps {
  provider: ProviderEntity;
}

const deleteRoute = async (providerId: string, routeVersion: string) =>
  await firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/routes`)
    .doc(routeVersion)
    .delete();

const getRoute = async (providerId: string, routeVersion: string) => {
  return (
    await firebase
      .firestore()
      .collection(`land-transport-config/${providerId}/routes`)
      .doc(routeVersion)
      .get()
  ).data() as AutomaticProviderRoute;
};

const deleteRoutes = async (
  provider: ProviderEntity,
  routeVersions: string[],
  deleteFiles: (files: ChecklistItemValueDocument[]) => Promise<any>,
) => {
  return Promise.all(
    routeVersions.map(async version => {
      const route = await getRoute(provider.id, version);
      await deleteFiles(route.versionDocuments);
      await deleteRoute(provider.id, version);
      await decrementRouteVersion(provider.name);
    }),
  );
};

const RoutesTable: React.FC<RoutesTableProps> = ({ provider }) => {
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const routes = useLandTransportRoutes(provider.id);

  const storageBasePath = useMemo((): string => {
    return [`land-transport-config/routes/versions`, provider.name].join('/');
  }, [provider.name]);
  const { saveFiles, deleteFiles } = useSaveFiles(storageBasePath);

  const handleSelectDeselectAll = () => {
    if (selectedRoutes.length !== routes.length) {
      setSelectedRoutes(routes.map(route => route.version || ''));
    } else {
      setSelectedRoutes([]);
    }
  };

  const onSelectRow = (event: React.MouseEvent<HTMLElement>, id: string) => {
    event.stopPropagation();
    setSelectedRoutes(prevState =>
      selectedRoutes.includes(id) ? [...prevState.filter(t => t !== id)] : [...prevState, id],
    );
  };

  const handleDeleteRoute = async () => {
    await deleteRoutes(provider, selectedRoutes, deleteFiles);
    setIsDeleteDialogOpen(false);
    setSelectedRoutes([]);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <EnhancedTableToolbar
          numSelected={selectedRoutes.length}
          handleAdd={() => setIsAddDialogOpen(true)}
          handleDelete={() => setIsDeleteDialogOpen(true)}
          labelWhenSelected={
            selectedRoutes.length === 1
              ? `${selectedRoutes.length} route selected`
              : `${selectedRoutes.length} routes selected`
          }
          labelWhenNotSelected={''}
          addButtonLabel={'Add new route'}
          deleteButtonLabel={selectedRoutes.length === 1 ? `Delete route` : `Delete routes`}
        />
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left" style={{ paddingLeft: 4 }}>
                <Checkbox
                  checked={selectedRoutes.length === routes.length}
                  onClick={handleSelectDeselectAll}
                  onFocus={event => event.stopPropagation()}
                  color="primary"
                />
              </TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Added At</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.map(route => (
              <RoutesTableRow
                key={route.version}
                route={route}
                selected={selectedRoutes.includes(route.version)}
                onSelectRow={event => onSelectRow(event, route.version)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <RoutesFileUploadDialog
        provider={provider}
        isOpen={isAddDialogOpen}
        handleClose={() => setIsAddDialogOpen(false)}
        saveFiles={saveFiles}
      />
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        label={'Please confirm deletion'}
        handleConfirm={handleDeleteRoute}
        handleClose={() => setIsDeleteDialogOpen(false)}
        description={`Are you sure you want remove this selected route${selectedRoutes.length > 1 ? 's' : ''}?`}
      />
    </>
  );
};

export default RoutesTable;
