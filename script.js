/ Fetch movies and render slider + grid
let movies = []
const slider = document.getElementById('slider')
const grid = document.getElementById('grid')
const searchInput = document.getElementById('searchInput')
const modal = document.getElementById('modal')
const videoPlayer = document.getElementById('videoPlayer')
const modalTitle = document.getElementById('modalTitle')
const modalDesc = document.getElementById('modalDesc')
const closeModal = document.getElementById('closeModal')
const prevBtn = document.getElementById('prevBtn')
const nextBtn = document.getElementById('nextBtn')
const sliderTitle = document.getElementById('sliderTitle')

let slideIndex = 0
let slideTimer = null

async function loadMovies(){
  try{
    const res = await fetch('/movies')
    movies = await res.json()
  }catch(e){
    console.error('Fetch failed, using local sample')
    movies = []
  }
  renderSlider()
  renderGrid()
  startAutoSlide()
}

function renderSlider(){
  const trending = movies.filter(m=>m.trending)
  slider.innerHTML = ''
  trending.forEach((m, i)=>{
    const div = document.createElement('div')
    div.className = 'slide'
    div.innerHTML = ''
    div.innerHTML += '<img src="'+m.thumbnail+'" alt="'+m.title+'" />'
    div.innerHTML += '<div class="slide-content"><h3>'+m.title+'</h3><p>'+m.description+'</p><div style="margin-top:12px">'
    div.innerHTML += '<button class="btn play" onclick="openPlayer(\''+m.id+'\')">Play</button>'
    if(m.type==='google-drive'){
      div.innerHTML += '<a class="btn dl" href="'+m.source+'" target="_blank">Download</a>'
    } else {
      div.innerHTML += '<button class="btn dl" onclick="openPlayer(\''+m.id+'\',\'download\')">Download</button>'
    }
    div.innerHTML += '</div></div>'
    slider.appendChild(div)
  })
  if(slideIndex >= slider.children.length) slideIndex = 0
  updateSliderPosition()
}

function updateSliderPosition(){
  const width = slider.children[0] ? slider.children[0].offsetWidth + 16 : 0
  slider.scrollTo({ left: width * slideIndex, behavior: 'smooth' })
}

function startAutoSlide(){
  if(slideTimer) clearInterval(slideTimer)
  slideTimer = setInterval(()=>{ slideIndex = (slideIndex+1) % Math.max(1, slider.children.length); updateSliderPosition() }, 4500)
  slider.addEventListener('mouseenter', ()=>{ clearInterval(slideTimer) })
  slider.addEventListener('mouseleave', ()=>{ startAutoSlide() })
}

prevBtn && prevBtn.addEventListener('click', ()=>{ slideIndex = Math.max(0, slideIndex-1); updateSliderPosition() })
nextBtn && nextBtn.addEventListener('click', ()=>{ slideIndex = Math.min(slider.children.length-1, slideIndex+1); updateSliderPosition() })

function renderGrid(filter=''){
  grid.innerHTML = ''
  const list = movies.filter(m => m.title.toLowerCase().includes(filter.toLowerCase()))
  list.forEach(m=>{
    const card = document.createElement('div')
    card.className = 'card'
    card.innerHTML = ''
    card.innerHTML += '<img src="'+m.thumbnail+'" alt="'+m.title+'" />'
    card.innerHTML += '<h4>'+m.title+'</h4>'
    card.innerHTML += '<p>'+m.description+'</p>'
    card.innerHTML += '<div class="actions">'
    card.innerHTML += '<button class="btn play" onclick="openPlayer(\''+m.id+'\')">Play</button>'
    if(m.type==='google-drive'){
      card.innerHTML += '<a class="btn dl" href="'+m.source+'" target="_blank">Download</a>'
    } else {
      card.innerHTML += '<button class="btn dl" onclick="openPlayer(\''+m.id+'\',\'download\')">Download</button>'
    }
    card.innerHTML += '</div>'
    grid.appendChild(card)
  })
}

searchInput && searchInput.addEventListener('input', (e)=> renderGrid(e.target.value))

