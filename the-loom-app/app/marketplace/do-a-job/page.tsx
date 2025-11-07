"use client";

import React from 'react';
import MainSection from '../../components/MainSection';
import '../../styles/do-a-job.css';
import '../../styles/home.css';
import { useSearchParams } from 'next/navigation';

export default function DoAJobPage() {
  const router = useSearchParams();
  const job = router.get('job');
  const jobData = job ? JSON.parse(job as string) : null;

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
            <h1 className="project-main-title">{jobData ? jobData.title : 'Project Title'}</h1>
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
              {jobData ? jobData.description : 'Lorem ipsum dolor sit amet...'}
            </p>
          </div>
        </div>

        {/* Budget Section */}
        <div className="project-section">
          <h2 className="section-title">Budget</h2>
          <div className="budget-section">
            <div className="budget-amount">{jobData ? jobData.price : '$3000.00'}</div>
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