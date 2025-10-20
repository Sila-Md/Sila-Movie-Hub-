const express = require('express');
const path = require('path');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from current directory
app.use(express.static(__dirname));

// Initialize lowdb
const adapter = new FileSync(path.join(__dirname, 'movies.json'));
const db = low(adapter);

// Set default data
db.defaults({ movies: [] }).write();

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get all movies
app.get('/api/movies', (req, res) => {
    const movies = db.get('movies').value();
    res.json(movies);
});

// Get movies by category
app.get('/api/movies/category/:category', (req, res) => {
    const { category } = req.params;
    const movies = db.get('movies')
        .filter({ category })
        .value();
    res.json(movies);
});

// Get free movies
app.get('/api/movies/free', (req, res) => {
    const movies = db.get('movies')
        .filter({ free: true })
        .value();
    res.json(movies);
});

// Get movie by ID
app.get('/api/movies/:id', (req, res) => {
    const { id } = req.params;
    const movie = db.get('movies')
        .find({ id: parseInt(id) })
        .value();
    
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).json({ error: 'Movie not found' });
    }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    
    if (password === 'Sila25') {
        res.json({ 
            success: true, 
            message: 'Login successful',
            isAdmin: true
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

// Admin routes - Add new movie
app.post('/api/admin/movies', (req, res) => {
    const { title, genre, year, rating, category, description, poster, backdrop, free } = req.body;
    
    const newMovie = {
        id: Date.now(),
        title,
        genre,
        year,
        rating,
        category,
        description,
        videoUrl: `/videos/${title.toLowerCase().replace(/\s+/g, '_')}.mp4`,
        poster,
        backdrop,
        free: free || true
    };
    
    db.get('movies')
        .push(newMovie)
        .write();
    
    res.json({ success: true, movie: newMovie });
});

// Admin routes - Update movie
app.put('/api/admin/movies/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    db.get('movies')
        .find({ id: parseInt(id) })
        .assign(updates)
        .write();
    
    res.json({ success: true });
});

// Admin routes - Delete movie
app.delete('/api/admin/movies/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('movies')
        .remove({ id: parseInt(id) })
        .write();
    
    res.json({ success: true });
});

// Search movies
app.get('/api/search', (req, res) => {
    const { q } = req.query;
    
    if (!q) {
        return res.json([]);
    }
    
    const movies = db.get('movies')
        .filter(movie => 
            movie.title.toLowerCase().includes(q.toLowerCase()) ||
            movie.genre.toLowerCase().includes(q.toLowerCase()) ||
            movie.description.toLowerCase().includes(q.toLowerCase())
        )
        .value();
    
    res.json(movies);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'SilaMovieHub is running', 
        timestamp: new Date().toISOString() 
    });
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 SilaMovieHub server running on port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`🔐 Admin password: Sila25`);
});
