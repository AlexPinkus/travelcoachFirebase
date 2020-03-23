import * as dateformat from 'dateformat';
import { auth, GoogleAuth } from 'google-auth-library';
const client = new GoogleAuth({
  scopes: [
    'https://www.googleapis.com/auth/datastore',
    'https://www.googleapis.com/auth/cloud-platform', // We need these scopes
  ],
});
const BUCKET_NAME = `travelcoach-prod-backup`;
export const generateBackup = async () => {
  const timestamp = dateformat(Date.now(), 'yyyy-mm-dd'); // a nice way to name your folder
  const path = `${timestamp}`;

  const projectId = await auth.getProjectId();
  const url = `https://firestore.googleapis.com/v1beta1/projects/${projectId}/databases/(default):exportDocuments`;
  const backup_route = `gs://${BUCKET_NAME}/${path}`;
  return client
    .request({
      url,
      method: 'POST',
      data: {
        outputUriPrefix: backup_route,
        // collectionsIds: [] // if you want to specify which collections to export, none means all
      },
    })
    .then(async res => {
      console.log(`Backup saved on folder on ${backup_route}`);
      // @ts-ignore
      // await webhook.send(backupSlackNotification(`completed`)) // notify slack we are done
    })
    .catch(async e => {
      // await logErrors(e, { message: e.message })
      // @ts-ignore
      // await webhook.send(backupSlackNotification(`error`)) // notify to slack something back happened
      return Promise.reject({ message: e.message });
    });
};

export const restoreBackup = async () => {
  // we calculate yesterday date, which is our backup name
  let timestamp = dateformat(Date.now(), 'yyyy-mm-dd');
  let path = `${timestamp}`;

  const projectId = await auth.getProjectId();
  // we change the action for importDocuments
  const url = `https://firestore.googleapis.com/v1beta1/projects/${projectId}/databases/(default):importDocuments`;
  const backup_route = `gs://${BUCKET_NAME}/${path}`;
  return client
    .request({
      url,
      method: 'POST',
      data: {
        inputUriPrefix: backup_route, // this param is different as well
        // collectionIds: [] // if you want to import only certain collections
      },
    })
    .then(async res => {
      console.log(`Backup restored from folder ${backup_route}`);
      // notify slack maybe? check the repo
    })
    .catch(async e => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      timestamp = dateformat(yesterday, 'yyyy-mm-dd');
      path = `${timestamp}`;
      const backup_route_yesterday = `gs://${BUCKET_NAME}/${path}`;
      return client
        .request({ url, method: 'POST', data: { inputUriPrefix: backup_route_yesterday } })
        .then(async res => {
          console.log(`Backup restored from folder ${backup_route}`);
          // notify slack maybe? check the repo
        })
        .catch(async er => console.log({ message: er.message }));
    });
};
