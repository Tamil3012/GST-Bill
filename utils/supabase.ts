
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uqsyuhppfczjhdffsehb.supabase.co';
const supabaseAnonKey = 'sb_publishable_mWOJdW2EXDoSE2Sx9HHfAA_afuHQU2l';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
