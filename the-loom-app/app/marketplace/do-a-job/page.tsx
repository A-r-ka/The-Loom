"use client";

import React from 'react';
import MainSection from '../../components/MainSection';
import '../../styles/do-a-job.css';
import '../../styles/home.css';

export default function DoAJobPage() {
  return (
    <div className="do-a-job-page">
      <MainSection />
      
      <div className="do-a-job-container">
        {/* Back Button */}
        <a href="/marketplace" className="back-link">
          <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Explore
        </a>

        {/* Project Header */}
        <div className="project-header">
          <div className="project-title-section">
            <h1 className="project-main-title">Project Title</h1>
            <span className="status-badge">Active</span>
          </div>
          
          <div className="project-meta">
            <div className="meta-item">
              <span className="meta-label">Posted by:</span>
              <span className="meta-value">User name</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Posted:</span>
              <span className="meta-value">Tuesday November 11, 2024</span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="project-section">
          <h2 className="section-title">Description</h2>
          <div className="section-content">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc hendrerit orci tellus, quis commodo erat sed molestie vestibulum. Suspendisse auctor tristique nibh at porta. Fusce sit vitam vitae arcu egestas pellentesque. In tellus dolor, ultricies quis purus ex lobortis sit amet. Curabitur lorem felis, blandit nec ornare vitae hendrerit. Donec sollicitudin sit amet consequat, vel dignissim ipsum venenatis. Quisque venenatis in ligula id tristique. Donec ac lectus lacus, natus gravida a efficitur a sodales lobortis. Donec ex blandit non non. Pellentesque lacus tempor, consectetur gravida turpis in ligula et nisl cursus. Donec vulputate, libero vitae adipiscing dignissim, magna magna posuere.
            </p>
          </div>
        </div>

        {/* Budget Section */}
        <div className="project-section">
          <h2 className="section-title">Budget</h2>
          <div className="budget-section">
            <div className="budget-amount">$3000.00</div>
            <div className="budget-meta">
              <div className="budget-meta-item">
                <span className="budget-meta-label">Estimated Time:</span>
                <span className="budget-meta-value">6 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="project-section">
          <h2 className="section-title">Requirements</h2>
          <ul className="requirements-list">
            <li>Minimum 24GB VRAM GPU (e.g., RTX 3090, A100)</li>
            <li>500GB SSD Required</li>
            <li>Memory: 64GB RAM</li>
            <li>Processor: Intel Core i7-4770 / AMD FX-9590</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-primary">Accept Job</button>
          <button className="btn-secondary">Save for Later</button>
        </div>
      </div>
    </div>
  );
}