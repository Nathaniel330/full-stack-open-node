require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Contact = require('./models/contact')

app.use(express.json())
app.use(express.static('build'))
app.use(cors())
app.use(morgan('tiny'))
app.use(morgan((tokens, req, res) => {
    const log = [
        'CONFIGURED MORGAN',
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ]

    if (tokens.method(req, res) === 'POST') {
        log.push(JSON.stringify(req.body))
    }

    return log.join(' ')
}))

const requestLogger = (request, response, next) => {
    console.log(`---
    NOT A PACKAGE LOGGER
    Method: ${request.method}
    Path: ${request.path}
    Body: ${JSON.stringify(request.body)}
---`)
    next()
}
app.use(requestLogger)

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (req, res) => {
    res.send("<h1>Node and Express Backend Part 3</h1>")
})

app.get('/api/persons', (req, res) => {
    console.log('served all')
    Contact.find({}).then(contacts => res.json(contacts))
})

app.get('/api/persons/:id', (req, res, next) => {
    Contact
        .findById(req.params.id)
        .then(contact => res.json(contact))
        .catch(error => next(error))
})

app.get('/info', (req, res) => {
    const date = new Date()
    let count = 0
    Contact.find({}).then(result => {
        result.forEach(() => count++)
        console.log(count)
        const statement = count > 0
        ? `Phonebook has info for ${count} people`
        : `Phone book is empty`
        res.send(`<h3>${statement}</h3><p>${date}</p>`)
    })
})

app.delete('/api/persons/:id', (req, res, next) => {

    Contact.findByIdAndRemove(req.params.id)
        .then(result => res.status(204).end())
        .catch(error => next(error))

    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    
    if (req.body.name && req.body.number) {
        const person = new Contact({
            name: req.body.name,
            number: req.body.number
        })
    
        // persons = persons.concat(person)
        person.save().then(savedPerson => {
            return res.json(savedPerson)
        })
    }

    if (!req.body.name) {
        return res.status(400).json({ error: 'name should not be undefined' })
    }

    if (!req.body.number){
        return res.status(400).json({ error: 'number should not be undefined' })
    } 
    
})

app.put('/api/persons/:id', (req, res, next) => {
    Contact
        .findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                number: req.body.number,
            },
            {new: true}
        )
        .then(updatedContact => res.json(updatedContact))
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Connected to PORT ${PORT}`))
