import './Home.css'

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Welcome to LITLAB</h1>
        <p>Your Kodi-style media streaming platform</p>
        <button className="btn-primary">Start Watching</button>
      </section>

      <section className="featured">
        <h2>Recently Added</h2>
        <div className="media-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="media-card">
              <div className="media-poster">
                <div className="placeholder">📺</div>
              </div>
              <h3>Media Title {i}</h3>
              <p>2024 • Drama</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
