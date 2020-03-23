import * as functions from 'firebase-functions';

import { createCotizacion, onCreate, onDelete, updateByRef } from './firestore/index';
import { checkPromocion } from './cronjobs/index';
import { sendGridQuote, sendGridChat } from './sendgrid/index';
import { generateBackup, restoreBackup } from './backup/index';

// -----------------------------------------------------
// Scheduled functions
// -----------------------------------------------------
export const promocionesCronJob = functions
  .runWith({ memory: '512MB' })
  .pubsub.schedule('0 * * * *')
  .onRun(checkPromocion);
// -----------------------------------------------------

// -----------------------------------------------------
// Backups
// -----------------------------------------------------
export const automatedBackups = functions.pubsub.schedule('0 0 * * *').onRun(generateBackup);

export const automatedRestore = functions.pubsub.topic(`restore-backup`).onPublish(restoreBackup);
// -----------------------------------------------------

// -----------------------------------------------------
// Active Campaign
// -----------------------------------------------------
export const addCotizacionActiveCampaign = createCotizacion();
// -----------------------------------------------------

// -----------------------------------------------------
// SendGrid
// -----------------------------------------------------
export const addCotizacionSendGrid = sendGridQuote();
export const newChat = sendGridChat();
// -----------------------------------------------------

// -----------------------------------------------------
// Estadísticas
// -----------------------------------------------------
export const addBlogs = onCreate['Blogs'];
export const addEscuelas = onCreate['Escuelas'];
export const addIdiomas = onCreate['Idiomas'];
export const addProgramas = onCreate['Programas'];
export const addUsuarios = onCreate['Usuarios'];
export const addCotizacion = onCreate['Cotizaciones'];

export const deleteBlogs = onDelete['Blogs'];
export const deleteEscuelas = onDelete['Escuelas'];
export const deleteIdiomas = onDelete['Idiomas'];
export const deleteProgramas = onDelete['Programas'];
export const deleteUsuarios = onDelete['Usuarios'];
export const deleteCotizaciones = onDelete['Cotizaciones'];
// -----------------------------------------------------

// -----------------------------------------------------
// Http
// -----------------------------------------------------
export const updateByProperty = updateByRef();
