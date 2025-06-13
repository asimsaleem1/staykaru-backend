const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://susqtaypnvlwgrizkayb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1c3F0YXlwbnZsd2dyaXprYXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MjUwMTIsImV4cCI6MjA2NDAwMTAxMn0.2DRlWfX2pmK0Q3ZfrmrmKDKos5nAVGwwx6ctRqupadI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRegistration() {
  console.log('Testing Supabase connection...');
  
  // Test with different email formats
  const testEmails = [
    'test@example.com',
    'student@university.edu', 
    'user@domain.com',
    'test@test.com'
  ];
  
  for (const email of testEmails) {
    console.log(`\nTesting with email: ${email}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: 'TestPassword123!',
      options: {
        data: {
          name: 'Test User',
        },
      },
    });
    
    if (error) {
      console.log('Error:', error.message);
    } else {
      console.log('Success:', data.user ? 'User created' : 'Registration initiated');
      break; // Stop on first success
    }
  }
}

testRegistration().catch(console.error);
