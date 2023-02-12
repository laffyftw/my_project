const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

  const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});