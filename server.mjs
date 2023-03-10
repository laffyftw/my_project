import express from 'express';
import Joke from './node_modules/jokemaster/joke.mjs';
import { setLang, t } from './node_modules/langmodule/src/lang.mjs';

const app = express();
const port = process.env.PORT || 8080;

app.use('/node_modules', express.static('node_modules'));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});

app.get('/joke', async (req, res, next) => {
  const lang = req.query.lang || 'en';
  setLang(lang);

  const joke = new Joke();
  const jokeText = joke.tellAJoke(req.params.index);
  const translatedJoke = t(jokeText);

  const response = {
    joke: translatedJoke,
    lang: lang,
  };
  res.send(response);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});