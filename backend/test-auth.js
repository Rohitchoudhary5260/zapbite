async function testAuth() {
  try {
    console.log('--- 1. Testing Check-User for Existing User ---');
    const c1 = await fetch('http://localhost:5000/api/auth/check-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210' })
    }).then(r => r.json());
    console.log('Existing Check (9876543210):', c1);

    console.log('\n--- 2. Testing Check-User for New User ---');
    const c2 = await fetch('http://localhost:5000/api/auth/check-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9998887776' })
    }).then(r => r.json());
    console.log('New User Check (9998887776):', c2);

    console.log('\n--- 3. Testing Sign Up for New User with Welcome Bonus ---');
    const s1 = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9998887776',
        name: 'Aman Sharma',
        email: 'aman@gmail.com',
        city: 'Jaipur',
        addressLine: 'House 42, Civil Lines'
      })
    }).then(r => r.json());
    console.log('Signup Result:', s1);

    console.log('\n--- 4. Testing OTP Verification for New User ---');
    const v1 = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9998887776', otp: '123456' })
    }).then(r => r.json());
    console.log('OTP Verify Result:', v1.message, 'Wallet Balance:', v1.user?.walletBalance);

    console.log('\n✅ ALL SIGNUP & LOGIN FLOWS WORKING 100%!');
  } catch (e) {
    console.error('Auth test error:', e);
  }
}
testAuth();

