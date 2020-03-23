import * as functions from 'firebase-functions';

// SendGrid config
import * as sgMail from '@sendgrid/mail';
const API_KEY = functions.config().sendgrid.key;
const TEMPLATE_ID = functions.config().sendgrid.template;

sgMail.setApiKey(API_KEY);
//Function for sending quotes info.

export const sendGridQuote = () =>
  functions.firestore.document('Cotizaciones/{cotizacionId}').onCreate((snap: any) => {
    const data = snap.data();
    console.log('data snap', { data });
    const {
      name,
      lastname,
      phone,
      age,
      email,
      category,
      message,
      country,
      city,
      language,
      languageNivel,
      program,
    } = data;
    let msg: any;
    msg = {
      to: ['travelcoachmx@gmail.com', 'contacto@travelcoach.mx', 'marketing@travelcoach.mx', 'info@travelcoach.com.mx'],
      from: 'travelcoachmx@gmail.com',
      subject: 'Nueva cotización',
      templateId: TEMPLATE_ID,
      dynamic_template_data: {
        name,
        lastname,
        phone,
        age,
        email,
        category,
        message,
        country,
        city,
        language,
        languageNivel,
        program,
      },
    };
    if (data.quoted) {
      msg = {
        ...msg,
        quoted: {
          category: data.quoted.category,
          country: data.quoted.country,
          city: data.quoted.city,
          language: data.quoted.language,
        },
      };
    }
    console.log({ msg });
    return sgMail.send(msg);
  });

export const sendGridChat = () =>
  functions.firestore.document('chats/{chatId}').onCreate((snap: any) => {
    // Read data
    const data = snap.data();
    console.log('data snap', { data });
    let msg: any;
    msg = {
      to: ['travelcoachmx@gmail.com', 'info@travelcoach.com.mx', 'direccion@travelcoach.com.mx'],
      from: 'travelcoachmx@gmail.com',
      subject: 'Nueva solicitud de chat',
      templateId: 'd-ede0c272f75c48648d839c84f4dda638',
      dynamic_template_data: {
        nombre: data.name,
        correo: data.email,
      },
    };
    console.log({ msg });
    return sgMail.send(msg);
  });
