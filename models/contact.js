const mongoose = require('mongoose')
require('dotenv').config()

console.log('connecting to database...')

mongoose.set('strictQuery',false)

mongoose
    .connect(process.env.db_url)
    .then(result => console.log('connected to database'))
    .catch(error => console.log('failed to connect to database:', error.message))

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        required: true
    }
})

contactSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

module.exports = mongoose.model('Contact', contactSchema)