window.openPlayer = function(id, action){
  const m = movies.find(x=>x.id===id)
  if(!m) return
  if(action==='download' && m.type==='m3u8'){
    window.open(m.source,'_blank')
    return
  }
  if(m.type === 'google-drive'){
    window.open(m.source,'_blank')
    return
  }
  modalTitle.textContent = m.title
  modalDesc.textContent = m.description
  videoPlayer.pause()
  videoPlayer.removeAttribute('src')
  if(m.type==='m3u8' && window.Hls && Hls.isSupported()){
    const hls = new Hls()
    hls.loadSource(m.source)
    hls.attachMedia(videoPlayer)
    videoPlayer.play().catch(()=>{})
  }else{
    videoPlayer.src = m.source
    videoPlayer.play().catch(()=>{})
  }
  modal.classList.remove('hidden')
}

closeModal && closeModal.addEventListener('click', ()=>{ modal.classList.add('hidden'); try{ videoPlayer.pause(); videoPlayer.removeAttribute('src'); }catch(e){} })

// Admin page functions (if on admin.html)
async function adminInit(){
  const passInput = document.getElementById('adminPass')
  const loginBtn = document.getElementById('loginBtn')
  const loginCard = document.getElementById('loginCard')
  const adminPanel = document.getElementById('adminPanel')
  const form = document.getElementById('movieForm')
  const moviesList = document.getElementById('moviesList')

  loginBtn.addEventListener('click', async ()=>{
    const pass = passInput.value.trim()
    if(pass==='Sila25'){
      loginCard.classList.add('hidden')
      adminPanel.classList.remove('hidden')
      await loadMovies()
      renderAdminList()
    }else{
      alert('Wrong password')
    }
  })

  form.addEventListener('submit', async (e)=>{
    e.preventDefault()
    const payload = {
      title: document.getElementById('title').value,
      description: document.getElementById('desc').value,
      thumbnail: document.getElementById('thumbnail').value || 'assets/posters/avatar.jpg',
      source: document.getElementById('source').value,
      type: document.getElementById('type').value,
      trending: document.getElementById('trending').checked
    }
    const res = await fetch('/movies', { method:'POST', headers:{ 'Content-Type':'application/json','Authorization':'Sila25' }, body: JSON.stringify(payload) })
    if(res.ok){
      alert('Movie added')
      await loadMovies()
      renderAdminList()
      form.reset()
    }else{
      alert('Error adding movie')
    }
  })

  window.renderAdminList = function(){
    moviesList.innerHTML = ''
    movies.forEach(m=>{
      const row = document.createElement('div')
      row.className = 'movie-row'
      row.innerHTML = ''
      row.innerHTML += '<img src="'+m.thumbnail+'" />'
      row.innerHTML += '<div class="meta"><h4>'+m.title+'</h4><div class="small">'+m.type+(m.trending? ' • trending' : '')+'</div></div>'
      row.innerHTML += '<div class="ops"><button onclick="editMovie(\''+m.id+'\')">Edit</button><button onclick="deleteMovie(\''+m.id+'\')">Delete</button></div>'
      moviesList.appendChild(row)
    })
  }

  window.editMovie = async function(id){
    const m = movies.find(x=>x.id===id)
    if(!m) return alert('Not found')
    document.getElementById('title').value = m.title
    document.getElementById('desc').value = m.description
    document.getElementById('thumbnail').value = m.thumbnail
    document.getElementById('source').value = m.source
    document.getElementById('type').value = m.type
    document.getElementById('trending').checked = m.trending
    // delete old then add on submit (simple)
    await fetch('/movies/'+id, { method:'DELETE', headers:{ 'Authorization':'Sila25' } })
  }

  window.deleteMovie = async function(id){
    if(!confirm('Delete movie?')) return
    const res = await fetch('/movies/'+id, { method:'DELETE', headers:{ 'Authorization':'Sila25' } })
    if(res.ok){ await loadMovies(); renderAdminList() }
  }
}

// init on page load
document.addEventListener('DOMContentLoaded', async ()=>{
  if(window.location.pathname.endsWith('admin.html')){
    await loadMovies()
    adminInit()
    return
  }
  await loadMovies()
})
