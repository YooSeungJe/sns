import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dfpqugqetcgcffqwfvvy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmcHF1Z3FldGNnY2ZmcXdmdnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMDQ0MzgsImV4cCI6MjA4ODc4MDQzOH0.hDVewa02_UTUdkLL6b30oCQQX3qPEyMNTFn2uY_djwg"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);