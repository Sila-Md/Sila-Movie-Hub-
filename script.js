document.addEventListener('DOMContentLoaded', function() {
    let isAdmin = false;
    let allMovies = [];

    // Load movies from API
    async function loadMovies() {
        try {
            const response = await fetch('/api/movies');
            allMovies = await response.json();
            displayMovies();
            initializeSlider();
        } catch (error) {
            console.error('Error loading movies:', error);
            // Fallback to sample data
            loadSampleMovies();
        }
    }

    // Fallback sample data
    function loadSampleMovies() {
        allMovies = [
            {
                id: 1,
                title: "Mwamba wa Maisha",
                genre: "Drama",
                year: "2023",
                rating: "4.5",
                category: "trending",
                description: "Drama ya kisasa inayoelezea maisha ya vijana katika mji wa Dar es Salaam.",
                poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                backdrop: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                free: true
            },
            {
                id: 2,
                title: "Kivuli cha Mapenzi",
                genre: "Romance",
                year: "2023", 
                rating: "4.2",
                category: "trending",
                description: "Mapenzi yanayokabiliana na changamoto za kijamii na kifamilia.",
                poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                backdrop: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                free: true
            }
        ];
        displayMovies();
        initializeSlider();
    }

    // Display movies in sections
    function displayMovies() {
        const categories = {
            trendingMovies: 'trending',
            hollywoodMovies: 'hollywood', 
            bollywoodMovies: 'bollywood',
            swahiliMovies: 'swahili'
        };

        for (const [containerId, category] of Object.entries(categories)) {
            const container = document.getElementById(containerId);
            if (!container) continue;
            
            container.innerHTML = '';
            
            const categoryMovies = allMovies.filter(movie => movie.category === category);
            
            categoryMovies.forEach(movie => {
                const movieCard = createMovieCard(movie);
                container.appendChild(movieCard);
            });
        }
    }

    // Create movie card
    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            ${movie.free ? '<div class="free-badge">BURE</div>' : ''}
            <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" onerror="this.src='https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span>${movie.year}</span>
                    <span>★ ${movie.rating}</span>
                </div>
            </div>
        `;
        
        movieCard.addEventListener('click', () => {
            playMovie(movie);
        });
        
        return movieCard;
    }

    // Initialize slider
    function initializeSlider() {
        const sliderContainer = document.getElementById('slidesContainer');
        const sliderControls = document.getElementById('sliderControls');
        
        const trendingMovies = allMovies.filter(movie => movie.category === 'trending');
        
        sliderContainer.innerHTML = '';
        sliderControls.innerHTML = '';
        
        trendingMovies.forEach((movie, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.innerHTML = `
                <div class="slide-backdrop" style="background-image: url('${movie.backdrop}')"></div>
                <div class="slide-content">
                    <h1 class="slide-title">${movie.title}</h1>
                    <p class="slide-description">${movie.description}</p>
                    <div class="slide-actions">
                        <button class="play-btn" onclick="playMovie(${movie.id})">
                            <i class="fas fa-play"></i> Cheza Sasa
                        </button>
                        <button class="info-btn">
                            <i class="fas fa-info-circle"></i> Maelezo Zaidi
                        </button>
                    </div>
                </div>
            `;
            sliderContainer.appendChild(slide);

            // Create slider dot
            const dot = document.createElement('div');
            dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.index = index;
            dot.addEventListener('click', () => goToSlide(index));
            sliderControls.appendChild(dot);
        });

        // Start auto sliding if we have slides
        if (trendingMovies.length > 0) {
            startSlider();
        }
    }

    // Slider functionality
    let currentSlide = 0;
    let slideInterval;

    function goToSlide(index) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slider-dot');
        
        if (slides.length === 0) return;
        
        currentSlide = index;
        const sliderContainer = document.getElementById('slidesContainer');
        sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update active dot
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
        
        resetSlideInterval();
    }

    function nextSlide() {
        const slides = document.querySelectorAll('.slide');
        if (slides.length === 0) return;
        
        currentSlide = (currentSlide + 1) % slides.length;
        goToSlide(currentSlide);
    }

    function startSlider() {
        resetSlideInterval();
    }

    function resetSlideInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Play movie function
    window.playMovie = function(movie) {
        if (typeof movie === 'object') {
            alert(`🎬 Inaanza kucheza: ${movie.title}\n\n📝: ${movie.description}\n⭐ Ukadiriaji: ${movie.rating}/5`);
        } else {
            const movieObj = allMovies.find(m => m.id === movie);
            if (movieObj) {
                alert(`🎬 Inaanza kucheza: ${movieObj.title}\n\n📝: ${movieObj.description}\n⭐ Ukadiriaji: ${movieObj.rating}/5`);
            }
        }
    };

    // Header scroll effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Admin modal functionality
    const adminBtn = document.getElementById('adminBtn');
    const adminModal = document.getElementById('adminModal');
    const closeModal = document.getElementById('closeModal');
    const adminForm = document.getElementById('adminForm');

    adminBtn.addEventListener('click', () => {
        adminModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        adminModal.style.display = 'none';
    });

    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                isAdmin = true;
                alert('✅ Umefanikiwa kuingia kama Msimamizi!');
                adminModal.style.display = 'none';
                showAdminPanel();
            } else {
                alert('❌ Nenosiri si sahihi! Tafadhali jaribu tena.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('❌ Hitilafu katika mfumo. Tafadhali jaribu tena.');
        }
    });

    // Show admin panel
    function showAdminPanel() {
        // Create admin panel
        const adminPanel = document.createElement('div');
        adminPanel.id = 'adminPanel';
        adminPanel.innerHTML = `
            <div class="admin-panel">
                <h3><i class="fas fa-cog"></i> Paneli ya Msimamizi</h3>
                <div class="admin-actions">
                    <button id="addMovieBtn" class="admin-action-btn">
                        <i class="fas fa-plus"></i> Ongeza Filamu Mpya
                    </button>
                    <button id="viewMoviesBtn" class="admin-action-btn">
                        <i class="fas fa-list"></i> Angalia Filamu Zote
                    </button>
                    <button id="logoutAdminBtn" class="admin-action-btn logout">
                        <i class="fas fa-sign-out-alt"></i> Toka
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(adminPanel);
        
        // Add event listeners
        document.getElementById('addMovieBtn').addEventListener('click', showAddMovieForm);
        document.getElementById('viewMoviesBtn').addEventListener('click', showAllMovies);
        document.getElementById('logoutAdminBtn').addEventListener('click', logoutAdmin);
    }

    // Show add movie form
    function showAddMovieForm() {
        const formHtml = `
            <div class="modal" id="addMovieModal">
                <div class="modal-content" style="max-width: 600px;">
                    <span class="close-modal" onclick="closeModal('addMovieModal')">&times;</span>
                    <h2 class="modal-title">Ongeza Filamu Mpya</h2>
                    <form id="addMovieForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="movieTitle">Jina la Filamu</label>
                                <input type="text" id="movieTitle" required>
                            </div>
                            <div class="form-group">
                                <label for="movieGenre">Aina</label>
                                <input type="text" id="movieGenre" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="movieYear">Mwaka</label>
                                <input type="text" id="movieYear" required>
                            </div>
                            <div class="form-group">
                                <label for="movieRating">Ukadiriaji</label>
                                <input type="text" id="movieRating" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="movieCategory">Kategoria</label>
                            <select id="movieCategory" required>
                                <option value="trending">Zilizopendwa</option>
                                <option value="hollywood">Hollywood</option>
                                <option value="bollywood">Bollywood</option>
                                <option value="swahili">Kiswahili</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="movieDescription">Maelezo</label>
                            <textarea id="movieDescription" rows="3" required></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="moviePoster">Picha (URL)</label>
                                <input type="url" id="moviePoster" required>
                            </div>
                            <div class="form-group">
                                <label for="movieBackdrop">Picha ya Nyuma (URL)</label>
                                <input type="url" id="movieBackdrop" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="movieFree" checked>
                                Filamu ya Bure
                            </label>
                        </div>
                        <button type="submit" class="submit-btn">Ongeza Filamu</button>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHtml);
        document.getElementById('addMovieModal').style.display = 'flex';
        
        document.getElementById('addMovieForm').addEventListener('submit', addNewMovie);
    }

    // Add new movie
    async function addNewMovie(e) {
        e.preventDefault();
        
        const newMovie = {
            title: document.getElementById('movieTitle').value,
            genre: document.getElementById('movieGenre').value,
            year: document.getElementById('movieYear').value,
            rating: document.getElementById('movieRating').value,
            category: document.getElementById('movieCategory').value,
            description: document.getElementById('movieDescription').value,
            poster: document.getElementById('moviePoster').value,
            backdrop: document.getElementById('movieBackdrop').value,
            free: document.getElementById('movieFree').checked
        };
        
        try {
            const response = await fetch('/api/admin/movies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMovie)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ Filamu imeongezwa kikamilifu!');
                closeModal('addMovieModal');
                // Reload movies
                loadMovies();
            } else {
                alert('❌ Hitilafu katika kuongeza filamu.');
            }
        } catch (error) {
            console.error('Add movie error:', error);
            alert('❌ Hitilafu katika mfumo. Tafadhali jaribu tena.');
        }
    }

    // Show all movies for management
    function showAllMovies() {
        const moviesHtml = `
            <div class="modal" id="allMoviesModal">
                <div class="modal-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
                    <span class="close-modal" onclick="closeModal('allMoviesModal')">&times;</span>
                    <h2 class="modal-title">Usimamizi wa Filamu (${allMovies.length})</h2>
                    <div class="movies-management">
                        ${allMovies.map(movie => `
                            <div class="movie-management-item">
                                <img src="${movie.poster}" alt="${movie.title}" style="width: 60px; height: 80px; object-fit: cover;">
                                <div class="movie-management-info">
                                    <h4>${movie.title}</h4>
                                    <p>${movie.genre} • ${movie.year} • ${movie.category}</p>
                                </div>
                                <div class="movie-management-actions">
                                    <button class="btn-small btn-danger" onclick="deleteMovie(${movie.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', moviesHtml);
        document.getElementById('allMoviesModal').style.display = 'flex';
    }

    // Delete movie
    window.deleteMovie = async function(movieId) {
        if (confirm('Je, una uhakika unataka kufuta filamu hii?')) {
            try {
                const response = await fetch(`/api/admin/movies/${movieId}`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Filamu imefutwa kikamilifu!');
                    closeModal('allMoviesModal');
                    // Reload movies
                    loadMovies();
                }
            } catch (error) {
                console.error('Delete movie error:', error);
                alert('❌ Hitilafu katika kufuta filamu.');
            }
        }
    };

    // Close modal
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    };

    // Logout admin
    function logoutAdmin() {
        isAdmin = false;
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.remove();
        }
        alert('👋 Umetoka kwenye paneli ya msimamizi.');
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Initialize
    loadMovies();
});
