const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
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
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        console.log('served', id)
        res.json(person)
    } else {
        console.log('not found')
        res.status(404).end()
    }
})

app.get('/info', (req, res) => {
    const date = new Date()
    const statement = persons.length > 0
        ? `Phonebook has info for ${persons.length} people`
        : `Phone book is empty`
    res.send(`<h3>${statement}</h3><p>${date}</p>`)
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => {
        return person.id !== id
    })

    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const randomId = () => Math.ceil(Math.random() * 190) + 10
    const id = randomId()
    
    if (req.body.name && req.body.number) {

        for (let i = 0; i < persons.length; i ++) {
            if (persons[i].name === req.body.name) {
                return res.status(400).json({ error: 'name must be unique' })
            }
        }

        const person = {
            id: id,
            name: req.body.name,
            number: req.body.number,
        }
    
        persons = persons.concat(person)
        return res.json(person)
    }

    if (!req.body.name) {
        return res.status(400).json({ error: 'name should not be undefined' })
    }

    if (!req.body.number){
        return res.status(400).json({ error: 'number should not be undefined' })
    } 
    
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => console.log(`Connected to PORT ${PORT}`))
