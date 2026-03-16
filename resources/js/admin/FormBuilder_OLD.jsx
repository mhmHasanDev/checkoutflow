import React, { useState } from 'react';
import { Page, Card, Button, ButtonGroup, TextField, Select, Checkbox, Badge, Banner } from '@shopify/polaris';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'cvr', label: 'CVR Number (Danish)' },
  { value: 'vat', label: 'VAT ID (EU)' },
  { value: 'ean', label: 'EAN Number' },
];

function SortableField({ field, onUpdate, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={{ ...style, border: '1px solid #e1e3e5', borderRadius: 8, padding: 12, marginBottom: 8, background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span {...attributes} {...listeners} style={{ cursor: 'grab', fontSize: 18, color: '#8c9196' }}>⠿</span>
        <Badge>{FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}</Badge>
        <div style={{ marginLeft: 'auto' }}>
          <Button size="slim" tone="critical" onClick={() => onRemove(field.id)}>Remove</Button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <TextField label="Label" value={field.label} onChange={v => onUpdate(field.id, 'label', v)} autoComplete="off" />
        <TextField label="Placeholder" value={field.placeholder || ''} onChange={v => onUpdate(field.id, 'placeholder', v)} autoComplete="off" />
        <Select label="Type" options={FIELD_TYPES} value={field.type} onChange={v => onUpdate(field.id, 'type', v)} />
        <div style={{ paddingTop: 20 }}>
          <Checkbox label="Required" checked={field.required || false} onChange={v => onUpdate(field.id, 'required', v)} />
        </div>
      </div>
      {(field.type === 'select' || field.type === 'radio') && (
        <TextField label="Options (comma separated)" value={field.options?.join(', ') || ''} onChange={v => onUpdate(field.id, 'options', v.split(',').map(o => o.trim()))} autoComplete="off" />
      )}
    </div>
  );
}

export default function FormBuilder({ form, onSave, onCancel }) {
  const [name, setName] = useState(form?.name || '');
  const [fields, setFields] = useState(form?.fields || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const addField = () => {
    setFields([...fields, { id: Date.now().toString(), key: 'field_' + (fields.length + 1), label: 'Field ' + (fields.length + 1), type: 'text', placeholder: '', required: false }]);
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id) => setFields(fields.filter(f => f.id !== id));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setFields(arrayMove(fields, fields.findIndex(f => f.id === active.id), fields.findIndex(f => f.id === over.id)));
    }
  };

  const addTemplate = (template) => {
    const t = {
      b2b_nordic: [
        { id: 't1', key: 'customer_type', label: 'Customer Type', type: 'select', required: true, options: ['Private', 'Business', 'Public Institution'] },
        { id: 't2', key: 'company_name', label: 'Company Name', type: 'text', required: false, placeholder: 'Your company name' },
        { id: 't3', key: 'cvr_number', label: 'CVR Number', type: 'cvr', required: false, placeholder: '12345678' },
        { id: 't4', key: 'ean_number', label: 'EAN Number', type: 'ean', required: false, placeholder: '1234567890123' },
      ],
      gift: [
        { id: 'g1', key: 'gift_message', label: 'Gift Message', type: 'textarea', required: false, placeholder: 'Write your message here...' },
        { id: 'g2', key: 'recipient_name', label: 'Recipient Name', type: 'text', required: false },
        { id: 'g3', key: 'delivery_note', label: 'Delivery Note', type: 'textarea', required: false },
      ],
    };
    setFields([...fields, ...t[template]]);
  };

  const save = () => {
    if (!name) { setError('Form name is required'); return; }
    setSaving(true);
    const req = form?.id ? axios.put('/admin/forms/' + form.id, { name, fields }) : axios.post('/admin/forms', { name, fields });
    req.then(() => { setSuccess(true); setSaving(false); setTimeout(() => onSave(), 1000); })
       .catch(() => { setError('Failed to save form'); setSaving(false); });
  };

  return (
    <Page title={form?.id ? 'Edit Form' : 'Create Form'} backAction={{ content: 'Forms', onAction: onCancel }} primaryAction={{ content: saving ? 'Saving...' : 'Save Form', onAction: save, loading: saving }}>
      {error && <Banner tone="critical" onDismiss={() => setError(null)}>{error}</Banner>}
      {success && <Banner tone="success">Form saved successfully!</Banner>}
      <Card><div style={{ padding: '1rem' }}><TextField label="Form Name" value={name} onChange={setName} placeholder="e.g. B2B Nordic Checkout Form" autoComplete="off" /></div></Card>
      <div style={{ margin: '1rem 0' }}>
        <Card><div style={{ padding: '1rem' }}>
          <p style={{ marginBottom: 8, fontWeight: 500 }}>Quick Templates</p>
          <ButtonGroup>
            <Button onClick={() => addTemplate('b2b_nordic')}>+ B2B Nordic</Button>
            <Button onClick={() => addTemplate('gift')}>+ Gift</Button>
          </ButtonGroup>
        </div></Card>
      </div>
      <Card><div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontWeight: 500 }}>Fields ({fields.length})</p>
          <Button onClick={addField}>+ Add Field</Button>
        </div>
        {fields.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#8c9196' }}>No fields yet. Click Add Field or use a template.</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
              {fields.map(field => <SortableField key={field.id} field={field} onUpdate={updateField} onRemove={removeField} />)}
            </SortableContext>
          </DndContext>
        )}
      </div></Card>
    </Page>
  );
}