// Add these functions to script.js

// Load movies from API
async function loadMovies() {
    try {
        const response = await fetch('/api/movies');
        const movies = await response.json();
        return movies;
    } catch (error) {
        console.error('Error loading movies:', error);
        return [];
    }
}

// Play movie function
function playMovie(movieId) {
    // In a real app, this would open a video player
    alert(`Inaanza kucheza: ${movieId}\n\nKatika toleo kamili, hii ingekuwa inaonyesha video player.`);
}

// Update movie card creation to include free badge
function createMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    movieCard.innerHTML = `
        ${movie.free ? '<div class="free-badge">BURE</div>' : ''}
        <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-meta">
                <span>${movie.year}</span>
                <span>★ ${movie.rating}</span>
            </div>
        </div>
    `;
    
    movieCard.addEventListener('click', () => {
        if (movie.free) {
            playMovie(movie.id);
        } else {
            alert('Filamu hii inahitaji malipo. Tafadhali lipa kwanza.');
        }
    });
    
    return movieCard;
}
