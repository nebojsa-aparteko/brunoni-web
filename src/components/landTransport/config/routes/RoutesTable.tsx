import React, { useState } from 'react';
import useLandTransportRoutes from '../../../../hooks/useLandTransportRoutes';
import { Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { EnhancedTableToolbar } from '../../../EnhancedTableToolbar';
import ConfirmationDialog from '../../../ConfirmationDialog';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';
import RoutesTableRow from './RoutesTableRow';
import RoutesFileUploadDialog from './RoutesFileUploadDialog';

interface RoutesTableProps {
  provider: ProviderEntity;
}

const RoutesTable: React.FC<RoutesTableProps> = ({ provider }) => {
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const routes = useLandTransportRoutes(provider.id);

  console.log(routes);

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

  const handleDeleteRoute = () => {
    console.log('deleting', selectedRoutes);
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
