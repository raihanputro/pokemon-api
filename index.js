const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();

const PORT = 3001;
dotenv.config();

const pokemon = require('./server/api/pokemon');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('Connected');
});

app.use('/pokemon', pokemon);

app.listen(PORT, () => {
    console.log(`Server is running in ${PORT}`)
});

