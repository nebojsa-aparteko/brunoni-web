import React, { useContext, useMemo } from 'react';
import { RouteComponentProps } from 'react-router';
import QuoteView from '../components/QuoteView';
import useFirestoreDocument from '../hooks/useFirestoreDocument';
import { Booking } from '../model/Booking';
import ActingAs from '../contexts/ActingAs';
import useNormalizeQuote from '../hooks/useNormalizedQuote';

interface Props extends RouteComponentProps<{ id: string }> {}

const QuotePageContainer: React.FC<Props> = ({ match }) => {
  const quoteId = match.params.id;
  const quoteSnapshot = useFirestoreDocument('quotes', quoteId);

  const actingAs = useContext(ActingAs)[0];

  const quoteDoc = useMemo(
    () =>
      quoteSnapshot
        ? quoteSnapshot.exists
          ? ({ id: quoteSnapshot.id, ...quoteSnapshot.data() } as Booking)
          : undefined
        : undefined,
    [quoteSnapshot],
  );

  const normalize = useNormalizeQuote();

  const quote = useMemo(() => (quoteDoc ? normalize(quoteDoc) : undefined), [quoteDoc, normalize]);

  return <QuoteView quote={quote} loading={!quoteSnapshot} showCompanyInfo={!actingAs} />;
};

export default QuotePageContainer;
