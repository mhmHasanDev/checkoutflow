import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider, Frame, Navigation } from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';
import Dashboard from './admin/Dashboard';
import FormList from './admin/FormList';
import FormBuilder from './admin/FormBuilder';
import SubmissionsView from './admin/SubmissionsView';
import AppearanceSettings from './admin/AppearanceSettings';
import PlanPage from './admin/PlanPage';

function App() {
  const [page, setPage] = useState('dashboard');
  const [ctx, setCtx] = useState(null);

  const go = (p, data = null) => { setPage(p); setCtx(data); };

  const nav = (
    <Navigation location="/">
      <Navigation.Section items={[
        { label: 'Dashboard', onClick: () => go('dashboard'), selected: page === 'dashboard' },
        { label: 'Forms', onClick: () => go('forms'), selected: ['forms','builder','submissions','appearance'].includes(page) },
        { label: 'Plans', onClick: () => go('plans'), selected: page === 'plans' },
      ]} />
    </Navigation>
  );

  return (
    <AppProvider i18n={en}>
      <Frame navigation={nav}>
        {page === 'dashboard'   && <Dashboard onUpgrade={() => go('plans')} />}
        {page === 'forms'       && <FormList onCreateNew={() => go('builder', {})} onEdit={f => go('builder', f)} onViewSubmissions={f => go('submissions', f)} onAppearance={f => go('appearance', f)} />}
        {page === 'builder'     && <FormBuilder form={ctx} onSave={() => go('forms')} onCancel={() => go('forms')} />}
        {page === 'submissions' && <SubmissionsView form={ctx} onBack={() => go('forms')} />}
        {page === 'appearance'  && <AppearanceSettings form={ctx} onSave={() => go('forms')} onCancel={() => go('forms')} />}
        {page === 'plans'       && <PlanPage onBack={() => go('dashboard')} />}
      </Frame>
    </AppProvider>
  );
}

const container = document.getElementById('app');
if (container) createRoot(container).render(<App />);