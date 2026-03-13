import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dzhtmesadorwylshytbi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6aHRtZXNhZG9yd3lsc2h5dGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDM3MjIsImV4cCI6MjA4ODM3OTcyMn0.kLBIWCi2ydrYJhsetV2nE72QtFn0c50iNUbr5Ve1oQo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
