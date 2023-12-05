const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = '';
const CUSTOM_OBJECT_TYPE_ID = '';

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

app.get('/', async (_, res) => {
  const customObjectURL = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_TYPE_ID}?limit=100&archived=false&properties=dev_id,title,price`;
  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
  };

  try {
    let allResults = [];
    let hasMore = true;
    let offset = 0;

    while (hasMore) {
      const resp = await axios.get(`${customObjectURL}&offset=${offset}`, { headers });
      const { results, paging } = resp.data;

      allResults = allResults.concat(results);

      if (paging && paging.next) {
        offset += paging.limit;
      } else {
        hasMore = false;
      }
    }
    res.render('index', { title: 'Show Custom Objects and Create Form | Integrating With HubSpot I Practicum', data: allResults });
  } catch (error) {
    console.error(error);
  }
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

app.get('/update-cobj', async (req, res) => {
  res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum', dev_id: req.query.dev_id, title: req.query.title, price: req.query.price });
}
);


// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

// * Code for Route 3 goes here
app.post('/update-cobj', async (req, res) => {
  const { title, price, dev_id } = req.body;
  const customObjectBaseURL = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_TYPE_ID}`;
  if (dev_id) {
    /* the custom property 'dev_id' was setup as unique. Due to this, we dont need the Search API Endpoint */
    const customObjectURL = `${customObjectBaseURL}/${dev_id}?idProperty=dev_id`;
    const headers = {
      Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
      'Content-Type': 'application/json'
    };

    const body = {
      properties: {
        title,
        dev_id,
        price
      }
    };

    try {
      await axios.patch(customObjectURL, body, { headers });
      res.redirect('/');
      return;
    }
    catch (error) {
      console.error(error);
      return;
    }
  } else {
    const dev_id = Math.floor(Math.random() * 1000000); // this should actually be a unique ID
    const customObjectURL = `${customObjectBaseURL}`;
    const headers = {
      Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
      'Content-Type': 'application/json'
    };

    const body = {
      properties: {
        title,
        dev_id,
        price
      }
    };

    try {
      await axios.post(customObjectURL, body, { headers });
      res.redirect('/');
      return;
    }
    catch (error) {
      console.error(error);
      return;
    }
  }

});



// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));