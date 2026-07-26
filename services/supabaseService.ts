/**
 * Supabase data service. Replaces googleSheetsService piece by piece
 * during the backend migration.
 */
import { supabase } from '@/services/supabaseClient';

class SupabaseService {
  /**
   * Check whether an account already exists for this email (pre-signup check).
   * Fails open (false) so a transient error never blocks sign-up — signing up
   * with an existing email just behaves like a login.
   */
  async checkUserExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('user_exists', {
        check_email: email.trim().toLowerCase(),
      });
      if (error) {
        console.error('checkUserExists error:', error.message);
        return false;
      }
      return data === true;
    } catch (err) {
      console.error('checkUserExists error:', err);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
