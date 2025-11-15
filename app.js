const express = require('express');
const app = express();
const PORT = 8080;

// Middleware para procesar JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración del motor de vistas
app.set('view engine', 'pug');
app.set('views', './views');

// Datos iniciales de personajes
let characters = [
    { id: 1, name: 'Cloud Strife', job: 'Soldier', weapon: 'Buster sword', level: 25 },
    { id: 2, name: 'Tifa Lockhart', job: 'Fighter', weapon: 'Leather gloves', level: 22 },
    { id: 3, name: 'Aerith Gainsborough', job: 'Mage', weapon: 'Magic staff', level: 20 }
];

// Copia para restaurar
const initialCharacters = JSON.parse(JSON.stringify(characters));

// Funciones auxiliares simples
const isBodyEmpty = body => !body || Object.keys(body).length === 0;
const isLevelValid = level => level >= 1 && level <= 99;
const existsId = id => characters.some(c => c.id === id);
const existsName = name => characters.some(c => c.name === name);

// Obtener lista completa
app.get('/characters', (req, res) => res.json(characters));

// Obtener personaje por ID
app.get('/characters/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const character = characters.find(c => c.id === id);

    if (!character) {
        return res.status(404).json({ error: 'Character not found' });
    }

    res.json(character);
});

// Crear personaje
app.post('/characters', (req, res) => {
    if (isBodyEmpty(req.body)) return res.status(400).json({ error: 'Body is empty' });

    const { id, name, job, weapon, level } = req.body;

    // Validaciones básicas
    if (existsId(id) || existsName(name))
        return res.status(400).json({ error: 'ID or name already exists' });

    if (!isLevelValid(level))
        return res.status(400).json({ error: 'Level must be between 1 and 99' });

    const newCharacter = { id, name, job, weapon, level };
    characters.push(newCharacter);

    res.status(201).json(newCharacter);
});

// Actualizar personaje
app.put('/characters/:id', (req, res) => {
    if (isBodyEmpty(req.body)) return res.status(400).json({ error: 'Body is empty' });

    const id = parseInt(req.params.id);
    const index = characters.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Character not found' });

    const { id: newId, name, job, weapon, level } = req.body;

    // Verificaciones al modificar
    if (existsId(newId) && newId !== id)
        return res.status(400).json({ error: 'ID already exists' });

    if (existsName(name) && characters[index].name !== name)
        return res.status(400).json({ error: 'Name already exists' });

    if (!isLevelValid(level))
        return res.status(400).json({ error: 'Level must be between 1 and 99' });

    characters[index] = { id: newId, name, job, weapon, level };

    res.status(204).send();
});

// Eliminar personaje
app.delete('/characters/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = characters.findIndex(c => c.id === id);

    if (index === -1) return res.status(404).json({ error: 'Character not found' });

    characters.splice(index, 1);
    res.status(204).send();
});

// Rutas para vistas
app.get('/', (req, res) => res.redirect('/index'));
app.get('/index', (req, res) => res.render('index', { title: 'Welcome' }));
app.get('/list', (req, res) => res.render('list', { title: 'Character List', characters }));
app.get('/new', (req, res) => res.render('new', { title: 'New Character' }));

// Añadir personaje desde formulario
app.post('/new', (req, res) => {
    const { id, name, job, weapon, level } = req.body;
    characters.push({ id: parseInt(id), name, job, weapon, level: parseInt(level) });
    res.redirect('/list');
});

// Restaurar valores iniciales
app.post('/reset', (req, res) => {
    characters = JSON.parse(JSON.stringify(initialCharacters));
    res.status(204).send();
});

// Arranque del servidor
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
