export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'volunteer' | 'public'
          full_name: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'volunteer' | 'public'
          full_name: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'volunteer' | 'public'
          full_name?: string
          phone?: string | null
          created_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          title: string
          description: string
          target_amount: number
          current_amount: number
          status: 'draft' | 'active' | 'completed' | 'cancelled'
          currency: string
          verification_text: string | null
          verification_link: string | null
          deadline_at: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          target_amount?: number
          current_amount?: number
          status?: 'draft' | 'active' | 'completed' | 'cancelled'
          currency?: string
          verification_text?: string | null
          verification_link?: string | null
          deadline_at?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          target_amount?: number
          current_amount?: number
          status?: 'draft' | 'active' | 'completed' | 'cancelled'
          currency?: string
          verification_text?: string | null
          verification_link?: string | null
          deadline_at?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      donations: {
        Row: {
          id: string
          campaign_id: string
          donor_id: string | null
          donor_name: string | null
          donor_email: string | null
          donor_name_override: string | null
          amount: number
          currency: string
          converted_amount: number
          exchange_rate: number
          payment_method: string
          payment_status: string
          is_anonymous: boolean
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          donor_id?: string | null
          donor_name?: string | null
          donor_email?: string | null
          donor_name_override?: string | null
          amount: number
          currency?: string
          converted_amount?: number
          exchange_rate?: number
          payment_method?: string
          payment_status?: string
          is_anonymous?: boolean
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          donor_id?: string | null
          donor_name?: string | null
          donor_email?: string | null
          donor_name_override?: string | null
          amount?: number
          currency?: string
          converted_amount?: number
          exchange_rate?: number
          payment_method?: string
          payment_status?: string
          is_anonymous?: boolean
          is_public?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      beneficiaries: {
        Row: {
          id: string
          full_name: string
          contact_phone: string | null
          address: string | null
          family_size: number
          assessment_notes: string | null
          status: 'pending' | 'approved' | 'rejected' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          contact_phone?: string | null
          address?: string | null
          family_size?: number
          assessment_notes?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          contact_phone?: string | null
          address?: string | null
          family_size?: number
          assessment_notes?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      disbursements: {
        Row: {
          id: string
          beneficiary_id: string
          campaign_id: string | null
          amount_value: number
          description: string
          disbursed_at: string
          logged_by: string
          created_at: string
        }
        Insert: {
          id?: string
          beneficiary_id: string
          campaign_id?: string | null
          amount_value?: number
          description: string
          disbursed_at?: string
          logged_by: string
          created_at?: string
        }
        Update: {
          id?: string
          beneficiary_id?: string
          campaign_id?: string | null
          amount_value?: number
          description?: string
          disbursed_at?: string
          logged_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disbursements_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disbursements_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disbursements_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      volunteer_shifts: {
        Row: {
          id: string
          title: string
          description: string
          location: string
          start_time: string
          end_time: string
          max_volunteers: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          location: string
          start_time: string
          end_time: string
          max_volunteers: number
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          location?: string
          start_time?: string
          end_time?: string
          max_volunteers?: number
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_shifts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      volunteer_signups: {
        Row: {
          id: string
          shift_id: string
          user_id: string
          attended: boolean
          created_at: string
        }
        Insert: {
          id?: string
          shift_id: string
          user_id: string
          attended?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          shift_id?: string
          user_id?: string
          attended?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_signups_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "volunteer_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_signups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'volunteer' | 'public'
      campaign_status: 'draft' | 'active' | 'completed' | 'cancelled'
      beneficiary_status: 'pending' | 'approved' | 'rejected' | 'inactive'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type aliases for campaigns
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type CampaignInsert = Database['public']['Tables']['campaigns']['Insert']
export type CampaignUpdate = Database['public']['Tables']['campaigns']['Update']
export type CampaignStatus = Database['public']['Enums']['campaign_status']

// Convenience type aliases for profiles
export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserRole = Database['public']['Enums']['user_role']

// Convenience type aliases for donations
export type Donation = Database['public']['Tables']['donations']['Row']
export type DonationInsert = Database['public']['Tables']['donations']['Insert']
export type DonationUpdate = Database['public']['Tables']['donations']['Update']

// Convenience type aliases for beneficiaries
export type Beneficiary = Database['public']['Tables']['beneficiaries']['Row']
export type BeneficiaryInsert = Database['public']['Tables']['beneficiaries']['Insert']
export type BeneficiaryUpdate = Database['public']['Tables']['beneficiaries']['Update']
export type BeneficiaryStatus = Database['public']['Enums']['beneficiary_status']

// Convenience type aliases for disbursements
export type Disbursement = Database['public']['Tables']['disbursements']['Row']
export type DisbursementInsert = Database['public']['Tables']['disbursements']['Insert']
export type DisbursementUpdate = Database['public']['Tables']['disbursements']['Update']

// Convenience type aliases for volunteer_shifts
export type VolunteerShift = Database['public']['Tables']['volunteer_shifts']['Row']
export type VolunteerShiftInsert = Database['public']['Tables']['volunteer_shifts']['Insert']

// Convenience type aliases for volunteer_signups
export type VolunteerSignup = Database['public']['Tables']['volunteer_signups']['Row']
export type VolunteerSignupInsert = Database['public']['Tables']['volunteer_signups']['Insert']
