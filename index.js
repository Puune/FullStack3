const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

morgan.token('data', function(req, res) {
    return (JSON.stringify(req.body))
})

app.use(morgan(':method :url :data'));

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
app.get('/persons', (request, response) => {    
    response.json(persons);    
})

//info
app.get('/info', (request, response) => {
    let amount = persons.length;
    let time = new Date().toTimeString()
    let msg = `Phonebook has ${amount} contacts <br/> ${time}`
    response.send('<p>'+msg+'</p>')
})

//default
app.get('/', (request, response) => {
    response.send('<p>Hello!</p>')
})

//get person
app.get('/persons/:id', (request, response) => {
    const id = request.params.id;
    const person = persons.find(person => person.id === Number(id))

    if(person!==undefined){
        response.json(person);
    } else {
        response.status(204).end();
    }
})

//delete person
app.delete('/person/:id', (request, response) => {
    const id = request.params.id;
    persons = persons.filter(person => person.id !== Number(id))

    response.status(204)
})

//add person
app.post('/persons', (request, response) => {    
    const body = request.body;

    const getId = () => {
        let id = 1;
        while(persons.some(person => person.id===id)){
            id = Math.floor(Math.random()*100);
        }
        console.log('id:',id);
        
        return(
            id
        )
    }
    
    const person = {
        name: body.name,
        number: body.number,
        id: getId()
    }

    if(body.name==="" || body.number===""){
        console.log('post cancelled');
        
        response.status(400).json({
            error: "content missing"
        })
    } else if(persons.some(person => person.name === body.name)){
        console.log('post');
        
        response.status(400).json({
            error: "Name already exists"
        })
    } else {
        persons = persons.concat(person);
        response.json(persons)
    }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})