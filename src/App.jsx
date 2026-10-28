import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar.jsx';
import HeroSearch from './components/HeroSearch.jsx';
import PlanningDashboard from './components/PlanningDashboard.jsx';
import ExportModal from './components/ExportModal.jsx';
import ShareModal from './components/ShareModal.jsx';

export default function App() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefiningBudget, setIsRefiningBudget] = useState(false);
  const [isRegeneratingIdeas, setIsRegeneratingIdeas] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load plan from URL ?planId=... on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planId = params.get('planId');
    if (planId) {
      loadPlanById(planId);
    }
  }, []);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadPlanById = async (id) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/plan/${id}`);
      const data = await res.json();
      if (data.success && data.plan) {
        setCurrentPlan(data.plan);
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
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast('Event plan generated successfully!', 'success');
        // Update URL query string
        const newUrl = `${window.location.pathname}?planId=${data.plan.id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      } else {
        showToast(data.message || 'Error generating plan.', 'error');
      }
    } catch (err) {
      console.error('Plan generation failed:', err);
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
        setCurrentPlan((prev) => ({ ...prev, budget: data.budget }));
        showToast('Budget refined according to instruction!', 'success');
      } else {
        showToast('Could not refine budget.', 'error');
      }
    } catch (err) {
      console.error('Budget refinement error:', err);
      showToast('Error refining budget.', 'error');
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
        setCurrentPlan((prev) => ({ ...prev, ideas: data.ideas }));
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
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#090a0f' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50 }}>
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
        onNewPlan={handleNewPlan}
        onExport={() => setShowExportModal(true)}
        onShare={() => setShowShareModal(true)}
      />

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
            <span>Structured Function Calling</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
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
