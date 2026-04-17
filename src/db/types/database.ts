export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      allocation_rules: {
        Row: {
          contribution_cap: string | null;
          created_at: string;
          etf_id: string;
          id: string;
          is_active: boolean;
          sequence_order: number;
          target_percentage: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          contribution_cap?: string | null;
          created_at?: string;
          etf_id: string;
          id?: string;
          is_active?: boolean;
          sequence_order: number;
          target_percentage?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          contribution_cap?: string | null;
          created_at?: string;
          etf_id?: string;
          id?: string;
          is_active?: boolean;
          sequence_order?: number;
          target_percentage?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "allocation_rules_etf_id_fkey";
            columns: ["etf_id"];
            referencedRelation: "etfs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "allocation_rules_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      contribution_rules: {
        Row: {
          created_at: string;
          id: string;
          monthly_amount: string;
          start_month: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          monthly_amount: string;
          start_month: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          monthly_amount?: string;
          start_month?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contribution_rules_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      etfs: {
        Row: {
          created_at: string;
          data_source: "manual" | "mock" | "provider";
          expected_return_annual: string | null;
          id: string;
          isin: string;
          last_known_price: string | null;
          name: string;
          price_currency: "EUR";
          ter_bps: number | null;
          ticker: string | null;
          updated_at: string;
          volatility_annual: string | null;
        };
        Insert: {
          created_at?: string;
          data_source?: "manual" | "mock" | "provider";
          expected_return_annual?: string | null;
          id?: string;
          isin: string;
          last_known_price?: string | null;
          name: string;
          price_currency?: "EUR";
          ter_bps?: number | null;
          ticker?: string | null;
          updated_at?: string;
          volatility_annual?: string | null;
        };
        Update: {
          created_at?: string;
          data_source?: "manual" | "mock" | "provider";
          expected_return_annual?: string | null;
          id?: string;
          isin?: string;
          last_known_price?: string | null;
          name?: string;
          price_currency?: "EUR";
          ter_bps?: number | null;
          ticker?: string | null;
          updated_at?: string;
          volatility_annual?: string | null;
        };
        Relationships: [];
      };
      goal_settings: {
        Row: {
          created_at: string;
          id: string;
          required_probability: string;
          target_wealth: string;
          target_year: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          required_probability: string;
          target_wealth: string;
          target_year: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          required_probability?: string;
          target_wealth?: string;
          target_year?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goal_settings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lump_sum_contributions: {
        Row: {
          amount: string;
          contribution_month: string;
          created_at: string;
          id: string;
          note: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount: string;
          contribution_month: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: string;
          contribution_month?: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lump_sum_contributions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      manual_allocation_overrides: {
        Row: {
          created_at: string;
          etf_id: string;
          id: string;
          month: string;
          percentage: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          etf_id: string;
          id?: string;
          month: string;
          percentage: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          etf_id?: string;
          id?: string;
          month?: string;
          percentage?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "manual_allocation_overrides_etf_id_fkey";
            columns: ["etf_id"];
            referencedRelation: "etfs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "manual_allocation_overrides_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_holdings: {
        Row: {
          cost_basis_per_share: string | null;
          created_at: string;
          etf_id: string;
          id: string;
          isin_snapshot: string;
          name_snapshot: string;
          notes: string | null;
          portfolio_id: string;
          quantity: string;
          sort_order: number;
          unit_price_manual: string | null;
          updated_at: string;
        };
        Insert: {
          cost_basis_per_share?: string | null;
          created_at?: string;
          etf_id: string;
          id?: string;
          isin_snapshot: string;
          name_snapshot: string;
          notes?: string | null;
          portfolio_id: string;
          quantity: string;
          sort_order?: number;
          unit_price_manual?: string | null;
          updated_at?: string;
        };
        Update: {
          cost_basis_per_share?: string | null;
          created_at?: string;
          etf_id?: string;
          id?: string;
          isin_snapshot?: string;
          name_snapshot?: string;
          notes?: string | null;
          portfolio_id?: string;
          quantity?: string;
          sort_order?: number;
          unit_price_manual?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_etf_id_fkey";
            columns: ["etf_id"];
            referencedRelation: "etfs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "portfolio_holdings_portfolio_id_fkey";
            columns: ["portfolio_id"];
            referencedRelation: "portfolios";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolios: {
        Row: {
          base_currency: "EUR";
          created_at: string;
          id: string;
          is_primary: boolean;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          base_currency?: "EUR";
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          name?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          base_currency?: "EUR";
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolios_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      upsert_etf_from_app: {
        Args: {
          p_data_source?: string;
          p_isin: string;
          p_last_known_price?: number | null;
          p_name: string;
          p_price_currency?: string;
          p_ter_bps?: number | null;
          p_ticker?: string | null;
        };
        Returns: {
          created_at: string;
          data_source: "manual" | "mock" | "provider";
          expected_return_annual: string | null;
          id: string;
          isin: string;
          last_known_price: string | null;
          name: string;
          price_currency: "EUR";
          ter_bps: number | null;
          ticker: string | null;
          updated_at: string;
          volatility_annual: string | null;
        };
      };
      update_etf_projection_assumptions_for_app: {
        Args: {
          p_etf_id: string;
          p_expected_return_annual: number;
          p_ter_bps: number;
          p_volatility_annual?: number | null;
        };
        Returns: {
          created_at: string;
          data_source: "manual" | "mock" | "provider";
          expected_return_annual: string | null;
          id: string;
          isin: string;
          last_known_price: string | null;
          name: string;
          price_currency: "EUR";
          ter_bps: number | null;
          ticker: string | null;
          updated_at: string;
          volatility_annual: string | null;
        };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TableInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TableUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
