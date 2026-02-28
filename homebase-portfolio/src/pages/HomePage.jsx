import React from 'react';

export function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to HomeBase
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Your ultimate destination for gaming and music entertainment. Explore our curated collections and discover new favorites.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary">
            Explore Games
          </button>
          <button className="btn-secondary">
            Discover Music
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="text-center space-y-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Why Choose HomeBase?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Curated Collections</h3>
            <p className="text-gray-600">Hand-picked games and music for every taste and preference.</p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Seamless Experience</h3>
            <p className="text-gray-600">Smooth navigation and intuitive interface for effortless browsing.</p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Community Features</h3>
            <p className="text-gray-600">Connect with fellow enthusiasts and share your experiences.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="text-center space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Join Our Community
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="card">
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <p className="text-gray-600">Games Available</p>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
            <p className="text-gray-600">Music Tracks</p>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
            <p className="text-gray-600">Active Users</p>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <p className="text-gray-600">Support Available</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;