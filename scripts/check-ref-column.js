const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();

if (!url || !key) {
  console.error('Missing env vars');
  process.exit(1);
}

const client = createClient(url, key, { auth: { persistSession: false } });

async function run() {
  // Try to add column
  const { error } = await client.rpc('exec_sql', { 
    sql: 'ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS reference_number text;'
  });
  
  if (error) {
    // Fallback: try direct insert to see if column exists
    const { error: insertError } = await client
      .from('credentials')
      .insert({
        trustbadge_id: '00000000-0000-0000-0000-000000000000',
        type: 'trade_license',
        file_url: 'https://example.com/test.pdf',
        reference_number: 'TEST123',
        status: 'pending'
      })
      .select('reference_number')
      .maybeSingle();
    
    if (insertError?.message?.includes('reference_number')) {
      console.log('Column does not exist yet');
    } else {
      console.log('Column exists or other error:', insertError?.message);
    }
  } else {
    console.log('OK: column added');
  }
}

run().catch(console.error);
