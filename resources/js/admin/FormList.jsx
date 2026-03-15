import React, { useEffect, useState } from 'react';
import { Page, Card, DataTable, Button, Badge, EmptyState, Spinner, Banner } from '@shopify/polaris';
import axios from 'axios';

export default function FormList({ onCreateNew, onEdit, onViewSubmissions, onAppearance }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchForms(); }, []);

  const fetchForms = () => {
    axios.get('/admin/forms')
      .then(res => { setForms(res.data.forms); setLoading(false); })
      .catch(() => { setError('Failed to load forms'); setLoading(false); });
  };

  const toggleForm = id => axios.post('/admin/forms/' + id + '/toggle').then(fetchForms);
  const deleteForm = id => { if (confirm('Delete this form?')) axios.delete('/admin/forms/' + id).then(fetchForms); };
  const duplicateForm = id => axios.post('/admin/forms/' + id + '/duplicate').then(fetchForms);

  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}><Spinner /></div>;
  if (error) return <Banner tone="critical">{error}</Banner>;

  if (forms.length === 0) return (
    <Page title="Forms" primaryAction={{content:'Create Form',onAction:onCreateNew}}>
      <Card>
        <EmptyState heading="No forms yet" action={{content:'Create your first form',onAction:onCreateNew}}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
          <p>Create a form to collect customer info before checkout.</p>
        </EmptyState>
      </Card>
    </Page>
  );

  const rows = forms.map(form => [
    form.name,
    <Badge tone={form.is_active ? 'success' : 'info'}>{form.is_active ? 'Active' : 'Inactive'}</Badge>,
    form.fields?.length || 0,
    new Date(form.created_at).toLocaleDateString(),
    <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
      <Button size="slim" onClick={() => onEdit(form)}>Edit</Button>
      <Button size="slim" onClick={() => onAppearance(form)}>Appearance</Button>
      <Button size="slim" onClick={() => onViewSubmissions(form)}>Submissions</Button>
      <Button size="slim" onClick={() => toggleForm(form.id)}>{form.is_active ? 'Disable' : 'Enable'}</Button>
      <Button size="slim" onClick={() => duplicateForm(form.id)}>Duplicate</Button>
      <Button size="slim" tone="critical" onClick={() => deleteForm(form.id)}>Delete</Button>
    </div>
  ]);

  return (
    <Page title="Forms" primaryAction={{content:'Create Form',onAction:onCreateNew}}>
      <Card>
        <DataTable columnContentTypes={['text','text','numeric','text','text']}
          headings={['Name','Status','Fields','Created','Actions']} rows={rows} />
      </Card>
    </Page>
  );
}