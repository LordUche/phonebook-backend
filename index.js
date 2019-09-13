require('dotenv/config');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
const PORT = process.env.PORT || 3001;

const app = express();
app.disable('x-powered-by');

const unknownEndpoint = (req, res, next) => {
  res.status(404).json({ error: 'unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformed id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(logger('dev'));
}

app.use(express.static('build'));

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
  Person.find({})
    .count()
    .then(count => {
      res.json({
        summary: `Phonebook has info for ${count} people`,
        time: new Date().toLocaleDateString('en-NG', options),
      });
    });
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()));
  });
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) res.json(person.toJSON());
      else res.status(404).end();
    })
    .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
  Person.findOne({ name: req.body.name }).then(person => {
    if (person) {
      person.number = req.body.number;
      person
        .save()
        .then(person => res.json(person.toJSON()))
        .catch(error => next(error));
    } else {
      const newPerson = new Person({ ...req.body });
      newPerson
        .save()
        .then(person => {
          res.status(201).json(person.toJSON());
        })
        .catch(error => {
          error.message.indexOf('duplicate key error') !== -1
            ? res.status(409).json({ error: 'name must be unique' })
            : next(error);
        });
    }
  });
});

app.put('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .then(person => res.json(person.toJSON()))
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => res.status(404).end());
});

app.use(unknownEndpoint);
app.use(errorHandler);

app.listen(PORT, () => console.log('Server running on port', PORT));
