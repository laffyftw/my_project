import express from 'express';
import Joke from './node_modules/jokemaster/joke.mjs';
import { setLang, t } from './node_modules/langmodule/src/lang.mjs';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/joke', async (req, res) => {
  const lang = req.query.lang || 'en';
  setLang(lang);
  console.log('Current language:', lang);
  const joke = new Joke();
  const jokeText = await t('joke');
  console.log('Joke:', jokeText);

  const response = {
    joke: jokeText,
    lang: lang,
  };
  res.send(response);
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});