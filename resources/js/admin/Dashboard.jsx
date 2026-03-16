import React, { useEffect, useState } from 'react';
import { Page, Card, Button, Banner, Badge, Spinner } from '@shopify/polaris';
import axios from 'axios';

export default function Dashboard({ onUpgrade }) {
  const [stats, setStats] = useState(null);
  const [scriptStatus, setScriptStatus] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    axios.get('/admin/dashboard').then(r => setStats(r.data)).catch(() => setStats({}));
    axios.get('/admin/scripttag/status').then(r => setScriptStatus(r.data)).catch(() => setScriptStatus({ installed: false }));
  }, []);

  const installScript = async () => {
    setInstalling(true);
    setMessage(null);
    try {
      const res = await axios.post('/admin/scripttag/install');
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Storefront modal installed on your store!' });
        setScriptStatus({ installed: true });
      }
    } catch (e) {
      setMessage({ type: 'critical', text: 'Installation failed. Please try again.' });
    }
    setInstalling(false);
  };

  const removeScript = async () => {
    if (!window.confirm('Remove the modal from your store?')) return;
    try {
      await axios.delete('/admin/scripttag/remove');
      setMessage({ type: 'info', text: 'Modal removed from store.' });
      setScriptStatus({ installed: false });
    } catch {
      setMessage({ type: 'critical', text: 'Removal failed.' });
    }
  };

  if (!stats) return <div style={{ padding: '2rem', textAlign: 'center' }}><Spinner /></div>;

  return (
    <Page title="CheckoutFlow Dashboard">
      {message && (
        <div style={{ marginBottom: '12px' }}>
          <Banner tone={message.type} onDismiss={() => setMessage(null)}>{message.text}</Banner>
        </div>
      )}

      <Card>
        <div style={{ padding: '1rem' }}>
          <p style={{ fontWeight: 500, fontSize: '15px', marginBottom: '12px' }}>Store Overview</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
            {[
              { label: 'Plan', value: (stats.plan || 'FREE').toUpperCase() },
              { label: 'Total Forms', value: stats.total_forms ?? 0 },
              { label: 'Active Forms', value: stats.active_forms ?? 0 },
              { label: 'Submissions This Month', value: stats.monthly_submissions ?? 0 },
            ].map(s => (
              <div key={s.label} style={{ background: '#f6f6f7', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#6d7175', marginBottom: '4px' }}>{s.label}</p>
                <p style={{ fontSize: '22px', fontWeight: 500 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ marginTop: '12px' }}>
        <Card>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: '15px', margin: 0 }}>Storefront Modal</p>
                <p style={{ fontSize: '13px', color: '#6d7175', marginTop: '4px' }}>Install the pre-checkout form on your store</p>
              </div>
              {scriptStatus === null ? <Spinner size="small" /> : (
                <Badge tone={scriptStatus.installed ? 'success' : 'info'}>
                  {scriptStatus.installed ? 'Installed' : 'Not installed'}
                </Badge>
              )}
            </div>

            {scriptStatus && !scriptStatus.installed && (
              <div style={{ background: '#f0f7ff', border: '0.5px solid #b5d4f4', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '13px', color: '#0c447c', marginBottom: '4px', fontWeight: 500 }}>Ready to install</p>
                <p style={{ fontSize: '12px', color: '#378add' }}>Click Install to add the checkout modal to your Shopify store. No theme code changes needed.</p>
              </div>
            )}

            {scriptStatus && scriptStatus.installed && (
              <div style={{ background: '#e3f1df', border: '0.5px solid #97c459', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '13px', color: '#27500A', fontWeight: 500 }}>Modal is live on your store</p>
                <p style={{ fontSize: '12px', color: '#3B6D11' }}>Customers will see the form when they click checkout from their cart.</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              {!scriptStatus?.installed ? (
                <Button variant="primary" onClick={installScript} loading={installing}>
                  Install on Store
                </Button>
              ) : (
                <Button tone="critical" onClick={removeScript}>Remove from Store</Button>
              )}
              <Button onClick={() => window.open('https://' + (stats.shop_domain || 'groomieclub-2.myshopify.com'), '_blank')}>
                View Store
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {stats.plan === 'free' && (
        <div style={{ marginTop: '12px' }}>
          <Card>
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: '14px', color: '#0c447c' }}>Upgrade to Essential - $7.99/mo</p>
                <p style={{ fontSize: '12px', color: '#378add' }}>Unlimited fields, 500 submissions, conditional logic</p>
              </div>
              <Button onClick={onUpgrade}>Upgrade</Button>
            </div>
          </Card>
        </div>
      )}
    </Page>
  );
}
