/* NeonPro — small progressive enhancements. The site works without this file. */
(function () {
  'use strict';

  function toggler(button, target, openClass) {
    if (!button || !target) return;
    button.addEventListener('click', function () {
      var open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      target.classList.toggle(openClass, open);
    });
  }

  // Main menu (phones / small tablets)
  var navBtn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  toggler(navBtn, nav, 'is-open');
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      navBtn.setAttribute('aria-expanded', 'false');
      navBtn.focus();
    }
  });

  // Product category menu (collapsible below desktop width)
  var cat = document.querySelector('.catnav');
  if (cat) toggler(cat.querySelector('.catnav-toggle'), cat, 'is-open');

  // Email addresses are stored reversed + base64 so they never appear in the page source
  function decode(s) {
    try { return atob(s).split('').reverse().join(''); } catch (e) { return ''; }
  }
  Array.prototype.forEach.call(document.querySelectorAll('.js-email'), function (a) {
    var addr = decode(a.getAttribute('data-e'));
    if (!addr) return;
    a.setAttribute('href', 'mai' + 'lto:' + addr);
    a.textContent = addr;
  });

  // Feedback form: compose an email in the visitor's mail app
  var form = document.getElementById('feedback-form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var recipients = form.getAttribute('data-to').split(',').map(decode).join(',');

  function value(name) {
    var el = form.elements[name];
    if (!el) return '';
    if (el.length && el[0] && el[0].type === 'radio') {
      for (var i = 0; i < el.length; i++) if (el[i].checked) return el[i].value;
      return '';
    }
    return (el.value || '').trim();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var lines = [];
    Array.prototype.forEach.call(form.querySelectorAll('[data-label]'), function (el) {
      var name = el.getAttribute('data-name');
      var v = value(name);
      if (v) lines.push(el.getAttribute('data-label') + ': ' + v);
    });
    var body = lines.join('\n');
    var who = [value('Given_Name'), value('Family_Name')].filter(Boolean).join(' ');
    var company = value('Company_Name');
    var subject = 'NeonPro - Inquiry' + (who ? ' from ' + who : '') + (company ? ' (' + company + ')' : '');

    var href = 'mai' + 'lto:' + recipients +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    status.querySelector('textarea').value = 'To: ' + recipients.replace(/,/g, ', ') +
      '\nSubject: ' + subject + '\n\n' + body;
    status.classList.add('is-visible');
    status.setAttribute('tabindex', '-1');
    window.location.href = href;
    status.focus();
  });

  var copyBtn = document.getElementById('copy-message');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var ta = status.querySelector('textarea');
      ta.select();
      var done = function () { copyBtn.textContent = 'Copied'; };
      if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(done, function () { document.execCommand('copy'); done(); });
      else { document.execCommand('copy'); done(); }
    });
  }
})();
