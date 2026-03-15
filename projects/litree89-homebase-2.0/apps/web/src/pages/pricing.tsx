import React from 'react';
import Head from 'next/head';

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>Pricing - LITLABS HomeBase</title>
        <meta name="description" content="Choose the perfect plan for your needs" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">💰 Simple, Transparent Pricing</h1>
            <p className="text-xl text-gray-300">Choose the plan that fits your needs</p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 hover:border-purple-500 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <div className="text-4xl font-bold mb-4">
                  $9<span className="text-lg text-gray-400">/mo</span>
                </div>
                <p className="text-gray-400">Perfect for individuals</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Basic features
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>1 user
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Community support
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  5GB storage
                </li>
              </ul>

              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Get Started
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 transform scale-105 shadow-2xl relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 font-bold px-4 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <div className="text-4xl font-bold mb-4">
                  $29<span className="text-lg text-gray-200">/mo</span>
                </div>
                <p className="text-gray-100">For growing teams</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-2">✓</span>
                  All Starter features
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-2">✓</span>5 users
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-2">✓</span>
                  Priority support
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-2">✓</span>
                  50GB storage
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-2">✓</span>
                  Advanced analytics
                </li>
              </ul>

              <button className="w-full bg-white text-purple-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-colors">
                Get Started
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 hover:border-purple-500 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="text-4xl font-bold mb-4">
                  $99<span className="text-lg text-gray-400">/mo</span>
                </div>
                <p className="text-gray-400">For large organizations</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  All Professional features
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Unlimited users
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  24/7 dedicated support
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Unlimited storage
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Custom integrations
                </li>
              </ul>

              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Contact Sales
              </button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 text-center">
            <p className="text-gray-400">
              All plans include a 14-day money-back guarantee. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
