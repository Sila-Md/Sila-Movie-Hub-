const express = require('express')
const path = require('path')
const fs = require('fs').promises
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '.')))

const DB = path.join(__dirname, 'db.json')
const ADMIN_PASS = 'Sila25'

async function readDB(){
  try{
    const raw = await fs.readFile(DB, 'utf8')
    return JSON.parse(raw)
  }catch(e){
    return { movies: [] }
  }
}
async function writeDB(data){
  await fs.writeFile(DB, JSON.stringify(data, null, 2), 'utf8')
}

app.get('/movies', async (req,res) => {
  const db = await readDB()
  res.json(db.movies)
})

app.post('/movies', async (req,res) => {
  const auth = req.headers['authorization'] || ''
  if(auth !== ADMIN_PASS) return res.status(401).json({ error: 'unauthorized' })
  const db = await readDB()
  const movie = req.body
  movie.id = Date.now().toString(36)
  db.movies.unshift(movie)
  await writeDB(db)
  res.json(movie)
})

app.put('/movies/:id', async (req,res) => {
  const auth = req.headers['authorization'] || ''
  if(auth !== ADMIN_PASS) return res.status(401).json({ error: 'unauthorized' })
  const db = await readDB()
  const idx = db.movies.findIndex(m=>m.id===req.params.id)
  if(idx===-1) return res.status(404).json({ error: 'not found' })
  db.movies[idx] = { ...db.movies[idx], ...req.body }
  await writeDB(db)
  res.json(db.movies[idx])
})

app.delete('/movies/:id', async (req,res) => {
  const auth = req.headers['authorization'] || ''
  if(auth !== ADMIN_PASS) return res.status(401).json({ error: 'unauthorized' })
  const db = await readDB()
  db.movies = db.movies.filter(m=>m.id!==req.params.id)
  await writeDB(db)
  res.json({ ok: true })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=> console.log('Server running on', PORT))
