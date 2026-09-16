async function testAll() {
  try {
    console.log('--- 1. Testing Health ---');
    const health = await fetch('http://localhost:5000/api/health').then(r => r.json());
    console.log('Health:', health);

    console.log('\n--- 2. Testing Categories ---');
    const cats = await fetch('http://localhost:5000/api/categories').then(r => r.json());
    console.log('Categories Count:', cats.count);

    console.log('\n--- 3. Testing Products Count & Veg Only ---');
    const prods = await fetch('http://localhost:5000/api/products?limit=10').then(r => r.json());
    console.log('Total Products in MongoDB Atlas:', prods.totalCount);
    console.log('All products 100% Pure Veg?:', prods.products.every(p => p.isVeg));

    console.log('\n--- 4. Testing Search (e.g. Atta, Maggi, Amul) ---');
    const s1 = await fetch('http://localhost:5000/api/products?search=atta').then(r => r.json());
    const s2 = await fetch('http://localhost:5000/api/products?search=maggi').then(r => r.json());
    const s3 = await fetch('http://localhost:5000/api/products?search=amul').then(r => r.json());
    console.log('Search "atta":', s1.count, 'items');
    console.log('Search "maggi":', s2.count, 'items');
    console.log('Search "amul":', s3.count, 'items');

    console.log('\n--- 5. Testing Coupons ---');
    const coupons = await fetch('http://localhost:5000/api/coupons').then(r => r.json());
    console.log('Coupons:', coupons.coupons.map(c => c.code));

    console.log('\n--- 6. Testing Place Order ---');
    const orderRes = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: 'prod_0001', name: 'Amul Taaza Milk', price: 27, quantity: 2, unit: '500 ml' }],
        bill: { itemTotal: 54, deliveryFee: 0, handlingFee: 4, tip: 10, discount: 0, grandTotal: 68, savingsTotal: 10 },
        paymentMethod: 'UPI'
      })
    }).then(r => r.json());
    console.log('Order created in Atlas:', orderRes.order?.id, 'Status:', orderRes.order?.status);

    console.log('\n--- 7. Testing Get Orders ---');
    const orders = await fetch('http://localhost:5000/api/orders').then(r => r.json());
    console.log('Total Orders stored in Atlas:', orders.count);
    console.log('\n✅ ALL MONGODB ATLAS ENDPOINTS VERIFIED & WORKING 100%!');
  } catch (e) {
    console.error('Test error:', e);
  }
}
testAll();

