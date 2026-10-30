/* Starter listings based on the TEMS visual mockups. Confirm all prices and names before launch. */
(function () {
  const base = [
    { id: 'ext01', category: 'extensions', name: 'Bone Straight', detail: '20" · Straight', price: 85000, colors: ['1B', '2', '613'], image: 'assets/products/ext01.jpg', available: true },
    { id: 'ext02', category: 'extensions', name: 'Body Wave', detail: '18" · Wavy', price: 78000, colors: ['1B', '4', '99J'], image: 'assets/products/ext02.jpg', available: true },
    { id: 'ext03', category: 'extensions', name: 'Deep Wave', detail: '18" · Wavy', price: 82000, colors: ['1B', '2'], image: 'assets/products/ext03.jpg', available: true },
    { id: 'ext04', category: 'extensions', name: 'Kinky Straight', detail: '16" · Straight', price: 70000, colors: ['1B', '4'], image: 'assets/products/ext04.jpg', available: true },
    { id: 'ext05', category: 'extensions', name: 'Water Wave', detail: '20" · Wavy', price: 88000, colors: ['1B', '2'], image: 'assets/products/ext05.jpg', available: true },
    { id: 'ext06', category: 'extensions', name: 'Italian Curls', detail: '24" · Curly', price: 110000, colors: ['1B', '2'], image: 'assets/products/ext06.jpg', available: true },
    { id: 'ext07', category: 'extensions', name: 'French Curls', detail: '18" · Curly', price: 76000, colors: ['1B/27', '1B', '27'], image: 'assets/products/ext07.jpg', available: true },
    { id: 'ext08', category: 'extensions', name: 'Burgundy Straight', detail: '22" · Straight', price: 90000, colors: ['99J', '1B'], image: 'assets/products/ext08.jpg', available: true },
    { id: 'ext09', category: 'extensions', name: 'Kinky Curly', detail: '14" · Curly', price: 69000, colors: ['1B', '4'], image: 'assets/products/ext09.jpg', available: true },
    { id: 'ext10', category: 'extensions', name: 'Packet Hair', detail: 'Braiding · per pack', price: 5000, colors: ['1B', '2', '4', '99J', '613'], image: 'assets/products/ext10.jpg', available: true },
    { id: 'pony01', category: 'ponytails', type: 'Braided', name: 'Braided Detachable', detail: '26" · box braids', price: 35000, colors: ['1B', '99J', '613'], image: 'assets/products/pony01.jpg', available: true },
    { id: 'pony02', category: 'ponytails', type: 'Straight', name: 'Sleek Straight', detail: '24" · drawstring', price: 30000, colors: ['1B', '2', '613'], image: 'assets/products/pony02.jpg', available: true },
    { id: 'pony03', category: 'ponytails', type: 'Curly', name: 'Curly Drawstring', detail: '20" · drawstring', price: 32000, colors: ['1B', '1B/27'], image: 'assets/products/pony03.jpg', available: true },
    { id: 'pony04', category: 'ponytails', type: 'Wavy', name: 'Body Wave Wrap', detail: '22" · wrap-around', price: 33000, colors: ['1B', '4'], image: 'assets/products/pony04.jpg', available: true }
  ];
  window.TemsCatalog = {
    key: 'temsHairCatalog',
    defaults: base,
    read() {
      try {
        const saved = JSON.parse(localStorage.getItem(this.key));
        return Array.isArray(saved) ? saved : base.map(item => ({ ...item }));
      } catch (_) { return base.map(item => ({ ...item })); }
    },
    write(items) { localStorage.setItem(this.key, JSON.stringify(items)); },
    async refresh() {
      const response = await fetch('/api/catalog', { cache: 'no-store' });
      if (!response.ok) throw new Error('Catalog service unavailable');
      const data = await response.json();
      if (!Array.isArray(data.products)) throw new Error('Invalid catalog response');
      this.write(data.products);
      return data.products;
    }
  };
})();
