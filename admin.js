(async function () {
  const form = document.querySelector('#product-form');
  if (!form) return;
  const list = document.querySelector('#manage-list');
  const status = document.querySelector('.form-status');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const money = value => `₦${Number(value || 0).toLocaleString('en-NG')}`;
  let items = [];
  const api = async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
    return body;
  };
  const showLogin = () => { window.location.replace('admin-login.html'); };

  try {
    const session = await api('/api/admin/session');
    if (!session.authenticated) return showLogin();
    const catalog = await api('/api/catalog');
    items = catalog.products;
    if (!items.length && TemsCatalog.defaults.length) {
      items = TemsCatalog.defaults.map(item => ({ ...item, colors: [...item.colors] }));
      await api('/api/admin/catalog', { method: 'PUT', body: JSON.stringify({ products: items }) });
    }
    const rules = await api('/api/settings');
    document.querySelector('#booking-rules').value = rules.bookingRules || '';
  } catch (error) {
    status.textContent = `Admin service unavailable: ${error.message}. Start the site with Cloudflare Pages dev and configure its database.`;
    form.querySelectorAll('input, select, button').forEach(control => control.disabled = true);
    return;
  }

  function render() {
    const sections = [['extensions', 'Extensions'], ['ponytails', 'Ponytails']];
    list.innerHTML = sections.map(([category, title]) => {
      const products = items.filter(item => item.category === category);
      return `<div class="manage-group"><h3>${title}<span>${products.length} items</span></h3>${products.length ? products.map(item => `<article class="manage-row ${item.available === false ? 'is-hidden' : ''}"><img src="${esc(item.image)}" alt=""><div class="manage-product-copy"><b>${esc(item.name)}</b><span>${item.type ? `${esc(item.type)} · ` : ''}${esc(item.detail || 'No length added')} · ${money(item.price)}</span><small>Colours: ${esc((item.colors || []).join(', ') || 'None')}</small></div><label class="manage-toggle"><input type="checkbox" data-toggle="${esc(item.id)}" ${item.available === false ? '' : 'checked'}><span>${item.available === false ? 'Hidden' : 'Shown'}</span></label><div class="manage-row-actions"><button type="button" data-edit="${esc(item.id)}">Edit</button><button type="button" class="remove" data-delete="${esc(item.id)}">Remove</button></div></article>`).join('') : '<p class="empty-list">No products in this category yet.</p>'}</div>`;
    }).join('');
  }
  async function persist(message) {
    const result = await api('/api/admin/catalog', { method: 'PUT', body: JSON.stringify({ products: items }) });
    TemsCatalog.write(items);
    render();
    if (message) status.textContent = `${message} Shared catalog updated for all customers.`;
    return result;
  }
  function resetForm() {
    form.reset(); form.elements.id.value = ''; form.elements.available.checked = true; form.elements.colors.value = '1B';
    document.querySelector('#form-title').textContent = 'Add a product'; status.textContent = '';
  }
  function loadForEdit(id) {
    const item = items.find(product => product.id === id); if (!item) return;
    form.elements.id.value = item.id; form.elements.category.value = item.category; form.elements.name.value = item.name;
    form.elements.price.value = item.price; form.elements.type.value = item.type || ''; form.elements.detail.value = item.detail || '';
    form.elements.colors.value = (item.colors || []).join(', '); form.elements.image.value = item.image || '';
    form.elements.available.checked = item.available !== false;
    document.querySelector('#form-title').textContent = `Edit ${item.name}`;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function optimizePhoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.onerror = reject;
      reader.onload = () => {
        const image = new Image(); image.onerror = reject;
        image.onload = () => {
          const scale = Math.min(1, 900 / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas'); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
          canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
          let quality = .78; let data = canvas.toDataURL('image/jpeg', quality);
          while (data.length > 600000 && quality > .35) { quality -= .08; data = canvas.toDataURL('image/jpeg', quality); }
          if (data.length > 700000) reject(new Error('Photo is too large after resizing. Choose a smaller photo.')); else resolve(data);
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  form.addEventListener('submit', async event => {
    event.preventDefault(); status.textContent = 'Saving to the shared catalog…';
    const data = Object.fromEntries(new FormData(form).entries());
    const id = data.id || `${data.category === 'extensions' ? 'ext' : 'pony'}-${crypto.randomUUID()}`;
    const existing = items.find(item => item.id === id);
    let image = String(data.image || existing?.image || '').trim();
    const file = form.elements.imageFile.files[0];
    if (file) {
      try {
        const prepared = await optimizePhoto(file);
        const uploaded = await api('/api/admin/image', { method: 'POST', body: JSON.stringify({ image: prepared }) });
        image = uploaded.image;
      } catch (error) { status.textContent = error.message || 'Could not upload that photo.'; return; }
    }
    if (!image) { status.textContent = 'Add a product image or choose a photo.'; return; }
    const item = { id, category: data.category, name: data.name.trim(), type: data.type.trim(), detail: data.detail.trim(), price: Number(data.price), colors: data.colors.split(',').map(color => color.trim()).filter(Boolean), image, available: form.elements.available.checked };
    const index = items.findIndex(product => product.id === id);
    if (index >= 0) items[index] = item; else items.push(item);
    try { await persist('Product saved.'); resetForm(); status.textContent = 'Product saved. Shared catalog updated for all customers.'; }
    catch (error) { status.textContent = `Could not save: ${error.message}`; }
  });
  list.addEventListener('click', async event => {
    const edit = event.target.closest('[data-edit]'); if (edit) return loadForEdit(edit.dataset.edit);
    const remove = event.target.closest('[data-delete]'); if (!remove) return;
    if (!confirm('Remove this product from the catalog?')) return;
    const before = items; items = items.filter(product => product.id !== remove.dataset.delete);
    try { await persist('Product removed.'); } catch (error) { items = before; render(); status.textContent = error.message; }
  });
  list.addEventListener('change', async event => {
    const toggle = event.target.closest('[data-toggle]'); if (!toggle) return;
    const item = items.find(product => product.id === toggle.dataset.toggle); if (!item) return;
    item.available = toggle.checked;
    try { await persist(`Product ${item.available ? 'shown' : 'hidden'}.`); } catch (error) { item.available = !toggle.checked; render(); status.textContent = error.message; }
  });
  document.querySelector('#clear-form').addEventListener('click', resetForm);
  document.querySelector('#save-rules').addEventListener('click', async () => {
    const button = document.querySelector('#save-rules'); button.disabled = true;
    try { await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ bookingRules: document.querySelector('#booking-rules').value }) }); status.textContent = 'Booking rules saved and live.'; }
    catch (error) { status.textContent = `Could not save rules: ${error.message}`; }
    finally { button.disabled = false; }
  });
  document.querySelector('#logout').addEventListener('click', async () => { await api('/api/admin/session', { method: 'DELETE' }).catch(() => {}); showLogin(); });
  document.querySelector('#export-catalog').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'tems-hair-catalog.json'; link.click(); URL.revokeObjectURL(url);
  });
  document.querySelector('#import-catalog').addEventListener('change', event => {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => { try { const data = JSON.parse(reader.result); if (!Array.isArray(data) || data.some(item => !item.id || !['extensions', 'ponytails'].includes(item.category))) throw new Error('Invalid catalog file.'); items = data; await persist('Catalog imported.'); } catch (error) { status.textContent = error.message; } };
    reader.readAsText(file); event.target.value = '';
  });
  render();
})();
