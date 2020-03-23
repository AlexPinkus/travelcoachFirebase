import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as request from 'request-promise';

const ACTIVE_KEY = functions.config().activecampaign.key;

const increment = admin.firestore.FieldValue.increment(1);
const decrement = admin.firestore.FieldValue.increment(-1);
const collections = ['Cotizaciones', 'Blogs', 'Escuelas', 'Idiomas', 'Programas', 'Usuarios'];

const dataInit: any = {
  Cotizaciones: 0,
  Blogs: 0,
  Escuelas: 0,
  Idiomas: 0,
  Programas: 0,
  Usuarios: 0,
};

const getStats = async (collection: any, action: 'decrement' | 'increment') => {
  const ref = admin.firestore().doc(`Estadisticas/datos`);
  const doc = await ref.get();
  const data = doc.data();
  let updateAction;
  action === 'increment' ? (updateAction = increment) : (updateAction = decrement);
  if (!data) {
    dataInit[collection] = 1;
    return ref.set(dataInit);
  }
  data[collection] ? (data[collection] = updateAction) : (data[collection] = 1);
  return ref.update(data);
};

export const onCreate = collections.reduce((acc: any, collection) => {
  acc[collection] = functions.firestore
    .document(`${collection}/{${collection.toLowerCase()}Id}`)
    .onCreate(() => getStats(collection, 'increment'));
  return { ...acc };
}, {});

export const onDelete = collections.reduce((acc: any, collection) => {
  acc[collection] = functions.firestore
    .document(`${collection}/{${collection.toLowerCase()}Id}`)
    .onDelete(() => getStats(collection, 'decrement'));
  return { ...acc };
}, {});

export const createCotizacion = () =>
  functions.firestore.document(`Cotizaciones/{cotizacionesId}`).onCreate(async snapshot => {
    const data = snapshot.data();
    let email: string = '';
    let firstName: string = '';
    let lastName: string = '';
    let phone: number = 0;
    if (data) {
      data.email ? (email = data.email) : (email = '');
      data.name ? (firstName = data.name) : (firstName = '');
      data.phone ? (phone = data.phone) : (phone = 0);
      data.lastname ? (lastName = data.lastname) : (lastName = '');
    }
    const options = {
      method: 'POST',
      uri: ' https://travelcoach.api-us1.com/api/3/contacts',
      headers: {
        'Api-Token': ACTIVE_KEY,
      },
      body: {
        contact: {
          email,
          firstName,
          lastName,
          phone,
        },
      },
      json: true, // Automatically parses the JSON string in the response
    };

    return await request(options);
  });

export const updateByRef = () =>
  functions.https.onCall(data => {
    const prom = new Promise((resolve, reject) => {
      if (data.hasOwnProperty('path')) {
        const { path, property } = data;
        const ref = admin.firestore().doc(path);
        resolve(ref.update({ [property]: increment }));
      } else {
        reject('El path ingresado no existe');
      }
    });
    return prom;
  });
