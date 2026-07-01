import AppLayout from '../../components/AppLayout';
import { useState } from 'react';

const steps = ['Personal Profile', 'Business Information', 'Financial Goals', 'Risk Assessment', 'Review & Confirm'];

export default function OnboardingAssessment() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-headline-lg font-bold text-accent">FinBridge</h1>
          <p className="text-body-md text-text-muted mt-2">Let's set up your personalized financial advisory experience</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-12">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${i < currentStep ? 'bg-success border-success text-white' :
                    i === currentStep ? 'bg-secondary border-secondary text-accent' :
                      'bg-surface border-border text-text-muted'
                  }`}>
                  {i < currentStep ? <span className="material-symbols-outlined text-base">check</span> : <span className="text-sm">{i + 1}</span>}
                </div>
                <p className={`text-xs font-bold mt-2 text-center max-w-[72px] leading-tight hidden md:block ${i === currentStep ? 'text-accent' : 'text-text-muted'}`}>{step}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? 'bg-success' : 'bg-outline-variant'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="card p-10 fade-in">
          <h2 className="text-headline-md font-bold text-accent mb-2">{steps[currentStep]}</h2>
          <p className="text-body-md text-text-muted mb-8">Step {currentStep + 1} of {steps.length}</p>

          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-label-lg text-text">First Name</label>
                  <input className="form-input" placeholder="John" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="text-label-lg text-text">Last Name</label>
                  <input className="form-input" placeholder="Doe" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="text-label-lg text-text">Date of Birth</label>
                  <input className="form-input" type="date" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <label className="text-label-lg text-text">Nationality</label>
                  <select className="form-input"><option>United States</option><option>United Kingdom</option><option>Canada</option></select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-label-lg text-text">Primary Phone Number</label>
                  <input className="form-input" placeholder="+1 (555) 000-0000" type="tel" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-label-lg text-text">Company Name</label>
                  <input className="form-input" placeholder="Your Company LLC" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="text-label-lg text-text">Industry</label>
                  <select className="form-input"><option>Technology</option><option>Finance</option><option>Healthcare</option><option>Manufacturing</option></select>
                </div>
                <div className="space-y-2">
                  <label className="text-label-lg text-text">Company Size</label>
                  <select className="form-input"><option>1-10 employees</option><option>11-50</option><option>51-200</option><option>201-500</option><option>500+</option></select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-label-lg text-text">Annual Revenue</label>
                  <select className="form-input"><option>Under $500K</option><option>$500K – $2M</option><option>$2M – $10M</option><option>$10M – $50M</option><option>$50M+</option></select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <p className="text-body-md text-text-muted">Select all financial goals that apply to your situation:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: 'savings', label: 'Wealth Accumulation', desc: 'Build long-term wealth through investment' },
                  { icon: 'account_balance', label: 'Business Expansion', desc: 'Secure financing for growth initiatives' },
                  { icon: 'receipt_long', label: 'Tax Optimization', desc: 'Minimize tax liability legally' },
                  { icon: 'shield', label: 'Risk Protection', desc: 'Insurance and hedging strategies' },
                  { icon: 'family_restroom', label: 'Estate Planning', desc: 'Wealth transfer to next generation' },
                  { icon: 'rocket_launch', label: 'Startup Funding', desc: 'Raise capital for new ventures' },
                ].map((goal, i) => (
                  <label key={i} className="flex items-start gap-4 p-4 border border-border rounded-xl hover:border-secondary cursor-pointer transition-colors">
                    <input type="checkbox" className="mt-1 w-4 h-4 text-secondary" />
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <span className="material-symbols-outlined text-accent text-base">{goal.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-text">{goal.label}</p>
                        <p className="text-body-sm text-text-muted">{goal.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <p className="text-body-md text-text-muted">How would you describe your risk tolerance?</p>
              <div className="space-y-3">
                {[
                  { level: 'Conservative', desc: 'Preserve capital, minimal volatility, steady returns', icon: 'shield' },
                  { level: 'Moderate', desc: 'Balanced growth and protection, some market exposure', icon: 'balance' },
                  { level: 'Aggressive', desc: 'Maximum growth potential, high market exposure', icon: 'trending_up' },
                ].map((risk, i) => (
                  <label key={i} className="flex items-center gap-4 p-5 border border-border rounded-xl cursor-pointer hover:border-secondary transition-colors">
                    <input type="radio" name="risk" className="w-4 h-4 text-secondary" />
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <span className="material-symbols-outlined text-accent">{risk.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-text">{risk.level}</p>
                      <p className="text-body-sm text-text-muted">{risk.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-6 bg-success/5 border border-success/20 rounded-xl text-center">
                <span className="material-symbols-outlined text-success text-4xl">check_circle</span>
                <h3 className="text-headline-md font-bold text-accent mt-3">You're All Set!</h3>
                <p className="text-body-md text-text-muted mt-2">Your onboarding profile is complete. An advisor will review and reach out within 24 hours.</p>
              </div>
              {[
                { label: 'Name', value: 'John Doe' },
                { label: 'Company', value: 'Your Company LLC' },
                { label: 'Industry', value: 'Technology' },
                { label: 'Goals', value: 'Wealth Accumulation, Tax Optimization' },
                { label: 'Risk Profile', value: 'Moderate' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-3 border-b border-border/50">
                  <span className="text-text-muted text-label-lg">{item.label}</span>
                  <span className="font-bold text-accent">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            className={`btn-ghost flex items-center gap-2 ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <span className="material-symbols-outlined">arrow_back</span>Previous
          </button>
          {currentStep < steps.length - 1 ? (
            <button onClick={() => setCurrentStep(currentStep + 1)} className="btn-primary flex items-center gap-2">
              Continue<span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : (
            <a href="/dashboard">
              <button className="btn-primary flex items-center gap-2">
                Go to Dashboard<span className="material-symbols-outlined">dashboard</span>
              </button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
