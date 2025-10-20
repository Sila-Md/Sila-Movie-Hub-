const express = require('express');
const path = require('path');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const cors = require('cors');

// Debug: Check if files exist
console.log('📁 Current directory:', __dirname);
console.log('📁 Files in directory:', fs.readdirSync(__dirname));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize lowdb
try {
    const adapter = new FileSync(path.join(__dirname, 'movies.json'));
    const db = low(adapter);
    console.log('✅ Database initialized successfully');
    
    // Set default data
    db.defaults({ movies: [] }).write();

    // Routes
    // Serve main page
    app.get('/', (req, res) => {
        console.log('📄 Serving index.html');
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    // Get all movies
    app.get('/api/movies', (req, res) => {
        const movies = db.get('movies').value();
        console.log(`🎬 Serving ${movies.length} movies`);
        res.json(movies);
    });

    // Get movies by category
    app.get('/api/movies/category/:category', (req, res) => {
        const { category } = req.params;
        const movies = db.get('movies')
            .filter({ category })
            .value();
        console.log(`🎬 Serving ${movies.length} ${category} movies`);
        res.json(movies);
    });

    // Get free movies
    app.get('/api/movies/free', (req, res) => {
        const movies = db.get('movies')
            .filter({ free: true })
            .value();
        console.log(`🎬 Serving ${movies.length} free movies`);
        res.json(movies);
    });

    // Get movie by ID
    app.get('/api/movies/:id', (req, res) => {
        const { id } = req.params;
        const movie = db.get('movies')
            .find({ id: parseInt(id) })
            .value();
        
        if (movie) {
            console.log(`🎬 Serving movie: ${movie.title}`);
            res.json(movie);
        } else {
            res.status(404).json({ error: 'Movie not found' });
        }
    });

    // Admin login
    app.post('/api/admin/login', (req, res) => {
        const { password } = req.body;
        
        if (password === 'Sila25') {
            console.log('🔐 Admin login successful');
            res.json({ success: true, message: 'Login successful' });
        } else {
            console.log('🔐 Admin login failed');
            res.status(401).json({ success: false, message: 'Invalid password' });
        }
    });

    // Health check
    app.get('/health', (req, res) => {
        res.json({ 
            status: 'OK', 
            message: 'SilaMovieHub is running', 
            timestamp: new Date().toISOString(),
            directory: __dirname,
            files: fs.readdirSync(__dirname)
        });
    });

    // Handle 404
    app.use('*', (req, res) => {
        res.status(404).json({ error: 'Endpoint not found' });
    });

} catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    // Basic routes even if DB fails
    app.get('/', (req, res) => {
        res.send(`
            <html>
                <head><title>SilaMovieHub</title></head>
                <body>
                    <h1>🎬 SilaMovieHub</h1>
                    <p>Database initialization failed. Check logs.</p>
                    <p>Error: ${error.message}</p>
                </body>
            </html>
        `);
    });

    app.get('/health', (req, res) => {
        res.json({ 
            status: 'ERROR', 
            message: 'Database failed',
            error: error.message 
        });
    });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 SilaMovieHub server running on port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`🔐 Admin password: Sila25`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Directory: ${__dirname}`);
});
