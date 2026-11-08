// utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Ganti dengan URL dan Anon Key dari dashboard Supabase Anda
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tmsnxsnlotdavkuvijdh.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtc254c25sb3RkYXZrdXZpamRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NzgzOTIsImV4cCI6MjEwOTM1NDM5Mn0.-6AODMRAgsEybudH4qMof8G3xXWT3gpWrWP9-wCCtNA';

export const supabase = createClient(supabaseUrl, supabaseKey);