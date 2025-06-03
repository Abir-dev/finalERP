import { supabase } from '../config/supabase';
import { UserRole } from '../utils/constants';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
}
export const supabaseService = {
  async signUp(email: string, password: string, role: UserRole, name: string) {
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          name
        },
        emailRedirectTo: `${process.env.CLIENT_URL || 'http://localhost:5000'}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as User;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },

  async checkIfUsersExist() {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count && count > 0;
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async createUserInvitation(email: string, role: UserRole, name: string) {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate a unique token
    const token = crypto.randomUUID();
    
    // Store the invitation in a new 'user_invitations' table
    const { error } = await supabase
      .from('user_invitations')
      .insert({
        email,
        role,
        name,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiry
      });

    if (error) throw error;
    return token;
  },

  async validateInvitationToken(token: string) {
    // Get the invitation data
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) {
      throw new Error('Invalid or expired invitation token');
    }

    // Check if token is expired
    if (new Date(data.expires_at) < new Date()) {
      throw new Error('Invitation token has expired');
    }

    return {
      email: data.email,
      role: data.role,
      name: data.name
    };
  },

  async deleteInvitation(token: string) {
    const { error } = await supabase
      .from('user_invitations')
      .delete()
      .eq('token', token);
  
    if (error) throw error;
    return true;
  }
};
