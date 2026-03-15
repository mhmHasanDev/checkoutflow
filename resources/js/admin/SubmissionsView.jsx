
import React, { useEffect, useState } from 'react';
import { Page, Card, DataTable, Badge, Button, Spinner, Banner, Modal } from '@shopify/polaris';
import axios from 'axios';

export default function SubmissionsView({ form, onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get('/admin/forms/' + form.id + '/submissions')
      .then(res => { setSubmissions(res.data.data || []); setLoading(false); })
      .catch(() => { setError('Failed to load submissions'); setLoading(false); });
  }, [form.id]);

  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}><Spinner /></div>;
  if (error) return <Banner tone="critical">{error}</Banner>;

  const rows = submissions.map(s => [
    '#' + s.id,
    s.customer_id || 'Guest',
    s.order_id || '-',
    new Date(s.created_at).toLocaleDateString(),
    <Button size="slim" onClick={() => setSelected(s)}>View</Button>
  ]);

  return (
    <Page title={'Submissions: ' + form.name} backAction={{ content: 'Forms', onAction: onBack }}>
      {submissions.length === 0 ? (
        <Card>
          <div style={{padding:'3rem',textAlign:'center',color:'#8c9196'}}>
            <p style={{fontSize:'16px',marginBottom:'8px'}}>No submissions yet</p>
            <p style={{fontSize:'13px'}}>Submissions will appear here once customers fill out this form.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <DataTable
            columnContentTypes={['text','text','text','text','text']}
            headings={['ID','Customer','Order','Date','Action']}
            rows={rows}
          />
        </Card>
      )}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={'Submission #' + selected.id}
          primaryAction={{ content: 'Close', onAction: () => setSelected(null) }}>
          <Modal.Section>
            <div style={{display:'grid',gap:'8px'}}>
              {Object.entries(selected.data || {}).map(([key, value]) => (
                <div key={key} style={{display:'flex',gap:'12px',padding:'10px 12px',background:'#f6f6f7',borderRadius:'6px'}}>
                  <span style={{fontWeight:500,minWidth:'160px',color:'#6d7175',textTransform:'capitalize'}}>{key.replace(/_/g,' ')}:</span>
                  <span style={{color:'#202223'}}>{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                </div>
              ))}
            </div>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}
