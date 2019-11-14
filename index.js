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


//get all
app.get('/api/persons', (request, response) => {
	Person.find({}).then(persons => {
		response.json(persons.map(person => person.toJSON()));
	})
});

//info
app.get('/api/info', (request, response) => {
	Person.find({})
		.then(persons => {
			let amount = persons.length
			let time = new Date().toTimeString()
			let msg = `Phonebook has ${amount} contacts <br/> ${time}`
			response.send('<p>'+msg+'</p>')
		})
})

//default
app.get('/', (request, response) => {
	response.send('<p>Hello!</p>')
})

//get person
app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then(person => {
			if(person) {
				response.json(person.toJSON());
			} else {
				response.status(404).end();
			}
		})
		.catch(error => next(error))
})

//update person
app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body;
	const person = {
		name: body.name,
		number: body.number
	}
	console.log(body);
	Person.findByIdAndUpdate(request.params.id, person, { new: true })
		.then(updatedPerson => {
			response.json(updatedPerson.toJSON());
		})
		.catch(error => next(error));
})

//delete person
app.delete('/api/persons/:id', (request, response, next) => {
	const id = request.params.id;
	Person.findByIdAndDelete(id)
		.then(result => {
			response.status(204).end();
		})
		.catch(error => next(error));
})

//add person
app.post('/api/persons', (request, response, next) => {
	const body = request.body;


	if(body.name===undefined || body.number===undefined){
		console.log('post cancelled');

		response.status(400).json({
			error: 'content missing'
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
			.catch(error => next(error));
	}
})

const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if(error.name === 'CastError' && error.kind === 'ObjectId'){
		return response.status(400).send({ error: 'Malform id' })
	} else if(error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}
	next(error);
}
app.use(errorHandler);

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})


/*
let persons = [
    {
      "name": "Arto Hellas",
      "number": "050 7642552"
    },
    {
      "name": "Ada Lovelace",
      "number": "0123456789"
    },
    {
      "name": "Dan Abramov",
      "number": "694201337"
    },
    {
      "name": "Mary Poppendieck",
      "number": "444222222"
    }
]
*/