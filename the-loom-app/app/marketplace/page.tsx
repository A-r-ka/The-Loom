"use client";

import React, { useState } from 'react';
import MainSection from '../components/MainSection';
import '../styles/marketplace.css';
import '../styles/home.css';

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [minEth, setMinEth] = useState('')
  const [maxEth, setMaxEth] = useState('')
  const [cpuChecked, setCpuChecked] = useState(false)
  const [gpuChecked, setGpuChecked] = useState(false)
  const [vram, setVram] = useState('12GB')

  const categories = [
    'All',
    'AI / Machine Learning',
    '3D Rendering',
    'Physics Simulation',
    'Video Processing'
  ]

  const jobs = [
    {
      id: 1,
      title: 'AI Model Training: Object Detection V2',
      description: 'Seeking for a provider to train a YOLOV8 model...',
      tags: 'AI / ML, Pytorch, GPU',
      price: '$100.00',
      posted: 'Posted 2 Hours ago'
    },
    {
      id: 2,
      title: '3D Render: Sci-Fi Cityscape',
      description: 'High Poly architecture futuristic rendering',
      tags: '3D Rendering, Blender, VRAM >= 12GB',
      price: '$275.00',
      posted: 'Posted 5 Hours ago'
    },
    {
      id: 3,
      title: 'Architectural Visualization',
      description: 'Render high-resolution images and a short animation...',
      tags: '3D Rendering | Blender | VRAM 12GB+',
      price: '$100.00',
      posted: 'Posted 2 Hours ago'
    },
    {
      id: 4,
      title: 'Video Processing: Drone Footage Stabilization',
      description: 'Stabilize approximately 2 hours of 4K drone footage shot',
      tags: 'Video Processing | FFmpeg | GPU',
      price: '$27.00',
      posted: 'Posted 2 Hours ago'
    },
    {
      id: 5,
      title: 'Natural Language Processing - Sentiment Analysis',
      description: 'Seeking for a provider to train a YOLOV8 model...',
      tags: 'AI / ML, Pytorch, GPU',
      price: '$450.00',
      posted: 'Posted 2 Hours ago'
    },
    {
      id: 6,
      title: 'AI Model Training: Object Detection V2',
      description: 'Seeking for a provider to train a YOLOV8 model...',
      tags: 'AI / ML, Pytorch, GPU',
      price: '$500.00',
      posted: 'Posted 2 Hours ago'
    }
  ]

  return (
    <div className="marketplace-page">
      {/* Header */}
      <MainSection />

      <div className="marketplace-container">
        <div className="content-wrapper">
          {/* Sidebar com Filtros */}
          <aside className="sidebar">
            <div className="filter-section">
              <h3 className="filter-title">Project Categories</h3>
              <div className="categories-list">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="divider"></div>

            <div className="filter-section">
              <h3 className="filter-title">Filters</h3>
              
              <div className="filter-group">
                <label className="filter-label">Reward</label>
                <div className="eth-inputs">
                  <input
                    type="text"
                    placeholder="Min ETH"
                    className="eth-input"
                    value={minEth}
                    onChange={(e) => setMinEth(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Max ETH"
                    className="eth-input"
                    value={maxEth}
                    onChange={(e) => setMaxEth(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={cpuChecked}
                      onChange={(e) => setCpuChecked(e.target.checked)}
                    />
                    <span>CPU</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={gpuChecked}
                      onChange={(e) => setGpuChecked(e.target.checked)}
                    />
                    <span>GPU</span>
                  </label>
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  VRAM: <span className="vram-value">{vram}</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {/* Search Bar */}
            <div className="search-section">
              <div className="search-bar">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search keywords"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Jobs Title */}
            <h2 className="jobs-title">Available Jobs</h2>

            {/* Jobs List */}
            <div className="jobs-list">
              {jobs.map((job) => (
                <article key={job.id} className="job-card">
                  <div className="job-content">
                    <div className="job-header">
                      <h3 className="job-title">{job.title}</h3>
                      <div className="job-price">{job.price}</div>
                    </div>
                    
                    <p className="job-tags">Tags: {job.tags}</p>
                    <p className="job-description">{job.description}</p>
                    
                    <div className="job-footer">
                      <span className="job-posted">{job.posted}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
