const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const URI = process.env.MONGODB_URI;

mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);

mongoose
  .connect(URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch(error => {
    console.error(`error connecting to MongoDB: ${error.message}`);
  });

const personSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, unique: true, required: true },
  number: { type: String, minlength: 8, required: true },
});

personSchema.set('toJSON', {
  transform: (document, returnedPerson) => {
    returnedPerson.id = returnedPerson._id.toString();
    delete returnedPerson._id;
    delete returnedPerson.__v;
  },
});

personSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Person', personSchema);
