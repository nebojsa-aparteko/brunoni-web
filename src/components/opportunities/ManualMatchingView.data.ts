import firebase from '../../firebase';
import { NormalizedEntityOpportunityMatch, OpportunityMatchStatus } from '../../model/Opportunity';

export const updateOpportunityMatch = async (
  selectedMatch: NormalizedEntityOpportunityMatch,
  opportunityId: string,
) => {
  const matchRef = firebase
    .firestore()
    .collection('opportunity-matches')
    .doc(`${selectedMatch.entity}-${selectedMatch.entityId}`);

  await matchRef.update({
    opportunityId,
    status: OpportunityMatchStatus.Matched,
    updatedAt: new Date(),
    updatedBy: firebase.auth().currentUser?.uid || 'unknown',
  });
  console.log('Match updated with opportunity:', opportunityId);
};
