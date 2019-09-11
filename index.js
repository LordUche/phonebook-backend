require('dotenv/config');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1,
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2,
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3,
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4,
  },
];

const generateId = array => {
  const maxId = array.length ? Math.max(...array.map(person => person.id)) : 0;
  return maxId + 1;
};

const nameExists = (persons, newPerson) => {
  const person = persons.find(person => person.name === newPerson.name);
  return !!person;
};

const unknownEndpoint = (req, res, next) => {
  res.status(404).json({ error: 'unknown endpoint' });
};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(logger('dev'));
}

app.get('/info', (req, res) => {
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  };
  res.json({
    summary: `Phonebook has info for ${persons.length} people`,
    time: new Date().toLocaleDateString('en-NG', options),
  });
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(person => person.id === id);
  person ? res.json(person) : res.status(404).end();
});

app.post('/api/persons', (req, res) => {
  if (!req.body.name || !req.body.number) {
    return res.status(400).json({ error: 'name and number are required' });
  } else if (nameExists(persons, req.body)) {
    return res.status(409).json({ error: 'name must be unique' });
  }
  const person = { ...req.body, id: generateId(persons) };
  persons.push(person);
  res.status(201).json(person);
});

app.put('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  let person = persons.find(person => person.id === id);
  persons.forEach(p => {
    if (p.id === id) {
      person = { ...person, ...req.body };
    }
  });
  res.json(person);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);
  res.status(204).end();
});

app.use(unknownEndpoint);

app.listen(PORT, () => console.log('Server running on port', PORT));
