import * as admin from 'firebase-admin';
admin.initializeApp();
const db = admin.firestore();
export const checkPromocion = async () => {
  const now = admin.firestore.Timestamp.now();
  // console.log({now});

  const queryActive = db
    .collection('Promociones')
    .where('startDate', '<=', now)
    .where('status', '==', 'scheduled');
  const queryInactive = db.collection('Promociones').where('endDate', '<=', now);
  let updatedDocs: Promise<any>[] = [];
  const docsActive = await queryActive.get();
  const docsInactive = await queryInactive.get();
  // Loop over documents and push job.
  docsActive.forEach(snapshot => {
    const doc = snapshot.ref.update({ status: 'active' });
    updatedDocs.push(doc);
  });
  await Promise.all(updatedDocs);
  updatedDocs = [];
  docsInactive.forEach(snapshot => {
    const doc = snapshot.ref.update({ status: 'completed' });
    updatedDocs.push(doc);
  });
  return await Promise.all(updatedDocs);
};
