import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Clock, AlertCircle, Sparkles, Key } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import HeroSearch from './components/HeroSearch.jsx';
import PlanningDashboard from './components/PlanningDashboard.jsx';
import ExportModal from './components/ExportModal.jsx';
import ShareModal from './components/ShareModal.jsx';
import LoginPage from './components/LoginPage.jsx';
import ApiKeyModal from './components/ApiKeyModal.jsx';
import { getCurrentUser, logoutUser, savePlanToUserHistory } from './utils/localAuth.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiStatus, setApiStatus] = useState('active'); // 'active' | 'server_issue' | 'offline_fallback'
  const [apiAlertMessage, setApiAlertMessage] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefiningBudget, setIsRefiningBudget] = useState(false);
  const [isRegeneratingIdeas, setIsRegeneratingIdeas] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Check health and load plan on mount
  useEffect(() => {
    checkApiHealth();

    const params = new URLSearchParams(window.location.search);
    const planId = params.get('planId');
    if (planId) {
      loadPlanById(planId);
    } else if (!currentUser) {
      // Check for temporary session plan (cleared when browser closes)
      try {
        const temp = sessionStorage.getItem('auraplan_temp_plan');
        if (temp) {
          setCurrentPlan(JSON.parse(temp));
        }
      } catch (e) {
        console.warn('Error reading temporary session plan:', e);
      }
    }
  }, []);

  const checkApiHealth = async () => {
    try {
      const res = await fetch('/api/api-status');
      const data = await res.json();
      if (data.success) {
        setApiStatus(data.status || (data.configured ? 'active' : 'offline_fallback'));
        if (data.status === 'server_issue' && data.lastError) {
          setApiAlertMessage(`Gemini server issue: ${data.lastError}. Using offline AI engine.`);
        }
      }
    } catch (e) {
      console.warn('API health check error:', e);
      setApiStatus('offline_fallback');
    }
  };

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Persist plan: permanently in localStorage if logged in, temporarily in sessionStorage if guest
  const persistPlan = (plan) => {
    if (currentUser) {
      savePlanToUserHistory(currentUser.id, plan);
      try {
        sessionStorage.removeItem('auraplan_temp_plan');
      } catch (e) {}
    } else {
      try {
        sessionStorage.setItem('auraplan_temp_plan', JSON.stringify(plan));
      } catch (e) {
        console.warn('Session storage write error:', e);
      }
    }
  };

  const loadPlanById = async (id) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/plan/${id}`);
      const data = await res.json();
      if (data.success && data.plan) {
        setCurrentPlan(data.plan);
        persistPlan(data.plan);
        showToast('Plan loaded from shareable link!', 'success');
      } else {
        showToast('Plan not found. Creating a new plan...', 'error');
      }
    } catch (err) {
      console.error('Failed to load plan:', err);
      showToast('Error retrieving shared plan.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate full plan via backend Gemini endpoint
  const handleGeneratePlan = async (metadata) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata)
      });
      const data = await res.json();

      if (data.success && data.plan) {
        setCurrentPlan(data.plan);
        persistPlan(data.plan);

        if (data.isFallback) {
          setApiStatus('server_issue');
          setApiAlertMessage(data.fallbackReason || 'Gemini server is experiencing high demand. Plan generated using offline AI engine.');
          showToast('Plan generated using resilient offline AI engine.', 'info');
        } else {
          setApiStatus('active');
          setApiAlertMessage(null);
          showToast('Event plan generated with Gemini AI!', 'success');
        }

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Update URL query string
        const newUrl = `${window.location.pathname}?planId=${data.plan.id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      } else {
        showToast(data.message || 'Error generating plan.', 'error');
      }
    } catch (err) {
      console.error('Plan generation failed:', err);
      setApiStatus('server_issue');
      setApiAlertMessage('Connection to Gemini server failed. You can update your API key anytime.');
      showToast('Server connection failed. Using fallback plan.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Refine budget with natural language instruction
  const handleRefineBudget = async (instruction) => {
    if (!currentPlan) return;
    try {
      setIsRefiningBudget(true);
      const res = await fetch('/api/refine-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentBudget: currentPlan.budget,
          instruction,
          totalBudget: currentPlan.metadata?.totalBudget,
          planId: currentPlan.id
        })
      });
      const data = await res.json();
      if (data.success && data.budget) {
        setCurrentPlan((prev) => {
          const updated = { ...prev, budget: data.budget };
          persistPlan(updated);
          return updated;
        });
        showToast('Budget refined according to instruction!', 'success');
        return data.budget;
      } else {
        const errMsg = data.message || 'Could not refine budget.';
        showToast(errMsg, 'error');
        throw new Error(errMsg);
      }
    } catch (err) {
      console.error('Budget refinement error:', err);
      showToast('Error refining budget.', 'error');
      throw err;
    } finally {
      setIsRefiningBudget(false);
    }
  };

  // Regenerate 6 fresh surprise-me ideas
  const handleRegenerateIdeas = async () => {
    if (!currentPlan) return;
    try {
      setIsRegeneratingIdeas(true);
      const res = await fetch('/api/regenerate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: currentPlan.metadata,
          planId: currentPlan.id
        })
      });
      const data = await res.json();
      if (data.success && data.ideas) {
        setCurrentPlan((prev) => {
          const updated = { ...prev, ideas: data.ideas };
          persistPlan(updated);
          return updated;
        });
        showToast('Generated 6 fresh creative ideas!', 'success');
      } else {
        showToast('Failed to regenerate ideas.', 'error');
      }
    } catch (err) {
      console.error('Regenerate ideas error:', err);
      showToast('Error fetching fresh ideas.', 'error');
    } finally {
      setIsRegeneratingIdeas(false);
    }
  };

  // Sync plan modifications to backend store
  const handleUpdatePlan = async (updatedPlan) => {
    setCurrentPlan(updatedPlan);
    persistPlan(updatedPlan);
    try {
      await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlan)
      });
    } catch (err) {
      console.warn('Auto-save plan failed:', err);
    }
  };

  const handleNewPlan = () => {
    setCurrentPlan(null);
    try {
      sessionStorage.removeItem('auraplan_temp_plan');
    } catch (e) {}
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    if (currentPlan) {
      savePlanToUserHistory(user.id, currentPlan);
      try {
        sessionStorage.removeItem('auraplan_temp_plan');
      } catch (e) {}
      showToast(`Welcome, ${user.name}! Temporary plan saved permanently to your device.`, 'success');
    } else {
      showToast(`Welcome back, ${user.name}!`, 'success');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    // Move active plan to temporary session storage
    if (currentPlan) {
      try {
        sessionStorage.setItem('auraplan_temp_plan', JSON.stringify(currentPlan));
      } catch (e) {}
    }
    showToast('Signed out. Active plan is now in temporary session mode.', 'info');
  };

  const handleKeyUpdated = () => {
    setApiStatus('active');
    setApiAlertMessage(null);
    showToast('Gemini API key updated and active!', 'success');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#090a0f' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 110 }}>
          <div style={{
            padding: '0.75rem 1.25rem', borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            fontSize: '0.82rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: toastMessage.type === 'success' ? 'rgba(6,78,59,0.95)'
              : toastMessage.type === 'error' ? 'rgba(76,5,25,0.95)'
              : 'rgba(59,7,100,0.95)',
            color: toastMessage.type === 'success' ? '#6ee7b7'
              : toastMessage.type === 'error' ? '#fda4af' : '#d8b4fe',
            border: `1px solid ${toastMessage.type === 'success' ? 'rgba(16,185,129,0.4)' : toastMessage.type === 'error' ? 'rgba(244,63,94,0.4)' : 'rgba(147,51,234,0.4)'}`
          }}>
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        currentPlan={currentPlan}
        currentUser={currentUser}
        onNewPlan={handleNewPlan}
        onExport={() => setShowExportModal(true)}
        onShare={() => setShowShareModal(true)}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onOpenApiKeyModal={() => setShowApiKeyModal(true)}
        apiStatus={apiStatus}
      />

      {/* Temporary Guest Mode Notice Banner */}
      {currentPlan && !currentUser && (
        <div className="no-print" style={{
          maxWidth: '80rem', margin: '0.75rem auto 0', padding: '0.55rem 1.25rem',
          borderRadius: '12px', background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.22)', display: 'flex',
          flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem', fontSize: '0.75rem', color: '#fcd34d', width: 'calc(100% - 2rem)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock style={{ width: 15, height: 15, flexShrink: 0, color: '#fbbf24' }} />
            <span>
              <strong>Temporary Guest Session:</strong> You can edit and export freely without signing in. This plan will clear when you close this window.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowLoginModal(true)}
            style={{
              background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: '8px',
              padding: '0.3rem 0.8rem', fontSize: '0.725rem', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 2px 10px rgba(147, 51, 234, 0.35)'
            }}
          >
            Sign In to Save Permanently
          </button>
        </div>
      )}

      {/* Gemini API Alert Banner (Server Issue / High Demand) */}
      {apiAlertMessage && (
        <div className="no-print" style={{
          maxWidth: '80rem', margin: '0.75rem auto 0', padding: '0.55rem 1.25rem',
          borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex',
          flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem', fontSize: '0.75rem', color: '#fca5a5', width: 'calc(100% - 2rem)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle style={{ width: 15, height: 15, flexShrink: 0, color: '#f87171' }} />
            <span>
              <strong>Gemini AI Notice:</strong> {apiAlertMessage}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px',
                padding: '0.3rem 0.75rem', fontSize: '0.725rem', fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Add / Update API Key
            </button>
            <button
              type="button"
              onClick={() => setApiAlertMessage(null)}
              style={{
                background: 'transparent', color: '#94a3b8', border: 'none',
                cursor: 'pointer', fontSize: '0.75rem'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className={showExportModal ? 'no-print' : ''} style={{ flex: 1, paddingBottom: '4rem' }}>
        {!currentPlan ? (
          <HeroSearch
            onGeneratePlan={handleGeneratePlan}
            isLoading={isLoading}
          />
        ) : (
          <PlanningDashboard
            plan={currentPlan}
            onUpdatePlan={handleUpdatePlan}
            onRefineBudget={handleRefineBudget}
            isRefiningBudget={isRefiningBudget}
            onRegenerateIdeas={handleRegenerateIdeas}
            isRegeneratingIdeas={isRegeneratingIdeas}
            onEditMetadata={handleNewPlan}
            onOpenExport={() => setShowExportModal(true)}
            onOpenShare={() => setShowShareModal(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem 1rem', background: 'rgba(5,6,12,0.8)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#475569' }}>
            AuraPlan AI &copy; 2026 &bull; Crafted with Google Gemini API &amp; Antigravity
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#334155' }}>
            <span>Official @google/genai SDK</span>
            <span>&bull;</span>
            <span>Temporary Guest &amp; On-Device Storage</span>
            <span>&bull;</span>
            <span>Structured Function Calling</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showLoginModal && (
        <LoginPage
          isModal={true}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {showApiKeyModal && (
        <ApiKeyModal
          onClose={() => setShowApiKeyModal(false)}
          onKeyUpdated={handleKeyUpdated}
        />
      )}

      {showExportModal && (
        <ExportModal
          plan={currentPlan}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showShareModal && (
        <ShareModal
          planId={currentPlan?.id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
