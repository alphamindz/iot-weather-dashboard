const { Client } = require('pg');

const client = new Client({
  // Exact direct host address
  host: 'db.sodblwhzmopifolfwlak.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'YOUR_REAL_DATABASE_PASSWORD', // Supabase account create karte waqt jo password set kiya tha
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log("Connecting to PostgreSQL...");
    await client.connect();

    const sql = `
      CREATE TABLE IF NOT EXISTS public.device_config (
        id INT PRIMARY KEY DEFAULT 1,
        wifi_ssid TEXT NOT NULL DEFAULT '',
        wifi_password TEXT NOT NULL DEFAULT '',
        push_interval_sec INT DEFAULT 5,
        sensor_calibration_offset FLOAT DEFAULT 0.0,
        updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
      );

      ALTER TABLE public.device_config ENABLE ROW LEVEL SECURITY;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read and update on config') THEN
          CREATE POLICY "Allow public read and update on config" 
          ON public.device_config FOR ALL 
          TO anon 
          USING (true) 
          WITH CHECK (true);
        END IF;
      END $$;

      INSERT INTO public.device_config (id, wifi_ssid, wifi_password, push_interval_sec, sensor_calibration_offset)
      VALUES (1, 'Campus_WiFi', 'NetworkPassword123', 5, 0.0)
      ON CONFLICT (id) DO NOTHING;
    `;

    await client.query(sql);
    console.log("✅ Table device_config successfully created!");
  } catch (e) {
    console.error("❌ Error:", e.message);
  } finally {
    await client.end();
  }
}

run();