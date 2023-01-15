const express = require('express');
const smurfsRouters = require('./routers/smurfs_routers');
const smurfRouters = require('./routers/smurf_routers');
require('./config/db');

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use('/api/smurfs', smurfsRouters);
app.use('/api/smurf', smurfRouters);

app.listen(PORT, () => {
  console.log(`Listening on port: ${ PORT }`);
});
