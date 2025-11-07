"use client";

import React, { useState } from 'react';
import MainSection from '../../components/MainSection';
import '../../styles/do-a-job.css';
import '../../styles/home.css';
import { useSearchParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function DoAJobPage() {
  const search = useSearchParams();
  const job = search.get('job');
  const initialJobData = job ? JSON.parse(job as string) : null;
  const { address } = useAccount();

  // Use local state to track the current job data
  const [currentJobData, setCurrentJobData] = useState(initialJobData);

  // Modal and acceptance state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  // Check if the current user is the job creator
  const isMyJob = (currentJobData && address && 
    currentJobData.wallet_address === address) || !address;

  // Get actual project data (either from currentJobData.raw or currentJobData itself)
  const projectData = currentJobData?.raw || currentJobData;

  // Check if job is already accepted by current user
  const isAcceptedByMe = projectData?.wallet_address_secondary?.toLowerCase() === address?.toLowerCase();
  const isJobAccepted = projectData?.wallet_address_secondary && !isAcceptedByMe;

  // Build requirements list from database fields
  const getRequirements = () => {
    const requirements = [];

    // Hardware requirements
    if (projectData?.cpu === 1) {
      requirements.push('CPU Processing Required');
    }
    if (projectData?.gpu === 1) {
      requirements.push('GPU Processing Required');
    }
    if (projectData?.ram) {
      requirements.push(`Minimum ${projectData.ram}GB RAM`);
    }
    if (projectData?.vram) {
      requirements.push(`Minimum ${projectData.vram}GB VRAM`);
    }

    // Software requirements
    const softwareLabels: Record<string, string> = {
      vray: 'V-Ray (CPU Mode)',
      openfoam: 'OpenFOAM',
      bullet: 'Bullet Physics',
      python: 'Python',
      compileProject: 'Compile Project',
      blender: 'Blender',
      octane: 'Octane Render',
      autoDesk3DMax: 'Autodesk 3ds Max',
      zbrush: 'ZBrush'
    };

    Object.entries(softwareLabels).forEach(([key, label]) => {
      if (projectData?.[key] === 1) {
        requirements.push(label);
      }
    });

    return requirements.length > 0 ? requirements : ['No specific requirements listed'];
  };

  const requirements = getRequirements();

  const handleAcceptJob = async () => {
    if (!address) {
      alert('Por favor, conecte sua carteira primeiro');
      return;
    }

    setAccepting(true);
    setAcceptError(null);

    try {
      const res = await fetch(`/api/projects/${projectData.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet_address: address }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao aceitar o job');
      }

      // Update local state with the updated project
      const updatedJobData = {
        ...currentJobData,
        wallet_address_secondary: address,
        status: 'WORKING',
        raw: {
          ...projectData,
          wallet_address_secondary: address,
          status: 'WORKING'
        }
      };
      
      setCurrentJobData(updatedJobData);
      setShowConfirmModal(false);
    } catch (err: any) {
      console.error('Error accepting job:', err);
      setAcceptError(err.message || 'Erro ao aceitar o job');
    } finally {
      setAccepting(false);
    }
  };

  const handleCompleteJob = () => {
    // TODO: Implement complete job logic
    alert('Funcionalidade de conclusão será implementada');
  };

  return (
    <div className="do-a-job-page">
      <MainSection />
      
      <div className="do-a-job-container">
        {/* Back Button */}
        <Link href="/marketplace" className="back-link">
          <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Explore
        </Link>

        {/* Project Header */}
        <div className="project-header">
          <div className="project-title-section">
            <h1 className="project-main-title">{currentJobData ? currentJobData.title : 'Project Title'}</h1>
            <span className="status-badge">Active</span>
          </div>
          
          <div className="project-meta">
            <div className="meta-item">
              <span className="meta-label">Posted by:</span>
              <span className="meta-value">
                {projectData?.wallet_address 
                  ? `${projectData.wallet_address.slice(0, 6)}...${projectData.wallet_address.slice(-4)}`
                  : 'Unknown'}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Posted:</span>
              <span className="meta-value">
                {projectData?.created_at 
                  ? new Date(projectData.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Recently'}
              </span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="project-section">
          <h2 className="section-title">Description</h2>
          <div className="section-content">
            <p>
              {currentJobData ? currentJobData.description : 'Lorem ipsum dolor sit amet...'}
            </p>
          </div>
        </div>

        {/* Budget Section */}
        <div className="project-section">
          <h2 className="section-title">Budget</h2>
          <div className="budget-section">
            <div className="budget-amount">{currentJobData ? currentJobData.price : '3000.00 ETH'}</div>
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
            {requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>

        {/* Project Assets */}
        {(projectData?.cloud_link || projectData?.script_path) && (
          <div className="project-section">
            <h2 className="section-title">Project Assets</h2>
            <div className="section-content">
              {projectData?.cloud_link && (
                <div className="asset-link-item">
                  <span className="asset-label">Assets Link:</span>
                  <a 
                    href={projectData.cloud_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="asset-link"
                  >
                    {projectData.cloud_link}
                  </a>
                </div>
              )}
              {projectData?.script_path && (
                <div className="asset-link-item">
                  <span className="asset-label">Script File:</span>
                  <a 
                    href={projectData.script_path} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="asset-link"
                  >
                    Download Script
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          {!isMyJob && !isJobAccepted && !isAcceptedByMe ? (
            <button className="btn-primary" onClick={() => setShowConfirmModal(true)}>
              Accept Job
            </button>
          ) : isAcceptedByMe ? (
            <button className="btn-primary" onClick={handleCompleteJob}>
              Complete Job
            </button>
          ) : isJobAccepted ? (
            <div className="job-taken-message">
              This job has already been accepted by another user
            </div>
          ) : null}
          <button className="btn-secondary">Save for Later</button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="confirm-modal-title">Confirm & Commit</h2>
            
            <p className="confirm-modal-text">
              By clicking "Accept," you are committing your hardware to this task. The Loom 
              Client on your desktop must be running and connected. Failure to process the 
              task may affect your provider rating and eligibility for rewards.
            </p>

            {acceptError && (
              <div className="confirm-modal-error">
                {acceptError}
              </div>
            )}

            <div className="confirm-modal-actions">
              <button 
                className="btn-modal-cancel"
                onClick={() => setShowConfirmModal(false)}
                disabled={accepting}
              >
                Cancel
              </button>
              <button 
                className="btn-modal-accept"
                onClick={handleAcceptJob}
                disabled={accepting}
              >
                {accepting ? 'Processing...' : 'Accept & Commit Hardware'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}