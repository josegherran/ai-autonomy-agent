import app from './app.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 AI Autonomy Mapper API listening on http://localhost:${PORT}`)
  console.log(`📚 OpenAPI docs at http://localhost:${PORT}/api/docs`)
})
