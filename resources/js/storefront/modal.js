(function () {
  'use strict';

  var CF = {
    config: {
      shopDomain: (window.Shopify && window.Shopify.shop) ? window.Shopify.shop : '',
      apiBase: '/api/v1',
      primaryColor: '#008060',
      modalTitle: 'Additional Information',
      buttonText: 'Continue to Checkout',
      cancelText: 'Cancel',
    },

    form: null,
    originalCheckoutUrl: null,

    init: function () {
      var self = this;
      self.loadForm().then(function () {
        if (self.form) {
          self.interceptCheckout();
          self.injectStyles();
        }
      });
    },

    loadForm: function () {
      var self = this;
      return fetch(self.config.apiBase + '/form?shop=' + self.config.shopDomain)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.form) {
            self.form = data.form;
            var a = data.form.appearance || {};
            if (a.primary_color) self.config.primaryColor = a.primary_color;
            if (a.modal_title)   self.config.modalTitle   = a.modal_title;
            if (a.button_text)   self.config.buttonText   = a.button_text;
            if (a.cancel_text)   self.config.cancelText   = a.cancel_text;
          }
        })
        .catch(function (e) { console.warn('CheckoutFlow: Could not load form', e); });
    },

    interceptCheckout: function () {
      var self = this;
      document.addEventListener('click', function (e) {
        var btn = e.target.closest
          ? e.target.closest('[name="checkout"], .cart__checkout-button, .cart-drawer__checkout')
          : null;
        if (!btn && e.target.name === 'checkout') btn = e.target;
        if (btn) {
          e.preventDefault();
          e.stopPropagation();
          self.originalCheckoutUrl = btn.href || '/checkout';
          self.showModal();
        }
      }, true);
    },

    injectStyles: function () {
      var p = this.config.primaryColor;
      var style = document.createElement('style');
      style.textContent = [
        '.cf-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .2s}',
        '.cf-overlay.cf-show{opacity:1}',
        '.cf-modal{background:#fff;border-radius:12px;padding:24px;width:100%;max-width:440px;max-height:90vh;overflow-y:auto;transform:translateY(20px);transition:transform .2s;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
        '.cf-overlay.cf-show .cf-modal{transform:translateY(0)}',
        '.cf-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}',
        '.cf-title{font-size:18px;font-weight:600;color:#202223;margin:0}',
        '.cf-close{background:none;border:none;font-size:24px;cursor:pointer;color:#8c9196;padding:0;line-height:1}',
        '.cf-field{margin-bottom:16px}',
        '.cf-label{display:block;font-size:13px;font-weight:500;color:#202223;margin-bottom:6px}',
        '.cf-required{color:#d72c0d}',
        '.cf-input,.cf-select,.cf-textarea{width:100%;padding:10px 12px;border:1px solid #c9cccf;border-radius:8px;font-size:14px;color:#202223;outline:none;box-sizing:border-box;font-family:inherit}',
        '.cf-input:focus,.cf-select:focus,.cf-textarea:focus{border-color:' + p + ';box-shadow:0 0 0 2px ' + p + '22}',
        '.cf-textarea{resize:vertical;min-height:80px}',
        '.cf-error{font-size:12px;color:#d72c0d;margin-top:4px;display:none}',
        '.cf-field.cf-has-error .cf-input,.cf-field.cf-has-error .cf-select{border-color:#d72c0d}',
        '.cf-field.cf-has-error .cf-error{display:block}',
        '.cf-help{font-size:12px;color:#8c9196;margin-top:4px}',
        '.cf-hidden{display:none!important}',
        '.cf-actions{display:flex;gap:10px;margin-top:20px}',
        '.cf-btn-primary{flex:1;padding:12px;background:' + p + ';color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit}',
        '.cf-btn-primary:disabled{opacity:.6;cursor:not-allowed}',
        '.cf-btn-secondary{padding:12px 18px;background:#fff;color:#202223;border:1px solid #c9cccf;border-radius:8px;font-size:15px;cursor:pointer;font-family:inherit}',
        '.cf-footer{text-align:center;margin-top:12px;font-size:11px;color:#c9cccf}',
        '@media(max-width:480px){.cf-modal{padding:18px;border-radius:8px}.cf-actions{flex-direction:column}}',
      ].join('');
      document.head.appendChild(style);
    },

    showModal: function () {
      var self = this;
      var existing = document.getElementById('cf-modal-overlay');
      if (existing) existing.remove();

      var overlay = document.createElement('div');
      overlay.id = 'cf-modal-overlay';
      overlay.className = 'cf-overlay';
      overlay.innerHTML = self.buildModalHTML();
      document.body.appendChild(overlay);

      setTimeout(function () { overlay.classList.add('cf-show'); }, 10);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) self.hideModal();
      });

      overlay.querySelector('.cf-close').addEventListener('click', function () { self.hideModal(); });
      overlay.querySelector('.cf-btn-primary').addEventListener('click', function () { self.handleSubmit(); });
      overlay.querySelector('.cf-btn-secondary').addEventListener('click', function () { self.hideModal(); });

      self.bindConditionalLogic(overlay);
    },

    hideModal: function () {
      var overlay = document.getElementById('cf-modal-overlay');
      if (overlay) {
        overlay.classList.remove('cf-show');
        setTimeout(function () { overlay.remove(); }, 200);
      }
    },

    buildModalHTML: function () {
      var fields = (this.form && this.form.fields) ? this.form.fields : [];
      var fieldsHTML = fields.map(function (f) { return CF.buildFieldHTML(f); }).join('');
      return '<div class="cf-modal" role="dialog" aria-modal="true">' +
        '<div class="cf-header">' +
        '<h2 class="cf-title">' + this.config.modalTitle + '</h2>' +
        '<button class="cf-close" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="cf-fields">' + fieldsHTML + '</div>' +
        '<div class="cf-actions">' +
        '<button class="cf-btn-primary" id="cf-submit">' + this.config.buttonText + '</button>' +
        '<button class="cf-btn-secondary">' + this.config.cancelText + '</button>' +
        '</div>' +
        '<div class="cf-footer">Powered by CheckoutFlow</div>' +
        '</div>';
    },

    buildFieldHTML: function (field) {
      var req  = field.required ? '<span class="cf-required">*</span>' : '';
      var hidden = field.condition ? 'cf-hidden' : '';
      var helps = { cvr: 'Danish 8-digit company number', vat: 'EU VAT ID e.g. DK12345678', ean: '13-digit EAN for public institutions' };
      var help = helps[field.type] ? '<p class="cf-help">' + helps[field.type] + '</p>' : '';
      var input = '';

      if (field.type === 'select') {
        var opts = (field.options || []).map(function (o) { return '<option value="' + o + '">' + o + '</option>'; }).join('');
        input = '<select class="cf-select" id="cf-' + field.key + '" name="' + field.key + '"' + (field.required ? ' required' : '') + '><option value="">Select...</option>' + opts + '</select>';
      } else if (field.type === 'textarea') {
        input = '<textarea class="cf-textarea" id="cf-' + field.key + '" name="' + field.key + '" placeholder="' + (field.placeholder || '') + '"' + (field.required ? ' required' : '') + '></textarea>';
      } else if (field.type === 'checkbox') {
        return '<div class="cf-field ' + hidden + '" data-key="' + field.key + '">' +
          '<label style="display:flex;align-items:center;gap:8px;cursor:pointer">' +
          '<input type="checkbox" id="cf-' + field.key + '" name="' + field.key + '" style="width:auto">' +
          '<span style="font-size:14px">' + field.label + '</span></label></div>';
      } else {
        var typeMap = { cvr: 'text', vat: 'text', ean: 'text', email: 'email', phone: 'tel', number: 'number' };
        var inputType = typeMap[field.type] || 'text';
        var maxLen = field.type === 'cvr' ? ' maxlength="8"' : field.type === 'ean' ? ' maxlength="13"' : '';
        input = '<input class="cf-input" type="' + inputType + '" id="cf-' + field.key + '" name="' + field.key + '" placeholder="' + (field.placeholder || '') + '"' + (field.required ? ' required' : '') + maxLen + '>';
      }

      return '<div class="cf-field ' + hidden + '" data-key="' + field.key + '">' +
        '<label class="cf-label" for="cf-' + field.key + '">' + field.label + ' ' + req + '</label>' +
        input + help +
        '<p class="cf-error" id="cf-error-' + field.key + '"></p>' +
        '</div>';
    },

    bindConditionalLogic: function (overlay) {
      var self = this;
      var rules = (this.form && this.form.conditional_rules) ? this.form.conditional_rules : [];
      if (!rules.length) return;
      overlay.addEventListener('change', function () { self.evaluateConditions(overlay, rules); });
    },

    evaluateConditions: function (overlay, rules) {
      rules.forEach(function (rule) {
        var trigger = overlay.querySelector('#cf-' + rule.trigger_field);
        var target  = overlay.querySelector('[data-key="' + rule.target_field + '"]');
        if (!trigger || !target) return;
        var show = rule.operator === 'equals'    ? trigger.value === rule.value :
                   rule.operator === 'not_equals'? trigger.value !== rule.value :
                   rule.operator === 'not_empty' ? trigger.value.trim() !== '' : false;
        target.classList.toggle('cf-hidden', rule.action === 'show' ? !show : show);
      });
    },

    validate: function () {
      var fields = (this.form && this.form.fields) ? this.form.fields : [];
      var valid = true;
      fields.forEach(function (field) {
        var el   = document.querySelector('#cf-modal-overlay #cf-' + field.key);
        var err  = document.getElementById('cf-error-' + field.key);
        var wrap = el ? el.closest('.cf-field') : null;
        if (!el || !err || (wrap && wrap.classList.contains('cf-hidden'))) return;
        wrap.classList.remove('cf-has-error');
        err.textContent = '';
        var val = (el.value || '').trim();
        if (field.required && !val) {
          err.textContent = field.label + ' is required.';
          wrap.classList.add('cf-has-error');
          valid = false;
          return;
        }
        if (!val) return;
        if (field.type === 'cvr' && !/^\d{8}$/.test(val)) {
          err.textContent = 'CVR must be 8 digits.';
          wrap.classList.add('cf-has-error');
          valid = false;
        } else if (field.type === 'ean' && !/^\d{13}$/.test(val)) {
          err.textContent = 'EAN must be 13 digits.';
          wrap.classList.add('cf-has-error');
          valid = false;
        } else if (field.type === 'email' && !/^[^@]+@[^@]+\.[^@]+$/.test(val)) {
          err.textContent = 'Invalid email address.';
          wrap.classList.add('cf-has-error');
          valid = false;
        }
      });
      return valid;
    },

    collectData: function () {
      var data   = {};
      var fields = (this.form && this.form.fields) ? this.form.fields : [];
      fields.forEach(function (f) {
        var el = document.querySelector('#cf-modal-overlay #cf-' + f.key);
        if (el) data[f.key] = el.type === 'checkbox' ? el.checked : (el.value || '');
      });
      return data;
    },

    handleSubmit: function () {
      var self = this;
      if (!self.validate()) return;
      var btn = document.getElementById('cf-submit');
      btn.disabled    = true;
      btn.textContent = 'Processing...';
      fetch(self.config.apiBase + '/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body:    JSON.stringify({ form_id: self.form.id, customer_id: (window.Shopify && window.Shopify.customerId) ? window.Shopify.customerId : null, data: self.collectData() }),
      })
        .catch(function (e) { console.warn('CheckoutFlow submit failed', e); })
        .finally(function () {
          self.hideModal();
          window.location.href = self.originalCheckoutUrl || '/checkout';
        });
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { CF.init(); });
  } else {
    CF.init();
  }

  window.CheckoutFlow = CF;
})();