import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tooltip,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  NormalizedOpportunity,
  NormalizedEntityOpportunityMatch,
  OpportunityMatch,
} from '../../model/Opportunity';

interface MatchOpportunityDialogProps {
  open: boolean;
  onClose: () => void;
  onMatch: (opportunityId: string) => void;
  opportunities: NormalizedOpportunity[];
  currentMatch?: NormalizedEntityOpportunityMatch;
}

interface EnhancedOpportunity extends NormalizedOpportunity {
  matchInfo?: OpportunityMatch;
}

const MatchOpportunityDialog: React.FC<MatchOpportunityDialogProps> = ({
  open,
  onClose,
  onMatch,
  opportunities,
  currentMatch,
}) => {
  const [selectedOpportunity, setSelectedOpportunity] = useState<EnhancedOpportunity | null>(null);

  // Create enhanced opportunities list with match info
  const enhancedOpportunities = useMemo(() => {
    const matches = currentMatch?.matches || [];

    const matched: EnhancedOpportunity[] = [];
    const unmatched: EnhancedOpportunity[] = [];

    opportunities.forEach(opportunity => {
      const matchInfo = matches.find(m => m.opportunityId === opportunity.id);
      if (matchInfo) {
        matched.push({ ...opportunity, matchInfo });
      } else {
        unmatched.push(opportunity);
      }
    });

    // Sort matched by probability descending
    matched.sort((a, b) => (b.matchInfo?.probability || 0) - (a.matchInfo?.probability || 0));

    return [...matched, ...unmatched];
  }, [opportunities, currentMatch]);

  // Find currently matched opportunity to set as default
  const currentlyMatchedOpportunity = useMemo(() => {
    if (!currentMatch?.opportunityId) return null;
    return enhancedOpportunities.find(opp => opp.id === currentMatch.opportunityId) || null;
  }, [currentMatch?.opportunityId, enhancedOpportunities]);

  // Helper function to get color based on probability
  const getProbabilityColor = (probability: number): string => {
    if (probability >= 0.8) return '#4caf50'; // Green for 80%+
    if (probability >= 0.6) return '#ff9800'; // Orange for 60-79%
    if (probability >= 0.4) return '#f44336'; // Red for 40-59%
    return '#9e9e9e'; // Gray for <40%
  };

  // Helper function to format location data
  const formatLocation = (location: any): string => {
    if (!location) return '';
    if (location.definition?.type === 'groupId') {
      return location.value?.name || location.value || '';
    }
    if (location.definition?.type === 'portId') {
      return `${location.value?.city || ''} ${location.value?.id || ''}`.trim();
    }
    return location.value || '';
  };

  useEffect(() => {
    if (!open) {
      setSelectedOpportunity(null);
    } else if (currentlyMatchedOpportunity) {
      // Set currently matched opportunity as default when dialog opens for rematch
      setSelectedOpportunity(currentlyMatchedOpportunity);
    }
  }, [open, currentlyMatchedOpportunity]);

  const handleMatch = () => {
    if (selectedOpportunity) {
      onMatch(selectedOpportunity.id);
      onClose();
    }
  };

  // Check if the selected opportunity is the same as currently matched
  const isAlreadyMatched = selectedOpportunity?.id === currentMatch?.opportunityId;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Match with Opportunity</DialogTitle>
      <DialogContent>
        <Autocomplete
          options={enhancedOpportunities || []}
          getOptionLabel={(option: EnhancedOpportunity) => {
            const bookingParty = option.bookingPartyId?.name || '';
            const placeOfReceipt = formatLocation(option.placeOfReceipt);
            const portOfLoading = formatLocation(option.portOfLoading);
            const portOfDischarge = formatLocation(option.portOfDischarge);
            const placeOfDelivery = formatLocation(option.placeOfDelivery);

            let label = `${option.opportunityId} - ${bookingParty} - ${placeOfReceipt} - ${portOfLoading} - ${portOfDischarge} - ${placeOfDelivery}`;

            if (option.matchInfo) {
              const probability = Math.round(option.matchInfo.probability * 100);
              label += ` - ${probability}%`;
            }

            return label;
          }}
          value={selectedOpportunity}
          onChange={(_, value) => setSelectedOpportunity(value)}
          renderOption={(option: EnhancedOpportunity) => {
            const bookingParty = option.bookingPartyId?.name || '';
            const placeOfReceipt = formatLocation(option.placeOfReceipt);
            const portOfLoading = formatLocation(option.portOfLoading);
            const portOfDischarge = formatLocation(option.portOfDischarge);
            const placeOfDelivery = formatLocation(option.placeOfDelivery);

            let label = `${option.opportunityId} - ${bookingParty} - ${placeOfReceipt} - ${portOfLoading} - ${portOfDischarge} - ${placeOfDelivery}`;

            if (option.matchInfo) {
              const probability = Math.round(option.matchInfo.probability * 100);
              const color = getProbabilityColor(option.matchInfo.probability);
              label += ` - ${probability}%`;

              return (
                <Tooltip title={option.matchInfo.reason} arrow placement="right">
                  <div style={{ color, fontWeight: 'bold', width: '100%' }}>{label}</div>
                </Tooltip>
              );
            }

            return <div>{label}</div>;
          }}
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
              (option: EnhancedOpportunity) =>
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
          disabled={!selectedOpportunity || isAlreadyMatched}
        >
          {isAlreadyMatched ? 'Already Matched' : 'Match'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MatchOpportunityDialog;
