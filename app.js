const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug');
app.set('views', './views');



let characters = [
    { id: 1, name: 'Cloud Strife', job: 'Soldier', weapon: 'Buster sword', level: 25 },
    { id: 2, name: 'Tifa Lockhart', job: 'Fighter', weapon: 'Leather gloves', level: 22 },
    { id: 3, name: 'Aerith Gainsborough', job: 'Mage', weapon: 'Magic staff', level: 20 }
];

const initialCharacters = JSON.parse(JSON.stringify(characters));



const isBodyEmpty = body => !body || Object.keys(body).length === 0;
const isLevelValid = level => level >= 1 && level <= 99;
const existsId = id => characters.some(c => c.id === id);
const existsName = name => characters.some(c => c.name === name);



app.get('/characters', (req, res) => res.json(characters));


app.get('/characters/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const character = characters.find(c => c.id === id);

    if (!character) {
        return res.status(404).json({ error: 'Character not found' });
    }

    res.json(character);
});



app.post('/characters', (req, res) => {
    if (isBodyEmpty(req.body)) return res.status(400).json({ error: 'Body is empty' });

    const { id, name, job, weapon, level } = req.body;

    if (existsId(id) || existsName(name))
        return res.status(400).json({ error: 'ID or name already exists' });

    if (!isLevelValid(level))
        return res.status(400).json({ error: 'Level must be between 1 and 99' });

    const newCharacter = { id, name, job, weapon, level };
    characters.push(newCharacter);

    res.status(201).json(newCharacter);
});


app.put('/characters/:id', (req, res) => {
    if (isBodyEmpty(req.body)) return res.status(400).json({ error: 'Body is empty' });

    const id = parseInt(req.params.id);
    const index = characters.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Character not found' });

    const { id: newId, name, job, weapon, level } = req.body;

    if (existsId(newId) && newId !== id)
        return res.status(400).json({ error: 'ID already exists' });

    if (existsName(name) && characters[index].name !== name)
        return res.status(400).json({ error: 'Name already exists' });

    if (!isLevelValid(level))
        return res.status(400).json({ error: 'Level must be between 1 and 99' });

    characters[index] = { id: newId, name, job, weapon, level };

    res.status(204).send();
});


app.delete('/characters/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = characters.findIndex(c => c.id === id);

    if (index === -1) return res.status(404).json({ error: 'Character not found' });

    characters.splice(index, 1);
    res.status(204).send();
});



app.get('/', (req, res) => res.redirect('/index'));
app.get('/index', (req, res) => res.render('index', { title: 'Welcome' }));
app.get('/list', (req, res) => res.render('list', { title: 'Character List', characters }));
app.get('/new', (req, res) => res.render('new', { title: 'New Character' }));

app.post('/new', (req, res) => {
    const { id, name, job, weapon, level } = req.body;
    characters.push({ id: parseInt(id), name, job, weapon, level: parseInt(level) });
    res.redirect('/list');
});


app.post('/reset', (req, res) => {
    characters = JSON.parse(JSON.stringify(initialCharacters));
    res.status(204).send();
});



app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
