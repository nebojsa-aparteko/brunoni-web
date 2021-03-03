import React, { useContext, useState } from 'react';
import { Box, Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import CarrierInput from '../inputs/CarrierInput';
import Carrier from '../../model/Carrier';
import Carriers from '../../contexts/Carriers';

const ImportFlowsContainer: React.FC = () => {
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | undefined>(undefined);
  const availableCarriers = useContext(Carriers);

  return (
    <Box width="95vw">
      <Typography variant="h4">Import Flows</Typography>
      {/*<Box>*/}
      <Box minWidth={250} maxWidth={400} margin={4} marginLeft={0} paddingRight={1}>
        <CarrierInput
          label="Select a carrier"
          onChange={carrier => setSelectedCarrier(carrier || undefined)}
          carriers={availableCarriers}
          value={selectedCarrier}
        />
      </Box>
      <TableContainer>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="left" style={{ paddingLeft: 4 }}>
                Test
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ImportFlowsContainer;
