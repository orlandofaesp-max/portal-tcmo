import { useState, useEffect } from "react";
import { Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type AppPerfil = Database["public"]["Enums"]["app_perfil"];

interface Funcionalidade {
  id: string;
  modulo: string;
  nome_funcionalidade: string;
  rota: string | null;
}

interface Permissao {
  id?: string;
  perfil: string;
  funcionalidade_id: string;
  visualizar: boolean;
  editar: boolean;
  excluir: boolean;
}

const perfilLabels: Record<string, string> = {
  administrador: "Administrador",
  congal: "Congal",
  tesouraria: "Tesouraria",
  secretaria: "Secretaria",
  biblioteca: "Biblioteca",
  almoxarifado: "Almoxarifado",
  acervo: "Acervo",
};

const moduloLabels: Record<string, string> = {
  administracao: "Administração",
  tesouraria: "Tesouraria",
  secretaria: "Secretaria",
  biblioteca: "Biblioteca",
  almoxarifado: "Almoxarifado",
  acervo: "Acervo",
};

const GerenciarPermissoes = () => {
  const [perfilSelecionado, setPerfilSelecionado] = useState<string>("tesouraria");
  const [funcionalidades, setFuncionalidades] = useState<Funcionalidade[]>([]);
  const [permissoes, setPermissoes] = useState<Record<string, Permissao>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const fetchData = async () => {
    const { data: funcs } = await supabase.from("funcionalidades").select("id, modulo, nome_funcionalidade, rota").eq("ativo", true).order("modulo").order("nome_funcionalidade");
    if (funcs) setFuncionalidades(funcs);

    const { data: perms } = await supabase.from("permissoes_config").select("*").eq("perfil", perfilSelecionado);
    const map: Record<string, Permissao> = {};
    if (perms) {
      perms.forEach((p: any) => {
        map[p.funcionalidade_id] = p;
      });
    }
    setPermissoes(map);
  };

  useEffect(() => { fetchData(); }, [perfilSelecionado]);

  const togglePerm = (funcId: string, field: "visualizar" | "editar" | "excluir") => {
    setPermissoes(prev => {
      const existing = prev[funcId] || { perfil: perfilSelecionado, funcionalidade_id: funcId, visualizar: false, editar: false, excluir: false };
      return { ...prev, [funcId]: { ...existing, [field]: !existing[field] } };
    });
  };

  const handleSave = async () => {
    setSaving(true);

    // Delete existing permissions for this profile
    await supabase.from("permissoes_config").delete().eq("perfil", perfilSelecionado);

    // Insert all permissions
    const rows = Object.values(permissoes).filter(p => p.visualizar || p.editar || p.excluir).map(p => ({
      perfil: perfilSelecionado,
      funcionalidade_id: p.funcionalidade_id,
      visualizar: p.visualizar,
      editar: p.editar,
      excluir: p.excluir,
    }));

    if (rows.length > 0) {
      const { error } = await supabase.from("permissoes_config").insert(rows);
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    toast({ title: "Permissões salvas com sucesso!" });
    setSaving(false);
  };

  const filteredFuncs = funcionalidades.filter(f =>
    f.nome_funcionalidade.toLowerCase().includes(search.toLowerCase()) ||
    f.modulo.toLowerCase().includes(search.toLowerCase())
  );

  // Group by module
  const grouped = filteredFuncs.reduce((acc, f) => {
    if (!acc[f.modulo]) acc[f.modulo] = [];
    acc[f.modulo].push(f);
    return acc;
  }, {} as Record<string, Funcionalidade[]>);

  if (!isAdmin) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Acesso restrito.</p></div>;
  }

  return (
    <div>
      <PageHeader title="Permissões" subtitle="Configure permissões por perfil e funcionalidade">
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
          <Save className="w-4 h-4 mr-2" /> {saving ? "Salvando..." : "Salvar Permissões"}
        </Button>
      </PageHeader>

      <div className="flex gap-4 mb-6">
        <div className="w-48">
          <Select value={perfilSelecionado} onValueChange={setPerfilSelecionado}>
            <SelectTrigger className="bg-card border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Constants.public.Enums.app_perfil.map(p => (
                <SelectItem key={p} value={p}>{perfilLabels[p] || p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar funcionalidade..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Funcionalidade</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Visualizar</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Editar</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Excluir</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([modulo, funcs]) => (
                <>
                  <tr key={`header-${modulo}`} className="bg-muted/50">
                    <td colSpan={4} className="px-5 py-2 text-xs font-bold text-primary uppercase tracking-wider">
                      {moduloLabels[modulo] || modulo}
                    </td>
                  </tr>
                  {funcs.map(f => {
                    const perm = permissoes[f.id] || { visualizar: false, editar: false, excluir: false };
                    return (
                      <tr key={f.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3 text-sm text-card-foreground">{f.nome_funcionalidade}</td>
                        <td className="px-3 py-3 text-center">
                          <Checkbox checked={perm.visualizar} onCheckedChange={() => togglePerm(f.id, "visualizar")} />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Checkbox checked={perm.editar} onCheckedChange={() => togglePerm(f.id, "editar")} />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Checkbox checked={perm.excluir} onCheckedChange={() => togglePerm(f.id, "excluir")} />
                        </td>
                      </tr>
                    );
                  })}
                </>
              ))}
              {filteredFuncs.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhuma funcionalidade encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GerenciarPermissoes;
