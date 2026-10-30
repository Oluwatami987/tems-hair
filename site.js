(function () {
  const phone = '2349069069847';
  const money = value => `₦${Number(value || 0).toLocaleString('en-NG')}`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const wa = message => `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const colorClass = color => ({ '1B': 'c-1b', '2': 'c-2', '4': 'c-4', '27': 'c-27', '99J': 'c-99j', '613': 'c-613', '1B/27': 'c-ombre' }[color] || 'c-1b');
  const colorButtons = product => (product.colors || []).map((color, index) => `<button type="button" class="color-choice ${colorClass(color)}${index === 0 ? ' on' : ''}" data-color="${esc(color)}" aria-label="Colour ${esc(color)}" aria-pressed="${index === 0}"></button>`).join('');

  function renderCatalog() {
    const target = document.querySelector('[data-catalog]');
    if (!target || !window.TemsCatalog) return;
    const category = target.dataset.catalog;
    const products = (window.currentTemsProducts || TemsCatalog.read()).filter(item => item.category === category && item.available !== false);
    target.innerHTML = products.map(item => {
      const order = `Hi Tems, I'd like to order: ${item.name}${item.detail ? ` (${item.detail.split(' · ')[0]})` : ''}, colour ${item.colors?.[0] || '1B'}`;
      const colorline = `<div class="sw"><div class="swatches">${colorButtons(item)}</div><em>Colour <b>${esc(item.colors?.[0] || '1B')}</b></em></div>`;
      if (category === 'ponytails') return `<article class="pcard" data-product-id="${esc(item.id)}"><div class="ph"><img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy"></div><div class="body"><div class="type">${esc(item.type || 'Ponytail')}</div><div class="name">${esc(item.name)}</div><div class="len">${esc(item.detail || '')}</div><div class="row"><span class="price">${money(item.price)}</span></div>${colorline}<a class="btn btn-wine order-button" href="${wa(order)}" aria-label="Order ${esc(item.name)} on WhatsApp">Order on WhatsApp</a></div></article>`;
      return `<article class="card" data-product-id="${esc(item.id)}"><div class="ph"><img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy"></div><div class="body"><div class="name">${esc(item.name)}</div><div class="meta">${esc(item.detail || '')}</div>${colorline}<div class="price">${money(item.price)}</div><a class="btn btn-wine order-button" href="${wa(order)}" aria-label="Order ${esc(item.name)} on WhatsApp">Order on WhatsApp</a></div></article>`;
    }).join('');
    applyFilter(target, 'All');
  }

  function applyFilter(target, selection) {
    target.querySelectorAll('[data-product-id]').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.hidden = selection !== 'All' && !text.includes(selection.toLowerCase());
    });
  }

  function setupBooking() {
    const steps = [...document.querySelectorAll('.step .opts')];
    const summary = document.querySelector('.summary');
    if (steps.length < 2 || !summary) return;
    let length = 'Medium';
    let size = 'Small';
    const update = () => {
      summary.querySelectorAll('.line b').forEach((el, index) => { if (index === 0) el.textContent = length; if (index === 1) el.textContent = size; });
      const message = `Hi Tems, I'd like to book: ${length} length, ${size} size`;
      const bubble = summary.querySelector('.bubble');
      if (bubble) bubble.innerHTML = `<small>Message preview</small>${esc(message)}`;
      const button = summary.querySelector('a[href*="wa.me"]');
      if (button) button.href = wa(message);
    };
    steps.forEach((step, index) => step.addEventListener('click', event => {
      const option = event.target.closest('.opt');
      if (!option) return;
      step.querySelectorAll('.opt').forEach(item => item.classList.remove('on'));
      option.classList.add('on');
      const value = option.querySelector('b')?.textContent.trim();
      if (index === 0) length = value || length; else size = value || size;
      update();
    }));
    update();
  }

  function setupColors() {
    document.addEventListener('click', event => {
      const button = event.target.closest('.color-choice');
      if (!button) return;
      const card = button.closest('[data-product-id]');
      if (!card) return;
      card.querySelectorAll('.color-choice').forEach(item => { item.classList.toggle('on', item === button); item.setAttribute('aria-pressed', item === button); });
      const label = card.querySelector('.sw em b');
      if (label) label.textContent = button.dataset.color;
      const title = card.querySelector('.name')?.textContent.trim() || 'product';
      const detail = card.querySelector('.len,.meta')?.textContent.trim() || '';
      const length = detail.match(/\d+"/)?.[0];
      const message = `Hi Tems, I'd like to order: ${title}${length ? ` (${length})` : ''}, colour ${button.dataset.color}`;
      const order = card.querySelector('.order-button');
      if (order) order.href = wa(message);
    });
  }

  function setupFilters() {
    document.querySelectorAll('.chips').forEach(group => group.addEventListener('click', event => {
      const chip = event.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach(item => item.classList.toggle('on', item === chip));
      const target = document.querySelector('[data-catalog]');
      if (target) applyFilter(target, chip.textContent.trim());
    }));
  }

  function setupMenu() {
    const toggle = document.querySelector('.menu');
    const nav = document.querySelector('.desk-nav');
    if (!toggle || !nav) return;
    toggle.href = '#navigation';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', event => {
      event.preventDefault();
      const open = nav.classList.toggle('mobile-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function setupWhatsAppNotice() {
    const dialog = document.createElement('dialog');
    dialog.className = 'prep-dialog';
    dialog.innerHTML = `<div class="prep-dialog__inner"><span class="eyebrow">Before you continue</span><h2>Before WhatsApp</h2><p data-rules>Tems will confirm availability, price, and any preparation instructions on WhatsApp. Your request is confirmed only after Tems replies.</p><div class="prep-dialog__actions"><button type="button" class="btn btn-ghost" data-dismiss>Go back</button><a class="btn btn-wine" data-continue target="_blank" rel="noopener">Continue to WhatsApp</a></div></div>`;
    document.body.append(dialog);
    fetch('/api/settings', { cache: 'no-store' }).then(response => response.ok ? response.json() : null).then(data => {
      if (data && typeof data.bookingRules === 'string' && data.bookingRules.trim()) dialog.querySelector('[data-rules]').textContent = data.bookingRules;
    }).catch(() => {});
    let pending = '';
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href*="wa.me/2349069069847"]');
      if (!link || link.closest('.prep-dialog')) return;
      event.preventDefault();
      pending = link.href;
      dialog.querySelector('[data-continue]').href = pending;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else window.open(pending, '_blank', 'noopener');
    });
    dialog.querySelector('[data-dismiss]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try { window.currentTemsProducts = await TemsCatalog.refresh(); } catch (_) { window.currentTemsProducts = TemsCatalog.read(); }
    renderCatalog(); setupBooking(); setupColors(); setupFilters(); setupMenu(); setupWhatsAppNotice();
  });
})();
