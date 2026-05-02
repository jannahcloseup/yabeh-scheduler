const express = require('express');
const cron = require('node-cron');
const axios = require('axios');

const app = express();
app.get('/', (req, res) => res.send('yabeh scheduler running'));

const EMAILJS_SERVICE_ID = 'service_3fgtxee';
const EMAILJS_TEMPLATE_ID = 'template_ehiekoj';
const EMAILJS_PUBLIC_KEY = 'E1RLNmECkM-wEAtfr';
const FIREBASE_URL = 'https://firestore.googleapis.com/v1/projects/yabeh-f20c5/databases/(default)/documents/capsules';

cron.schedule('0 8 * * *', async () => {
  console.log('Checking capsules...');
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await axios.get(FIREBASE_URL);
    const docs = res.data.documents || [];
    
    for (const doc of docs) {
      const fields = doc.fields;
      const sendDate = fields?.sendDate?.stringValue;
      const email = fields?.email?.stringValue;
      const message = fields?.message?.stringValue;
      const sent = fields?.sent?.booleanValue;
      
      if (sendDate === today && email && message && !sent) {
        await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: { message, to_email: email }
        });
        console.log(`Sent to ${email}`);
      }
    }
  } catch (e) {
    console.error(e.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

