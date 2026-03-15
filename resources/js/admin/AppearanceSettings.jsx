
import React, { useState } from 'react';
import { Page, Card, TextField, Button, Banner } from '@shopify/polaris';
import axios from 'axios';

export default function AppearanceSettings({ form, onSave, onCancel }) {
  const a = form?.appearance || {};
  const [modalTitle, setModalTitle] = useState(a.modal_title || 'Additional Information');
  const [buttonText, setButtonText] = useState(a.button_text || 'Continue to Checkout');
  const [cancelText, setCancelText] = useState(a.cancel_text || 'Cancel');
  const [primaryColor, setPrimaryColor] = useState(a.primary_color || '#008060');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const save = () => {
    setSaving(true);
    axios.put('/admin/forms/' + form.id, {
      appearance: { modal_title: modalTitle, button_text: buttonText, cancel_text: cancelText, primary_color: primaryColor }
    })
    .then(() => { setSuccess(true); setSaving(false); setTimeout(() => onSave(), 1200); })
    .catch(() => { setError('Failed to save appearance'); setSaving(false); });
  };

  return (
    <Page title="Appearance Settings" backAction={{ content: 'Back', onAction: onCancel }}
      primaryAction={{ content: saving ? 'Saving...' : 'Save', onAction: save, loading: saving }}>
      {error && <Banner tone="critical" onDismiss={() => setError(null)}>{error}</Banner>}
      {success && <Banner tone="success">Appearance saved!</Banner>}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <Card>
          <div style={{padding:'1rem',display:'grid',gap:'1rem'}}>
            <p style={{fontWeight:500,fontSize:'14px'}}>Modal text</p>
            <TextField label="Modal title" value={modalTitle} onChange={setModalTitle} autoComplete="off" helpText="Shown at the top of the checkout form" />
            <TextField label="Continue button text" value={buttonText} onChange={setButtonText} autoComplete="off" />
            <TextField label="Cancel button text" value={cancelText} onChange={setCancelText} autoComplete="off" />
            <div>
              <p style={{fontSize:'14px',fontWeight:500,marginBottom:'8px',color:'#202223'}}>Primary color</p>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                  style={{width:'48px',height:'36px',border:'1px solid #c9cccf',borderRadius:'6px',cursor:'pointer',padding:'2px'}} />
                <span style={{fontSize:'13px',color:'#6d7175',fontFamily:'monospace'}}>{primaryColor}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{padding:'1rem'}}>
            <p style={{fontWeight:500,fontSize:'14px',marginBottom:'12px'}}>Live preview</p>
            <div style={{border:'1px solid #e1e3e5',borderRadius:'10px',padding:'20px',background:'white'}}>
              <p style={{fontWeight:500,fontSize:'15px',marginBottom:'16px',color:'#202223'}}>{modalTitle}</p>
              <div style={{background:'#f6f6f7',borderRadius:'6px',padding:'12px',marginBottom:'12px',color:'#8c9196',fontSize:'13px',textAlign:'center'}}>
                Your form fields appear here
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                <button style={{flex:1,background:primaryColor,color:'white',border:'none',borderRadius:'6px',padding:'10px',fontSize:'13px',fontWeight:500,cursor:'pointer'}}>{buttonText}</button>
                <button style={{background:'white',color:'#202223',border:'1px solid #c9cccf',borderRadius:'6px',padding:'10px 14px',fontSize:'13px',cursor:'pointer'}}>{cancelText}</button>
              </div>
              <p style={{fontSize:'11px',color:'#c9cccf',textAlign:'center',marginTop:'10px'}}>Powered by CheckoutFlow</p>
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}
