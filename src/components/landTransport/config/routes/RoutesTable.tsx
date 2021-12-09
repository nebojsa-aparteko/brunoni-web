import React, { useState } from 'react';
import { Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { EnhancedTableToolbar } from '../../../EnhancedTableToolbar';
import ConfirmationDialog from '../../../ConfirmationDialog';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';
import RoutesTableRow from './RoutesTableRow';
import RoutesFileUploadDialog from './RoutesFileUploadDialog';
import firebase from '../../../../firebase';
import useSaveFiles from '../../../../hooks/useSaveFiles';
import { ChecklistItemValueDocument } from '../../../bookings/checklist/ChecklistItemModel';
import { ProviderRoutesType } from '../../../../model/land-transport/providers/ProviderRoutes';
import useLandTransportRoutes from '../../../../hooks/useLandTransportRoutes';
import EmptyStatePanel from '../../../EmptyStatePanel';

export const deleteRoute = async (providerId: string, routeId: string) =>
  await firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/routes`)
    .doc(routeId)
    .delete();

const deleteVersionDocuments = async (providerId: string, routeId: string) => {
  return (
    await firebase
      .firestore()
      .collection(`land-transport-config/${providerId}/routes/${routeId}/versionDocuments`)
      .get()
  ).docs.map(d => {
    const data = d.data() as ChecklistItemValueDocument;
    d.ref.delete();
    return data;
  });
};

export const deleteAutomaticRoutes = async (
  provider: ProviderEntity,
  routeIds: string[],
  deleteFiles: (files: string[]) => Promise<any>,
) => {
  return Promise.all(
    routeIds.map(async id => {
      const documents = await deleteVersionDocuments(provider.id, id);
      await deleteFiles(documents.map(d => d.url));
      await deleteRoute(provider.id, id);
    }),
  );
};

interface RoutesTableProps {
  provider: ProviderEntity;
}

const RoutesTable: React.FC<RoutesTableProps> = ({ provider }) => {
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const routes = useLandTransportRoutes(provider.id, ProviderRoutesType.AUTOMATIC);

  const { saveFiles, deleteFiles } = useSaveFiles(`land-transport-config/routes/versions/${provider.id}`);

  const handleSelectDeselectAll = () => {
    if (selectedRoutes.length !== routes?.length) {
      setSelectedRoutes(routes?.map(route => route.version || '') || []);
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
    setLoading(true);
    await deleteAutomaticRoutes(provider, selectedRoutes, deleteFiles);
    setLoading(false);
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
              ? `${selectedRoutes.length} version selected`
              : `${selectedRoutes.length} versions selected`
          }
          labelWhenNotSelected={''}
          addButtonLabel={'Add new version'}
          deleteButtonLabel={selectedRoutes.length === 1 ? `Delete route` : `Delete routes`}
        />
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedRoutes.length === routes?.length}
                  onClick={handleSelectDeselectAll}
                  onFocus={event => event.stopPropagation()}
                  color="primary"
                />
              </TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Validity</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes && routes.length > 0 ? (
              routes.map(route => (
                <RoutesTableRow
                  key={route.version}
                  route={route}
                  provider={provider}
                  selected={selectedRoutes.includes(route.version)}
                  onSelectRow={event => onSelectRow(event, route.version)}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyStatePanel />
                </TableCell>
              </TableRow>
            )}
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
        description={`Are you sure you want remove this selected version${selectedRoutes.length > 1 ? 's' : ''}?`}
        loading={loading}
      />
    </>
  );
};

export default RoutesTable;
