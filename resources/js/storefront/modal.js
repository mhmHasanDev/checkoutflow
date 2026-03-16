(function () {
  'use strict';

  var CF = {
    config: {
      shopDomain: (window.Shopify && window.Shopify.shop) ? window.Shopify.shop : '',
      apiBase: 'https://checkoutflow.onrender.com/api/v1',
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
        if (self.form && self.form.fields && self.form.fields.length > 0) {
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

      // Intercept all checkout button clicks
      document.addEventListener('click', function (e) {
        var btn = null;
        var target = e.target;

        // Check the clicked element and its parents
        for (var i = 0; i < 5; i++) {
          if (!target) break;
          var name = (target.name || '').toLowerCase();
          var cls  = (target.className || '').toString().toLowerCase();
          var txt  = (target.innerText || target.textContent || '').toLowerCase().trim();
          var href = (target.href || '').toLowerCase();

          if (name === 'checkout' ||
              cls.indexOf('checkout') !== -1 ||
              txt === 'checkout' ||
              txt === 'proceed to checkout' ||
              txt === 'check out' ||
              href.indexOf('/checkout') !== -1) {
            btn = target;
            break;
          }
          target = target.parentElement;
        }

        if (btn) {
          e.preventDefault();
          e.stopImmediatePropagation();
          self.originalCheckoutUrl = btn.href || '/checkout';
          self.showModal();
        }
      }, true);

      // Intercept form submissions with checkout
      document.addEventListener('submit', function (e) {
        var form = e.target;
        if (!form) return;
        var action = (form.action || '').toLowerCase();
        if (action.indexOf('/cart') !== -1) {
          var checkoutBtn = form.querySelector('[name="checkout"]');
          if (checkoutBtn) {
            e.preventDefault();
            e.stopImmediatePropagation();
            self.originalCheckoutUrl = '/checkout';
            self.showModal();
          }
        }
      }, true);
    },

    injectStyles: function () {
      var p = this.config.primaryColor;
      var el = document.createElement('style');
      el.textContent = '.cf-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .25s}.cf-overlay.cf-show{opacity:1}.cf-modal{background:#fff;border-radius:12px;padding:24px;width:100%;max-width:460px;max-height:90vh;overflow-y:auto;transform:translateY(24px);transition:transform .25s;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;color:#202223}.cf-overlay.cf-show .cf-modal{transform:translateY(0)}.cf-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.cf-title{font-size:17px;font-weight:600;margin:0}.cf-close{background:none;border:none;font-size:22px;cursor:pointer;color:#8c9196;padding:0;line-height:1}.cf-field{margin-bottom:14px}.cf-label{display:block;font-size:13px;font-weight:500;margin-bottom:5px}.cf-req{color:#d72c0d}.cf-input,.cf-select,.cf-textarea{width:100%;padding:9px 12px;border:1.5px solid #c9cccf;border-radius:8px;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;transition:border-color .15s}.cf-input:focus,.cf-select:focus,.cf-textarea:focus{border-color:' + p + '}.cf-textarea{resize:vertical;min-height:80px}.cf-help{font-size:12px;color:#8c9196;margin-top:3px}.cf-error{font-size:12px;color:#d72c0d;margin-top:3px;display:none}.cf-has-error .cf-input,.cf-has-error .cf-select{border-color:#d72c0d}.cf-has-error .cf-error{display:block}.cf-hidden{display:none!important}.cf-actions{display:flex;gap:10px;margin-top:20px}.cf-btn-primary{flex:1;padding:12px;background:' + p + ';color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit}.cf-btn-primary:disabled{opacity:.6;cursor:not-allowed}.cf-btn-secondary{padding:12px 16px;background:#fff;color:#202223;border:1.5px solid #c9cccf;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit}.cf-footer{text-align:center;margin-top:10px;font-size:11px;color:#c9cccf}@media(max-width:480px){.cf-modal{padding:16px}.cf-actions{flex-direction:column}}';
      document.head.appendChild(el);
    },

    showModal: function () {
      var self = this;
      var old = document.getElementById('cf-overlay');
      if (old) old.remove();

      var overlay = document.createElement('div');
      overlay.id = 'cf-overlay';
      overlay.className = 'cf-overlay';
      overlay.innerHTML = self.buildModalHTML();
      document.body.appendChild(overlay);
      setTimeout(function () { overlay.classList.add('cf-show'); }, 10);

      overlay.addEventListener('click', function (e) { if (e.target === overlay) self.hideModal(); });
      overlay.querySelector('.cf-close').addEventListener('click', function () { self.hideModal(); });
      overlay.querySelector('#cf-submit').addEventListener('click', function () { self.handleSubmit(); });
      overlay.querySelector('#cf-cancel').addEventListener('click', function () { self.hideModal(); });
      self.bindConditionalLogic(overlay);
    },

    hideModal: function () {
      var overlay = document.getElementById('cf-overlay');
      if (overlay) {
        overlay.classList.remove('cf-show');
        setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 250);
      }
    },

    buildModalHTML: function () {
      var fields = (this.form && this.form.fields) ? this.form.fields : [];
      var html = fields.map(function (f) { return CF.buildFieldHTML(f); }).join('');
      return '<div class="cf-modal"><div class="cf-header"><h2 class="cf-title">' + this.config.modalTitle + '</h2><button class="cf-close">&#215;</button></div><div class="cf-fields">' + html + '</div><div class="cf-actions"><button class="cf-btn-primary" id="cf-submit">' + this.config.buttonText + '</button><button class="cf-btn-secondary" id="cf-cancel">' + this.config.cancelText + '</button></div><div class="cf-footer">Powered by CheckoutFlow</div></div>';
    },

    buildFieldHTML: function (field) {
      var req = field.required ? '<span class="cf-req"> *</span>' : '';
      var help = field.helpText ? '<p class="cf-help">' + field.helpText + '</p>' : '';
      var hidden = (field.condition) ? 'cf-hidden' : '';
      var inp = '';

      if (field.type === 'select') {
        var opts = (field.options || []).map(function (o) { return '<option value="' + o + '">' + o + '</option>'; }).join('');
        inp = '<select class="cf-select" id="cf-' + field.key + '" name="' + field.key + '"' + (field.required ? ' required' : '') + '><option value="">Select...</option>' + opts + '</select>';
      } else if (field.type === 'textarea') {
        inp = '<textarea class="cf-textarea" id="cf-' + field.key + '" name="' + field.key + '" placeholder="' + (field.placeholder || '') + '"' + (field.required ? ' required' : '') + '></textarea>';
      } else if (field.type === 'checkbox') {
        return '<div class="cf-field ' + hidden + '" data-key="' + field.key + '"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px"><input type="checkbox" id="cf-' + field.key + '" name="' + field.key + '" style="width:auto;margin:0"> ' + field.label + '</label>' + help + '</div>';
      } else {
        var typeMap = { cvr: 'text', vat: 'text', ean: 'text', email: 'email', phone: 'tel', number: 'number' };
        var maxl = field.type === 'cvr' ? ' maxlength="8"' : field.type === 'ean' ? ' maxlength="13"' : '';
        inp = '<input class="cf-input" type="' + (typeMap[field.type] || 'text') + '" id="cf-' + field.key + '" name="' + field.key + '" placeholder="' + (field.placeholder || '') + '"' + (field.required ? ' required' : '') + maxl + '>';
      }
      return '<div class="cf-field ' + hidden + '" data-key="' + field.key + '"><label class="cf-label" for="cf-' + field.key + '">' + field.label + req + '</label>' + inp + help + '<p class="cf-error" id="cf-err-' + field.key + '"></p></div>';
    },

    bindConditionalLogic: function (overlay) {
      var self = this;
      var rules = (this.form && this.form.conditional_rules) ? this.form.conditional_rules : [];
      if (!rules.length) return;
      overlay.addEventListener('change', function () { self.evalConditions(overlay, rules); });
      overlay.addEventListener('input', function () { self.evalConditions(overlay, rules); });
    },

    evalConditions: function (overlay, rules) {
      rules.forEach(function (rule) {
        var t = overlay.querySelector('#cf-' + rule.trigger_field);
        var tgt = overlay.querySelector('[data-key="' + rule.target_field + '"]');
        if (!t || !tgt) return;
        var show = rule.operator === 'equals' ? t.value === rule.value :
                   rule.operator === 'not_equals' ? t.value !== rule.value :
                   rule.operator === 'not_empty' ? t.value.trim() !== '' : false;
        tgt.classList.toggle('cf-hidden', rule.action === 'show' ? !show : show);
      });
    },

    validate: function () {
      var fields = (this.form && this.form.fields) ? this.form.fields : [];
      var valid = true;
      fields.forEach(function (field) {
        var el = document.querySelector('#cf-overlay #cf-' + field.key);
        var err = document.getElementById('cf-err-' + field.key);
        var wrap = el ? el.closest('.cf-field') : null;
        if (!el || (wrap && wrap.classList.contains('cf-hidden'))) return;
        if (err) { err.textContent = ''; }
        if (wrap) wrap.classList.remove('cf-has-error');
        var val = (el.value || '').trim();
        if (field.required && !val && el.type !== 'checkbox') {
          if (err) err.textContent = field.label + ' is required.';
          if (wrap) wrap.classList.add('cf-has-error');
          valid = false;
        } else if (val) {
          if (field.type === 'cvr' && !/^\d{8}$/.test(val)) {
            if (err) err.textContent = 'CVR must be 8 digits.';
            if (wrap) wrap.classList.add('cf-has-error');
            valid = false;
          } else if (field.type === 'ean' && !/^\d{13}$/.test(val)) {
            if (err) err.textContent = 'EAN must be 13 digits.';
            if (wrap) wrap.classList.add('cf-has-error');
            valid = false;
          } else if (field.type === 'email' && !/^[^@]+@[^@]+\.[^@]+$/.test(val)) {
            if (err) err.textContent = 'Invalid email address.';
            if (wrap) wrap.classList.add('cf-has-error');
            valid = false;
          }
        }
      });
      return valid;
    },

    collectData: function () {
      var data = {};
      var fields = (this.form && this.form.fields) ? this.form.fields : [];
      fields.forEach(function (f) {
        var el = document.querySelector('#cf-overlay #cf-' + f.key);
        if (el) data[f.key] = el.type === 'checkbox' ? el.checked : (el.value || '');
      });
      return data;
    },

    handleSubmit: function () {
      var self = this;
      if (!self.validate()) return;
      var btn = document.getElementById('cf-submit');
      if (btn) { btn.disabled = true; btn.textContent = 'Processing...'; }

      fetch(self.config.apiBase + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({
          form_id: self.form.id,
          customer_id: (window.Shopify && window.Shopify.customerId) ? window.Shopify.customerId : null,
          data: self.collectData()
        })
      })
      .catch(function (e) { console.warn('CheckoutFlow submit error', e); })
      .finally(function () {
        self.hideModal();
        window.location.href = self.originalCheckoutUrl || '/checkout';
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { CF.init(); });
  } else {
    CF.init();
  }

  window.CheckoutFlow = CF;
})();
