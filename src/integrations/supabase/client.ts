
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rnzczybbwzkyepwtkfql.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuemN6eWJid3preWVwd3RrZnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMjAwMDQsImV4cCI6MjA2Njg5NjAwNH0.r1c97Cd5sdzc7bMPh2c0eMVtqXaSNLRwOCn3r2AcCOY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
