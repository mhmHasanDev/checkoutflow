import React, { useState } from 'react';
import { Page, Card, TextField, Button, Select, Banner } from '@shopify/polaris';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';

const TEMPLATES = {
  b2b_nordic: {
    label: 'B2B Nordic', color: '#e3f1df', textColor: '#1a7a3c',
    fields: [
      { key: 'customer_type', label: 'Customer Type', type: 'select', required: true, placeholder: '', options: ['Private person', 'Business', 'Public institution'], helpText: '' },
      { key: 'company_name', label: 'Company Name', type: 'text', required: false, placeholder: 'Your company name', options: [], helpText: '' },
      { key: 'cvr_number', label: 'CVR Number', type: 'cvr', required: false, placeholder: '12345678', options: [], helpText: 'Danish 8-digit company registration number' },
      { key: 'ean_number', label: 'EAN Number', type: 'ean', required: false, placeholder: '1234567890123', options: [], helpText: '13-digit EAN for public institution invoicing' },
      { key: 'vat_id', label: 'VAT ID', type: 'vat', required: false, placeholder: 'DK12345678', options: [], helpText: 'EU VAT identification number' },
    ]
  },
  b2b_general: {
    label: 'B2B General', color: '#e0f0ff', textColor: '#0c447c',
    fields: [
      { key: 'customer_type', label: 'Customer Type', type: 'select', required: true, placeholder: '', options: ['Individual', 'Business', 'Government'], helpText: '' },
      { key: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'Your company name', options: [], helpText: '' },
      { key: 'tax_id', label: 'Tax ID / VAT Number', type: 'vat', required: false, placeholder: 'e.g. DE123456789', options: [], helpText: 'Your company tax identification number' },
      { key: 'business_license', label: 'Business License Number', type: 'text', required: false, placeholder: 'License number', options: [], helpText: 'Required for regulated industries' },
      { key: 'purchase_order', label: 'Purchase Order Number', type: 'text', required: false, placeholder: 'PO-12345', options: [], helpText: 'Your internal purchase order reference' },
    ]
  },
  gift: {
    label: 'Gift', color: '#fbeaf0', textColor: '#72243e',
    fields: [
      { key: 'is_gift', label: 'This is a gift', type: 'checkbox', required: false, placeholder: '', options: [], helpText: '' },
      { key: 'recipient_name', label: 'Recipient Name', type: 'text', required: false, placeholder: 'Recipients full name', options: [], helpText: '' },
      { key: 'gift_message', label: 'Gift Message', type: 'textarea', required: false, placeholder: 'Write your personal message here...', options: [], helpText: 'Max 200 characters' },
      { key: 'delivery_instructions', label: 'Delivery Instructions', type: 'textarea', required: false, placeholder: 'Any special delivery requirements...', options: [], helpText: '' },
      { key: 'gift_wrap', label: 'Gift wrapping requested', type: 'checkbox', required: false, placeholder: '', options: [], helpText: 'Add gift wrapping for $2.99' },
    ]
  },
  wholesale: {
    label: 'Wholesale', color: '#f3f0ff', textColor: '#3c3489',
    fields: [
      { key: 'business_name', label: 'Business Name', type: 'text', required: true, placeholder: 'Your registered business name', options: [], helpText: '' },
      { key: 'reseller_number', label: 'Reseller Certificate Number', type: 'text', required: true, placeholder: 'RSL-123456', options: [], helpText: 'Your state or country reseller certificate number' },
      { key: 'tax_exempt', label: 'Tax exempt purchase', type: 'checkbox', required: false, placeholder: '', options: [], helpText: 'Check if this purchase is tax exempt' },
      { key: 'business_type', label: 'Business Type', type: 'select', required: true, placeholder: '', options: ['Retailer', 'Distributor', 'Manufacturer', 'Other'], helpText: '' },
      { key: 'annual_revenue', label: 'Estimated Annual Revenue', type: 'select', required: false, placeholder: '', options: ['Under $100K', '$100K - $500K', '$500K - $1M', 'Over $1M'], helpText: '' },
      { key: 'wholesale_agreement', label: 'I agree to wholesale terms and conditions', type: 'checkbox', required: true, placeholder: '', options: [], helpText: '' },
    ]
  }
};

