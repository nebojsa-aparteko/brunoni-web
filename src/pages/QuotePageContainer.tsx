import React, { useContext, useMemo } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import QuoteView from '../components/QuoteView';
import useFirestoreDocument from '../hooks/useFirestoreDocument';
import ActingAs from '../contexts/ActingAs';
import useNormalizeQuote from '../hooks/useNormalizedQuote';

interface Props extends RouteComponentProps<{ id: string }> {}

const QuotePageContainer: React.FC<Props> = ({ match }) => {
  const quoteId = match.params.id;
  const quoteSnapshot = useFirestoreDocument('quotes', quoteId);

  const actingAs = useContext(ActingAs)[0];

  const history = useHistory();

  const quoteDoc = useMemo(
    () =>
      quoteSnapshot
        ? quoteSnapshot.exists
          ? { id: quoteSnapshot.id, ...(quoteSnapshot.data() as any) }
          : undefined
        : undefined,
    [quoteSnapshot],
  );

  const normalize = useNormalizeQuote();

  const quote = useMemo(() => (quoteDoc ? normalize(quoteDoc) : undefined), [quoteDoc, normalize]);

  const isEligible = !actingAs || actingAs?.company?.id === quote?.clientId;

  if (quote && !isEligible) {
    history.push('/not-found');
  }

  return <QuoteView quote={quote} loading={!quoteSnapshot} showCompanyInfo={!actingAs} />;
};

export default QuotePageContainer;
