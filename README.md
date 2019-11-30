[![npm](https://img.shields.io/npm/v/mongoose-active-record.svg)](https://www.npmjs.com/package/mongoose-active-record)

# Mongoose Activerecord
A wrapper library to provide an elegant activerecord-like approach to creating mongoose models.

Traditional mongoose model
```javascript
const animalSchema = new Schema({ name: String, type: String });
// Creating an instance method
animalSchema.methods.findSimilarTypes = function() {
  return this.model('Animal').find({ type: this.type });
};

// Creating a static method
animalSchema.statics.findByType = function(type) {
  return this.find({ type });
};
const Animal = mongoose.model('Animal', schema);

const dog = new Animal({ type: 'dog' });
const dogs = await dog.findSimilarTypes()
const otherDogs = await Animal.findByType('dog');
```

Mongoose ActiveRecord model
```javascript
class Animal {
  //Schema definition 
  static get name() { return String }
  static get type() { return { type: String, index: true } }

  //Create a static method
  static findByType(type) {
    return this.find({ type })
  }

  //Create an instance method
  findSimilarTypes() {
    return this.model('Animal').find({ type: this.type });
  }
}

const { Animal } = await mongooseActiveRecord(options)

const dog = new Animal({ type: 'dog' });
const dogs = await dog.findSimilarTypes()
const otherDogs = await Animal.findByType('dog');
```

## Usage 
```javascript
const mongooseActiveRecord = require('mongoose-active-record')

const options = {
  modelPath: path.join(__dirname, './models'),
  connectionUrl: 'mongodb://localhost/test',
  connectionOptions: {
    useNewUrlParser: true
  },
  schemaOptions: {
    timestamps: true
  }
}

const models = await mongooseActiveRecord(options)
const { Pet } = models
await Pet.find({})
```

#### Model definition
```javascript
// ./models/Pet.js
class Pet{
  static get someField() { return String }
  static staticMethod() {
   console.log('do something')
  }

  instanceMethod() {
    console.log('do something else')
  }
}
module.exports = Pet
```

Specifics:
* Static getters are converted into the schema.  The getter can return any [schema type](https://mongoosejs.com/docs/schematypes.html)
* Static methods are converted into [static schema methods](https://mongoosejs.com/docs/guide.html#statics)
* Standard class methods are converted into [schema instance methods](https://mongoosejs.com/docs/guide.html#methods)
* The models returned from mongooseActiveRecord are just [mongoose models](https://mongoosejs.com/docs/models.html) 

## Options
* modelPath: Path to the directory where your models are defined.
* connectionUrl: Any valid [mongoose connection string](https://mongoosejs.com/docs/connections.html#connection-string-options) 
* connectionOptions: Any valid [mongoose connection option](https://mongoosejs.com/docs/connections.html#options)
* schemaOptions: any valid [mongoose schema option](https://mongoosejs.com/docs/guide.html#options)

## Contributing
Pull requests or issues welcome!