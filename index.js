require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('build'));

morgan.token('data', function(req, res) {
    return (JSON.stringify(req.body))
})
app.use(morgan(':method :url :data'));

const Person = require('./models/person');

let persons = [
    {
      "name": "Arto Hellas",
      "number": "050 7642552",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "0123456789",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "694201337",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "444222222",
      "id": 4
    }
]

//get all
app.get('/api/persons', (request, response) => {    
    Person.find({}).then(persons => {
        response.json(persons.map(person => person.toJSON()));
    })    
});

//info
app.get('/api/info', (request, response) => {
    let amount = persons.length;
    let time = new Date().toTimeString()
    let msg = `Phonebook has ${amount} contacts <br/> ${time}`
    response.send('<p>'+msg+'</p>')
})

//default
app.get('/', (request, response) => {
    response.send('<p>Hello!</p>')
})

//get person //update person
app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        if(person) {
            const body = request.body;
            Person.findByIdAndUpdate(request.params.id, {"name": `${body.name}`, "number": `${body.number}`});
            response.json(person.toJSON());
        } else {
            response.status(404).end();
        }
    })
    .catch(error => {
        console.log(error);
        response.status(400).send({error: 'bad id'});    
    })
})

//delete person
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    Person.findByIdAndDelete(id)
        .then(result => {
            response.status(204).end();
        })
        .catch(error => {
            response.status(400).send({error: 'bad id'});
        })
})

//add person
app.post('/api/persons', (request, response) => {    
    const body = request.body;
    

    if(body.name==="" || body.number===""){
        console.log('post cancelled');
        
        response.status(400).json({
            error: "content missing"
        })
    } else {
        const person = new Person({
            name: body.name,
            number: body.number
        });
        //persons = persons.concat(person);
        person.save().then(addedPerson => {
            response.json(addedPerson.toJSON());
        })
    }
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})