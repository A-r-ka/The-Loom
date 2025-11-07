"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import MainSection from '../components/MainSection';
import '../styles/my-jobs.css';
import '../styles/home.css';

export default function MyJobsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Array de projetos (6 cards conforme a imagem)
  const projects = [
    { id: 1, title: 'Project Title', image: '' },
    { id: 2, title: 'Project Title', image: '' },
    { id: 3, title: 'Project Title', image: '' },
    { id: 4, title: 'Project Title', image: '' },
    { id: 5, title: 'Project Title', image: '' },
    { id: 6, title: 'Project Title', image: '' },
  ];

  return (
    <div className="my-jobs-page">
      <MainSection />

      {/* Menu Toggle para Mobile */}
      <button 
        className="menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Overlay para Mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="my-jobs-container">
        {/* Sidebar */}
        <aside className={`my-jobs-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Avatar */}
          <div className="sidebar-avatar"></div>

          {/* Navegação */}
          <nav className="sidebar-nav">
            <a href="/my-jobs" className="sidebar-nav-item active">
              My Projects
            </a>
            <a href="/hardware" className="sidebar-nav-item">
              Hardware
            </a>
            <a href="/notifications" className="sidebar-nav-item">
              Notifications
            </a>
            <a href="/settings" className="sidebar-nav-item">
              Settings
            </a>
          </nav>

          {/* Log out */}
          <div className="sidebar-logout">
            <button className="logout-btn">Log out</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="my-jobs-main">
          <div className="projects-header">
            <h1 className="projects-title">Projects</h1>

            <div className="projects-controls">
              {/* Tabs */}
              <div className="projects-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All projects
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                  onClick={() => setActiveTab('active')}
                >
                  Active
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'complete' ? 'active' : ''}`}
                  onClick={() => setActiveTab('complete')}
                >
                  Complete
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pending')}
                >
                  Pending
                </button>
              </div>

              {/* Create Job Button */}
              <Link href="/my-jobs/create-a-job" className="create-job-btn">
                Create Job
              </Link>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-image"></div>
                <div className="project-info">
                  <h3 className="project-card-title">{project.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}