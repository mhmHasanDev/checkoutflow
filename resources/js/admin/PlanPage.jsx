
import React from 'react';
import { Page, Card, Button, Badge } from '@shopify/polaris';

const plans = [
  { name: 'Free', price: '$0', color: '#f6f6f7', textColor: '#202223', features: ['1 form', '3 fields max', '50 submissions/mo', 'Basic field types', 'Email support'], cta: 'Current plan', disabled: true },
  { name: 'Essential', price: '$7.99', color: '#e3f1df', textColor: '#1a7a3c', popular: true, features: ['Unlimited forms', 'Unlimited fields', '500 submissions/mo', 'All field types', 'Basic conditional logic (5 rules)', 'Metafield + order note sync', 'Customer tagging', 'Email support 24h'], cta: 'Upgrade to Essential', disabled: false },
  { name: 'Professional', price: '$15.99', color: '#e0f0ff', textColor: '#0c447c', features: ['Everything in Essential', 'Unlimited submissions', 'Advanced conditional logic', 'All 4 templates', 'Multi-language support', 'File uploads (10MB)', 'Advanced analytics', 'Live chat support'], cta: 'Upgrade to Professional', disabled: false },
  { name: 'Enterprise', price: '$39.99', color: '#f3f0ff', textColor: '#3c3489', features: ['Everything in Professional', 'REST API access', 'Webhook support', 'White-label (remove branding)', 'File uploads (50MB)', 'Priority support 4h', 'Phone support', 'Multi-store discount 20%'], cta: 'Upgrade to Enterprise', disabled: false },
];

export default function PlanPage({ onBack }) {
  return (
    <Page title="Plans & Pricing" backAction={{ content: 'Dashboard', onAction: onBack }}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
        {plans.map(plan => (
          <div key={plan.name} style={{border: plan.popular ? '2px solid #008060' : '0.5px solid #e1e3e5', borderRadius:'10px',padding:'16px',background:'white',position:'relative'}}>
            {plan.popular && <div style={{position:'absolute',top:'-11px',left:'50%',transform:'translateX(-50%)',background:'#008060',color:'white',fontSize:'11px',padding:'2px 12px',borderRadius:'10px',whiteSpace:'nowrap',fontWeight:500}}>Most popular</div>}
            <div style={{background:plan.color,borderRadius:'6px',padding:'8px 12px',marginBottom:'12px',display:'inline-block'}}>
              <p style={{fontSize:'13px',fontWeight:500,color:plan.textColor}}>{plan.name}</p>
            </div>
            <p style={{fontSize:'24px',fontWeight:500,marginBottom:'4px'}}>{plan.price}<span style={{fontSize:'13px',color:'#8c9196'}}>/mo</span></p>
            <div style={{borderTop:'0.5px solid #e1e3e5',margin:'12px 0',paddingTop:'12px'}}>
              {plan.features.map(f => (
                <div key={f} style={{display:'flex',gap:'6px',marginBottom:'6px',alignItems:'flex-start'}}>
                  <span style={{color:'#008060',marginTop:'1px',fontSize:'13px'}}>✓</span>
                  <span style={{fontSize:'12px',color:'#202223'}}>{f}</span>
                </div>
              ))}
            </div>
            <button disabled={plan.disabled} style={{width:'100%',background:plan.disabled?'#f6f6f7':'#008060',color:plan.disabled?'#8c9196':'white',border:plan.disabled?'1px solid #e1e3e5':'none',borderRadius:'6px',padding:'9px',fontSize:'13px',fontWeight:500,cursor:plan.disabled?'default':'pointer',marginTop:'8px'}}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </Page>
  );
}
