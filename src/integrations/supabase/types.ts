export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      associados: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          mensalidade_valor: number
          nome: string
          numero: string | null
          saldo_anterior: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          mensalidade_valor?: number
          nome: string
          numero?: string | null
          saldo_anterior?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          mensalidade_valor?: number
          nome?: string
          numero?: string | null
          saldo_anterior?: number
        }
        Relationships: []
      }
      autores: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      categorias_biblioteca: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      categorias_financeiras: {
        Row: {
          ativa: boolean
          created_at: string
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["tipo_financeiro"]
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          id?: string
          nome: string
          tipo: Database["public"]["Enums"]["tipo_financeiro"]
        }
        Update: {
          ativa?: boolean
          created_at?: string
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["tipo_financeiro"]
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          chave: string
          id: string
          valor: string
        }
        Insert: {
          chave: string
          id?: string
          valor: string
        }
        Update: {
          chave?: string
          id?: string
          valor?: string
        }
        Relationships: []
      }
      coroacoes: {
        Row: {
          created_at: string
          data_coroacao: string | null
          id: string
          observacao: string | null
          pessoa_id: string
          tipo_coroacao: string | null
          titulo: string
        }
        Insert: {
          created_at?: string
          data_coroacao?: string | null
          id?: string
          observacao?: string | null
          pessoa_id: string
          tipo_coroacao?: string | null
          titulo?: string
        }
        Update: {
          created_at?: string
          data_coroacao?: string | null
          id?: string
          observacao?: string | null
          pessoa_id?: string
          tipo_coroacao?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "coroacoes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      cruzamentos: {
        Row: {
          created_at: string
          data_cruzamento: string | null
          id: string
          linha: string | null
          observacao: string | null
          pessoa_id: string
          serie: string | null
          titulo: string
        }
        Insert: {
          created_at?: string
          data_cruzamento?: string | null
          id?: string
          linha?: string | null
          observacao?: string | null
          pessoa_id: string
          serie?: string | null
          titulo?: string
        }
        Update: {
          created_at?: string
          data_cruzamento?: string | null
          id?: string
          linha?: string | null
          observacao?: string | null
          pessoa_id?: string
          serie?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "cruzamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      emprestimos: {
        Row: {
          created_at: string
          data_devolucao: string | null
          data_emprestimo: string
          data_prevista_devolucao: string | null
          devolucao_aprovada: boolean
          exemplar_id: string
          id: string
          observacao: string | null
          pessoa_id: string
        }
        Insert: {
          created_at?: string
          data_devolucao?: string | null
          data_emprestimo?: string
          data_prevista_devolucao?: string | null
          devolucao_aprovada?: boolean
          exemplar_id: string
          id?: string
          observacao?: string | null
          pessoa_id: string
        }
        Update: {
          created_at?: string
          data_devolucao?: string | null
          data_emprestimo?: string
          data_prevista_devolucao?: string | null
          devolucao_aprovada?: boolean
          exemplar_id?: string
          id?: string
          observacao?: string | null
          pessoa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emprestimos_exemplar_id_fkey"
            columns: ["exemplar_id"]
            isOneToOne: false
            referencedRelation: "exemplares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emprestimos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      entidades: {
        Row: {
          ativa: boolean
          created_at: string
          data_manifestacao: string | null
          id: string
          linha: string | null
          nome_entidade: string | null
          observacao: string | null
          pessoa_id: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          data_manifestacao?: string | null
          id?: string
          linha?: string | null
          nome_entidade?: string | null
          observacao?: string | null
          pessoa_id: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          data_manifestacao?: string | null
          id?: string
          linha?: string | null
          nome_entidade?: string | null
          observacao?: string | null
          pessoa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entidades_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      exemplares: {
        Row: {
          codigo: string | null
          created_at: string
          disponivel: boolean
          id: string
          localizacao: string | null
          obra_id: string
        }
        Insert: {
          codigo?: string | null
          created_at?: string
          disponivel?: boolean
          id?: string
          localizacao?: string | null
          obra_id: string
        }
        Update: {
          codigo?: string | null
          created_at?: string
          disponivel?: boolean
          id?: string
          localizacao?: string | null
          obra_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exemplares_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      fundo_reserva: {
        Row: {
          created_at: string
          data_movimento: string
          descricao: string
          entrada: number
          id: string
          saida: number
        }
        Insert: {
          created_at?: string
          data_movimento: string
          descricao: string
          entrada?: number
          id?: string
          saida?: number
        }
        Update: {
          created_at?: string
          data_movimento?: string
          descricao?: string
          entrada?: number
          id?: string
          saida?: number
        }
        Relationships: []
      }
      historico_religioso: {
        Row: {
          created_at: string
          data_evento: string | null
          descricao: string | null
          id: string
          pessoa_id: string
          tipo_evento: string | null
        }
        Insert: {
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          id?: string
          pessoa_id: string
          tipo_evento?: string | null
        }
        Update: {
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          id?: string
          pessoa_id?: string
          tipo_evento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_religioso_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos: {
        Row: {
          associado_id: string | null
          categoria_id: string
          created_at: string
          data: string
          id: string
          observacao: string | null
          origem: Database["public"]["Enums"]["origem_lancamento"]
          responsavel: string | null
          tipo: Database["public"]["Enums"]["tipo_financeiro"]
          valor: number
        }
        Insert: {
          associado_id?: string | null
          categoria_id: string
          created_at?: string
          data: string
          id?: string
          observacao?: string | null
          origem?: Database["public"]["Enums"]["origem_lancamento"]
          responsavel?: string | null
          tipo: Database["public"]["Enums"]["tipo_financeiro"]
          valor: number
        }
        Update: {
          associado_id?: string | null
          categoria_id?: string
          created_at?: string
          data?: string
          id?: string
          observacao?: string | null
          origem?: Database["public"]["Enums"]["origem_lancamento"]
          responsavel?: string | null
          tipo?: Database["public"]["Enums"]["tipo_financeiro"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
        ]
      }
      mensalidades: {
        Row: {
          associado_id: string
          competencia: string
          created_at: string
          data_pagamento: string | null
          id: string
          lancamento_id: string | null
          status: Database["public"]["Enums"]["status_mensalidade"]
          valor: number
        }
        Insert: {
          associado_id: string
          competencia: string
          created_at?: string
          data_pagamento?: string | null
          id?: string
          lancamento_id?: string | null
          status?: Database["public"]["Enums"]["status_mensalidade"]
          valor: number
        }
        Update: {
          associado_id?: string
          competencia?: string
          created_at?: string
          data_pagamento?: string | null
          id?: string
          lancamento_id?: string | null
          status?: Database["public"]["Enums"]["status_mensalidade"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "mensalidades_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensalidades_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "lancamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      obras: {
        Row: {
          arquivo_url: string | null
          autor_id: string | null
          categoria_id: string | null
          created_at: string
          descricao: string | null
          id: string
          tipo: string | null
          titulo: string
        }
        Insert: {
          arquivo_url?: string | null
          autor_id?: string | null
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          tipo?: string | null
          titulo: string
        }
        Update: {
          arquivo_url?: string | null
          autor_id?: string | null
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "obras_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "autores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_biblioteca"
            referencedColumns: ["id"]
          },
        ]
      }
      observacoes_internas: {
        Row: {
          autor: string | null
          created_at: string
          data: string
          id: string
          observacao: string
          pessoa_id: string
        }
        Insert: {
          autor?: string | null
          created_at?: string
          data?: string
          id?: string
          observacao: string
          pessoa_id: string
        }
        Update: {
          autor?: string | null
          created_at?: string
          data?: string
          id?: string
          observacao?: string
          pessoa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "observacoes_internas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: Database["public"]["Enums"]["app_perfil"]
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: Database["public"]["Enums"]["app_perfil"]
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: Database["public"]["Enums"]["app_perfil"]
        }
        Relationships: []
      }
      pessoas: {
        Row: {
          created_at: string
          data_ingresso_corrente: string | null
          data_nascimento: string | null
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          possui_mensalidade: boolean
          situacao: string
          telefone: string | null
          tipo_vinculo: string | null
        }
        Insert: {
          created_at?: string
          data_ingresso_corrente?: string | null
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          possui_mensalidade?: boolean
          situacao?: string
          telefone?: string | null
          tipo_vinculo?: string | null
        }
        Update: {
          created_at?: string
          data_ingresso_corrente?: string | null
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          possui_mensalidade?: boolean
          situacao?: string
          telefone?: string | null
          tipo_vinculo?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
          perfil: Database["public"]["Enums"]["app_perfil"]
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          nome: string
          perfil?: Database["public"]["Enums"]["app_perfil"]
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          perfil?: Database["public"]["Enums"]["app_perfil"]
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_usuarios: { Args: never; Returns: number }
      has_perfil: {
        Args: {
          _perfil: Database["public"]["Enums"]["app_perfil"]
          _user_id: string
        }
        Returns: boolean
      }
      is_usuario_ativo: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_perfil:
        | "congal"
        | "tesouraria"
        | "secretaria"
        | "biblioteca"
        | "almoxarifado"
        | "acervo"
      origem_lancamento: "manual" | "extrato"
      status_mensalidade: "pago" | "em_aberto"
      tipo_financeiro: "entrada" | "saida"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_perfil: [
        "congal",
        "tesouraria",
        "secretaria",
        "biblioteca",
        "almoxarifado",
        "acervo",
      ],
      origem_lancamento: ["manual", "extrato"],
      status_mensalidade: ["pago", "em_aberto"],
      tipo_financeiro: ["entrada", "saida"],
    },
  },
} as const
