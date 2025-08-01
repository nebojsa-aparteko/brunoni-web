import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { NormalizedOpportunity } from '../../model/Opportunity';

interface MatchOpportunityDialogProps {
  open: boolean;
  onClose: () => void;
  onMatch: (opportunityId: string) => void;
  opportunities: NormalizedOpportunity[];
}

const MatchOpportunityDialog: React.FC<MatchOpportunityDialogProps> = ({
  open,
  onClose,
  onMatch,
  opportunities,
}) => {
  const [selectedOpportunity, setSelectedOpportunity] = useState<NormalizedOpportunity | null>(
    null,
  );

  useEffect(() => {
    if (!open) {
      setSelectedOpportunity(null);
    }
  }, [open]);

  const handleMatch = () => {
    if (selectedOpportunity) {
      onMatch(selectedOpportunity.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Match with Opportunity</DialogTitle>
      <DialogContent>
        <Autocomplete
          options={opportunities || []}
          getOptionLabel={option =>
            `${option.opportunityId} - ${option.bookingPartyId?.name || ''} - ${option.agreementId || ''}`
          }
          value={selectedOpportunity}
          onChange={(_, value) => setSelectedOpportunity(value)}
          renderInput={params => (
            <TextField
              {...params}
              label="Select Opportunity"
              margin="dense"
              variant="outlined"
              fullWidth
              placeholder="Search by ID, booking party, or agreement..."
            />
          )}
          filterOptions={(options, { inputValue }) => {
            const lowercaseInput = inputValue.toLowerCase();
            return options.filter(
              option =>
                option.opportunityId.toLowerCase().includes(lowercaseInput) ||
                option.bookingPartyId?.name?.toLowerCase().includes(lowercaseInput) ||
                option.agreementId?.toLowerCase().includes(lowercaseInput),
            );
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleMatch}
          color="primary"
          variant="contained"
          disabled={!selectedOpportunity}
        >
          Match
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MatchOpportunityDialog;
