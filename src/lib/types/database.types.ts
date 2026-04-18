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
      archivos: {
        Row: {
          descripcion: string | null
          fecha_subida: string | null
          id: number
          nombre_original: string | null
          ruta: string | null
          tipo: string | null
        }
        Insert: {
          descripcion?: string | null
          fecha_subida?: string | null
          id?: number
          nombre_original?: string | null
          ruta?: string | null
          tipo?: string | null
        }
        Update: {
          descripcion?: string | null
          fecha_subida?: string | null
          id?: number
          nombre_original?: string | null
          ruta?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      beneficios: {
        Row: {
          descripcion: string | null
          empleado_id: number | null
          fecha_otorgado: string
          id: number
          monto: number | null
          tipo_beneficio_id: number | null
        }
        Insert: {
          descripcion?: string | null
          empleado_id?: number | null
          fecha_otorgado?: string
          id?: number
          monto?: number | null
          tipo_beneficio_id?: number | null
        }
        Update: {
          descripcion?: string | null
          empleado_id?: number | null
          fecha_otorgado?: string
          id?: number
          monto?: number | null
          tipo_beneficio_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficios_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficios_tipo_beneficio_id_fkey"
            columns: ["tipo_beneficio_id"]
            isOneToOne: false
            referencedRelation: "tipos_beneficio"
            referencedColumns: ["id"]
          },
        ]
      }
      cargos_sindicato: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      conyuges: {
        Row: {
          cuil: string | null
          empleado_id: number | null
          id: number
          nombre_completo: string | null
        }
        Insert: {
          cuil?: string | null
          empleado_id?: number | null
          id?: number
          nombre_completo?: string | null
        }
        Update: {
          cuil?: string | null
          empleado_id?: number | null
          id?: number
          nombre_completo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conyuges_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
        ]
      }
      empleados: {
        Row: {
          activo: boolean
          afiliado: boolean
          cargo_sindicato_id: number | null
          cuil: string
          dni: string
          domicilio: string | null
          email: string | null
          empresa_id: number | null
          fecha_alta: string
          fecha_baja: string | null
          id: number
          legajo: string | null
          localidad_id: number | null
          nombre_completo: string
          numero_afiliado: number | null
          telefono_celular: string | null
          telefono_fijo: string | null
        }
        Insert: {
          activo?: boolean
          afiliado?: boolean
          cargo_sindicato_id?: number | null
          cuil: string
          dni: string
          domicilio?: string | null
          email?: string | null
          empresa_id?: number | null
          fecha_alta?: string
          fecha_baja?: string | null
          id?: number
          legajo?: string | null
          localidad_id?: number | null
          nombre_completo: string
          numero_afiliado?: number | null
          telefono_celular?: string | null
          telefono_fijo?: string | null
        }
        Update: {
          activo?: boolean
          afiliado?: boolean
          cargo_sindicato_id?: number | null
          cuil?: string
          dni?: string
          domicilio?: string | null
          email?: string | null
          empresa_id?: number | null
          fecha_alta?: string
          fecha_baja?: string | null
          id?: number
          legajo?: string | null
          localidad_id?: number | null
          nombre_completo?: string
          numero_afiliado?: number | null
          telefono_celular?: string | null
          telefono_fijo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empleados_cargo_sindicato_id_fkey"
            columns: ["cargo_sindicato_id"]
            isOneToOne: false
            referencedRelation: "cargos_sindicato"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empleados_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empleados_localidad_id_fkey"
            columns: ["localidad_id"]
            isOneToOne: false
            referencedRelation: "localidades"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      facturas: {
        Row: {
          archivo_id: number | null
          beneficio_id: number | null
          fecha: string | null
          id: number
          monto: number | null
          numero_factura: string | null
          proveedor: string | null
        }
        Insert: {
          archivo_id?: number | null
          beneficio_id?: number | null
          fecha?: string | null
          id?: number
          monto?: number | null
          numero_factura?: string | null
          proveedor?: string | null
        }
        Update: {
          archivo_id?: number | null
          beneficio_id?: number | null
          fecha?: string | null
          id?: number
          monto?: number | null
          numero_factura?: string | null
          proveedor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facturas_beneficio_id_fkey"
            columns: ["beneficio_id"]
            isOneToOne: false
            referencedRelation: "beneficios"
            referencedColumns: ["id"]
          },
        ]
      }
      hijos: {
        Row: {
          cuil: string | null
          empleado_id: number | null
          escolaridad: string | null
          fecha_nacimiento: string
          id: number
          nombre_completo: string
        }
        Insert: {
          cuil?: string | null
          empleado_id?: number | null
          escolaridad?: string | null
          fecha_nacimiento: string
          id?: number
          nombre_completo: string
        }
        Update: {
          cuil?: string | null
          empleado_id?: number | null
          escolaridad?: string | null
          fecha_nacimiento?: string
          id?: number
          nombre_completo?: string
        }
        Relationships: [
          {
            foreignKeyName: "hijos_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
        ]
      }
      localidades: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      padres_empleado: {
        Row: {
          empleado_id: number | null
          id: number
          nombre_madre: string | null
          nombre_padre: string | null
        }
        Insert: {
          empleado_id?: number | null
          id?: number
          nombre_madre?: string | null
          nombre_padre?: string | null
        }
        Update: {
          empleado_id?: number | null
          id?: number
          nombre_madre?: string | null
          nombre_padre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "padres_empleado_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: number
          nombre: string | null
        }
        Insert: {
          id?: number
          nombre?: string | null
        }
        Update: {
          id?: number
          nombre?: string | null
        }
        Relationships: []
      }
      tipos_beneficio: {
        Row: {
          categoria: string | null
          id: number
          nombre: string
        }
        Insert: {
          categoria?: string | null
          id?: number
          nombre: string
        }
        Update: {
          categoria?: string | null
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          activo: boolean | null
          fecha_alta: string
          id: number
          password_hash: string
          rol_id: number | null
          username: string
        }
        Insert: {
          activo?: boolean | null
          fecha_alta?: string
          id?: number
          password_hash: string
          rol_id?: number | null
          username: string
        }
        Update: {
          activo?: boolean | null
          fecha_alta?: string
          id?: number
          password_hash?: string
          rol_id?: number | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
