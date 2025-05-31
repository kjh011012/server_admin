import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const VULTR_API_KEY = 'api key';

async function getInstanceInfo(instanceId) {
  const response = await fetch(`https://api.vultr.com/v2/instances/${instanceId}`, {
    headers: {
      Authorization: `Bearer ${VULTR_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch instance information.');
  }

  return response.json();
}

function rebootInstance(instanceId) {
  return fetch(`https://api.vultr.com/v2/instances/${instanceId}/reboot`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VULTR_API_KEY}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to reboot instance.');
      }
      console.log('Instance rebooted successfully.');
    })
    .catch((error) => {
      console.error(error);
    });
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Get the directory path of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, './')));
app.get('/', (req, res) => {
  const instanceId = req.query.instanceId;

  if (!instanceId) {
    return res.status(400).send('Instance ID is required.');
  }

  getInstanceInfo(instanceId)
    .then((instance) => {
      res.render('reboot.html', { instance });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error fetching instance information.');
    });
});

app.post('/reboot', (req, res) => {
  const instanceId = req.body.instanceId;
  rebootInstance(instanceId)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error(error);
      res.sendStatus(500);
    });
});

app.listen(4442, () => {
  console.log('Server listening on port 4442');
});
