// src/supabase/client.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uyjjcohrsnujjfnpzatk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5ampjb2hyc251ampmbnB6YXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDQ2NzUsImV4cCI6MjA2ODI4MDY3NX0.llAaB0nFLR3GiddKGZevsBJCGHi1dfwUF-0aXqKL2Jg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