const FIELD_TYPES = [
  { value: 'text', label: 'Text input' },
  { value: 'textarea', label: 'Text area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'cvr', label: 'CVR (Danish)' },
  { value: 'vat', label: 'VAT ID (EU)' },
  { value: 'ean', label: 'EAN (13-digit)' },
];

function SortableField({ field, selected, onSelect, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.key });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const isSelected = selected === field.key;
  const colors = { cvr: '#e3f1df', ean: '#e3f1df', vat: '#e3f1df', select: '#e0f0ff', checkbox: '#fbeaf0' };

  return (
    <div ref={setNodeRef} style={{ ...style, border: isSelected ? '1px solid #008060' : '1px solid #e1e3e5', borderRadius: '8px', padding: '10px 12px', background: isSelected ? '#f6fefe' : 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '6px' }}
      onClick={() => onSelect(field.key)}>
      <span {...attributes} {...listeners} style={{ color: '#c9cccf', cursor: 'grab', fontSize: '16px' }}>::::</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#202223', margin: 0 }}>{field.label}</p>
        <p style={{ fontSize: '11px', color: '#8c9196', margin: 0 }}>{field.type}{field.required ? ' - Required' : ' - Optional'}</p>
      </div>
      <span style={{ background: colors[field.type] || '#f1f1f1', color: '#202223', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>{field.type}</span>
      <button onClick={e => { e.stopPropagation(); onDelete(field.key); }} style={{ background: 'none', border: 'none', color: '#d72c0d', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>x</button>
    </div>
  );
}

export default function FormBuilder({ form, onSave, onCancel }) {
  const [name, setName] = useState(form?.name || '');
  const [fields, setFields] = useState(form?.fields || []);
  const [selectedKey, setSelectedKey] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const selectedField = fields.find(f => f.key === selectedKey);

  const applyTemplate = (tplKey) => {
    const tpl = TEMPLATES[tplKey];
    if (!tpl) return;
    if (fields.length > 0 && !window.confirm('Replace current fields with this template?')) return;
    setFields(tpl.fields.map(f => ({ ...f })));
    if (!name) setName(tpl.label + ' Form');
    setSelectedKey(null);
  };

  const addField = () => {
    const key = 'field_' + Date.now();
    setFields(prev => [...prev, { key, label: 'New Field', type: 'text', required: false, placeholder: '', options: [], helpText: '' }]);
    setSelectedKey(key);
  };

  const deleteField = (key) => {
    setFields(prev => prev.filter(f => f.key !== key));
    if (selectedKey === key) setSelectedKey(null);
  };

  const updateField = (key, updates) => {
    setFields(prev => prev.map(f => f.key === key ? { ...f, ...updates } : f));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setFields(prev => arrayMove(prev, prev.findIndex(f => f.key === active.id), prev.findIndex(f => f.key === over.id)));
    }
  };

  const save = async () => {
    if (!name.trim()) { setError('Please enter a form name.'); return; }
    if (fields.length === 0) { setError('Please add at least one field.'); return; }
    setSaving(true); setError(null);
    try {
      if (form?.id) {
        await axios.put('/admin/forms/' + form.id, { name, fields, is_active: form.is_active ?? true });
      } else {
        await axios.post('/admin/forms', { name, fields, is_active: true });
      }
      setSuccess(true);
      setTimeout(() => onSave(), 800);
    } catch (e) {
      setError('Failed to save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <Page title={form?.id ? 'Edit Form' : 'Create Form'} backAction={{ content: 'Forms', onAction: onCancel }}
      primaryAction={{ content: saving ? 'Saving...' : 'Save Form', onAction: save, loading: saving }}>
      {error && <div style={{ marginBottom: '12px' }}><Banner tone="critical" onDismiss={() => setError(null)}>{error}</Banner></div>}
      {success && <div style={{ marginBottom: '12px' }}><Banner tone="success">Form saved!</Banner></div>}
      <Card><div style={{ padding: '1rem' }}>
        <TextField label="Form Name" value={name} onChange={setName} autoComplete="off" placeholder="e.g. B2B Nordic Checkout Form" />
      </div></Card>
      <div style={{ marginTop: '12px' }}>
        <Card><div style={{ padding: '1rem' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#202223', marginBottom: '10px' }}>Quick Templates</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(TEMPLATES).map(([key, tpl]) => (
              <button key={key} onClick={() => applyTemplate(key)}
                style={{ background: tpl.color, color: tpl.textColor, border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                + {tpl.label}
              </button>
            ))}
          </div>
        </div></Card>
      </div>
      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '12px' }}>
        <Card><div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#6d7175' }}>FIELDS ({fields.length})</p>
            <Button size="slim" onClick={addField}>+ Add Field</Button>
          </div>
          {fields.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#8c9196', border: '1px dashed #c9cccf', borderRadius: '8px' }}>
              No fields yet. Click Add Field or use a template.
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fields.map(f => f.key)} strategy={verticalListSortingStrategy}>
                {fields.map(field => (
                  <SortableField key={field.key} field={field} selected={selectedKey} onSelect={setSelectedKey} onDelete={deleteField} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div></Card>
        <Card><div style={{ padding: '1rem' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#6d7175', marginBottom: '12px' }}>FIELD SETTINGS</p>
          {!selectedField ? (
            <p style={{ fontSize: '13px', color: '#8c9196', textAlign: 'center', padding: '1rem 0' }}>Click a field to edit it</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              <TextField label="Label" value={selectedField.label} onChange={v => updateField(selectedKey, { label: v })} autoComplete="off" />
              <TextField label="Placeholder" value={selectedField.placeholder || ''} onChange={v => updateField(selectedKey, { placeholder: v })} autoComplete="off" />
              <TextField label="Help text" value={selectedField.helpText || ''} onChange={v => updateField(selectedKey, { helpText: v })} autoComplete="off" />
              <Select label="Field type" options={FIELD_TYPES} value={selectedField.type} onChange={v => updateField(selectedKey, { type: v })} />
              {selectedField.type === 'select' && (
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#202223', marginBottom: '6px' }}>Options (one per line)</p>
                  <textarea value={(selectedField.options || []).join('\n')}
                    onChange={e => updateField(selectedKey, { options: e.target.value.split('\n').filter(Boolean) })}
                    rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #c9cccf', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="req" checked={!!selectedField.required} onChange={e => updateField(selectedKey, { required: e.target.checked })} style={{ width: 'auto' }} />
                <label htmlFor="req" style={{ fontSize: '13px', color: '#202223', cursor: 'pointer' }}>Required field</label>
              </div>
            </div>
          )}
        </div></Card>
      </div>
    </Page>
  );
}
