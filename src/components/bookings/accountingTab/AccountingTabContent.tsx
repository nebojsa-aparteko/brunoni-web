import { Box, Container, createStyles, makeStyles } from '@material-ui/core';
import React, { useMemo } from 'react';
import { Booking } from '../../../model/Booking';
import { ChecklistItemValueDocument, DocumentValue, DocumentValueStatus } from '../checklist/ChecklistItemModel';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';

import DocumentListItem from '../checklist/DocumentListItem';
import { useDropzone } from 'react-dropzone';

const useStyles = makeStyles(() =>
  createStyles({
    draftRoot: {
      height: '50px',
      border: '1px dashed #ccc',
      cursor: 'pointer',
      borderColor: '#999',
      '&:focus': {
        outline: 'none',
      },
    },
    draftEmpty: {
      height: '50px',
      border: 'none',
    },
  }),
);

const testDate = new Date();
const accountingDocuments: DocumentValue[] = [
  {
    id: 'doc1',
    name: 'Test file 1',
    storedName: 'Test_file_1',
    url: '',
    uploadedBy: {
      alphacomId: '006184-006',
      alphacomClientId: '006184',
      emailAddress: 'marko.nenadovic@spicefactory.co',
      firstName: 'Marko',
      lastName: 'Nenadovic',
    },
    uploadedAt: testDate,
  },
  {
    id: 'doc2',
    name: 'Test file 2',
    storedName: 'Test_file_2',
    url: '',
    uploadedBy: {
      alphacomId: '006184-006',
      alphacomClientId: '006184',
      emailAddress: 'marko.nenadovic@spicefactory.co',
      firstName: 'Marko',
      lastName: 'Nenadovic',
    },
    uploadedAt: testDate,
  },
];

const AccountingTabContent = ({ booking }: AccountingTabContentProps) => {
  const classes = useStyles();
  const storageBasePath = useMemo((): string => {
    return ['booking-documents', 'clients', booking.ForwAdrId, 'bookings', booking.id, 'accounting-documents'].join(
      '/',
    );
  }, [booking]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => () => {
      console.log(acceptedFiles);
    },
  });

  if (!accountingDocuments) {
    return (
      <Container>
        <ChartsCircularProgress />
      </Container>
    );
  }

  return (
    <Box display="flex" flexDirection="column" style={{ flex: 1, listStyle: 'none' }}>
      {accountingDocuments.map(item => (
        <DocumentListItem
          key={item.id}
          item={item}
          booking={booking}
          storageBasePath={storageBasePath}
          changeStatus={(item: ChecklistItemValueDocument, status: DocumentValueStatus) => {}}
          internal={true}
          markAsFinal={item => {}}
          comparableDocuments={[]}
          selectForComparison={item => {}}
        />
      ))}
      <Box
        {...getRootProps()}
        className={isDragActive ? classes.draftEmpty : classes.draftRoot}
        flexBasis="stretch"
        width={'100%'}
        display="flex"
        flexDirection="column"
        id={'accounting_document'}
        justifyContent="center"
        alignItems="center"
        px={1}
      >
        <input {...getInputProps()} />
        Drag and drop files here
      </Box>
    </Box>
  );
};

interface AccountingTabContentProps {
  booking: Booking;
}

export default AccountingTabContent;
