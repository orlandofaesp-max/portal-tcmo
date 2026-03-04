import { useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileDown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssociados, useMensalidades, formatCurrency, meses } from "@/hooks/useFinanceiro";
import { cn } from "@/lib/utils";

const ExtratoAssociado = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const { data: associados = [] } = useAssociados();
  const { data: mensalidades = [] } = useMensalidades();

  const associado = associados.find((a) => a.id === id);
  const ano = new Date().getFullYear();

  const extrato = useMemo(() => {
    if (!associado) return { rows: [], totalMensalidade: 0, totalPagamento: 0, saldoFinal: 0 };

    const mensDeste = mensalidades.filter(
      (m) => m.associado_id === associado.id && m.competencia.endsWith(`/${ano}`)
    );

    const rows: { periodo: string; mensalidade: number; pagamento: number; dataPag: string; saldoAcum: number }[] = [];
    let saldo = 0;

    // Saldo anterior
    if (associado.saldo_anterior !== 0) {
      if (associado.saldo_anterior > 0) {
        saldo = associado.saldo_anterior;
        rows.push({ periodo: String(ano - 1), mensalidade: associado.saldo_anterior, pagamento: 0, dataPag: "", saldoAcum: saldo });
      } else {
        saldo = associado.saldo_anterior;
        rows.push({ periodo: String(ano - 1), mensalidade: 0, pagamento: Math.abs(associado.saldo_anterior), dataPag: "", saldoAcum: saldo });
      }
    }

    meses.forEach((mes, idx) => {
      const comp = `${String(idx + 1).padStart(2, "0")}/${ano}`;
      const m = mensDeste.find((x) => x.competencia === comp);
      const valorMens = associado.mensalidade_valor;
      const pago = m?.status === "pago" ? m.valor : 0;
      saldo = saldo + valorMens - pago;
      rows.push({
        periodo: mes,
        mensalidade: valorMens,
        pagamento: pago,
        dataPag: m?.data_pagamento || "",
        saldoAcum: saldo,
      });
    });

    const totalMensalidade = rows.reduce((s, r) => s + r.mensalidade, 0);
    const totalPagamento = rows.reduce((s, r) => s + r.pagamento, 0);

    return { rows, totalMensalidade, totalPagamento, saldoFinal: saldo };
  }, [associado, mensalidades, ano]);

  const handleExportPDF = () => {
    const content = printRef.current;
    if (!content || !associado) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Extrato - ${associado.nome}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; background: #fff; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #c9a961; padding-bottom: 16px; }
        .header h1 { font-size: 18px; color: #c9a961; letter-spacing: 2px; }
        .header h2 { font-size: 14px; color: #444; margin-top: 4px; }
        .header p { font-size: 12px; color: #888; margin-top: 4px; }
        .info-box { background: #f8f6f0; border: 1px solid #e8e2d0; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #555; }
        .highlight { font-weight: 600; }
        .devedor { color: #dc3545; }
        .credito { color: #28a745; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f0ebe0; color: #8b7a56; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; padding: 8px 12px; text-align: right; border-bottom: 2px solid #d4c9a8; }
        th:first-child { text-align: left; }
        td { padding: 7px 12px; border-bottom: 1px solid #eee; font-size: 12px; text-align: right; }
        td:first-child { text-align: left; }
        .paid { color: #28a745; font-weight: 500; }
        .unpaid { color: #ccc; }
        .positive { color: #dc3545; }
        .negative { color: #28a745; }
        .total-row { font-weight: 700; border-top: 2px solid #c9a961; background: #faf8f3; }
        .total-row td { padding: 10px 12px; }
        .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
      </style></head><body>
      <div class="header">
        <h1>TCMO</h1>
        <h2>EXTRATO DE MENSALIDADES — ${ano}</h2>
        <p>Emitido em ${new Date().toLocaleDateString("pt-BR")}</p>
      </div>
      ${content.innerHTML}
      <div class="footer">Tesouraria TCMO — Documento gerado automaticamente</div>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  if (!associado) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">Associado não encontrado.</p>
      </div>
    );
  }

  const { rows, totalMensalidade, totalPagamento, saldoFinal } = extrato;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate("/tesouraria/associados")} className="text-muted-foreground hover:text-card-foreground gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button size="sm" onClick={handleExportPDF} className="bg-gradient-gold text-primary-foreground hover:opacity-90 gap-2">
          <FileDown className="w-3.5 h-3.5" /> Gerar PDF
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden max-w-2xl mx-auto">
        <div className="px-8 py-6 border-b border-border text-center bg-muted/20">
          <h2 className="text-lg font-bold text-primary tracking-widest">TCMO</h2>
          <p className="text-sm text-card-foreground mt-1">EXTRATO DE MENSALIDADES — {ano}</p>
          <p className="text-xs text-muted-foreground mt-1">Emitido em {new Date().toLocaleDateString("pt-BR")}</p>
        </div>

        <div ref={printRef} className="px-8 py-6">
          {associado.saldo_anterior !== 0 && (
            <div className="bg-muted/30 border border-border rounded-lg px-4 py-3 mb-5 text-xs text-muted-foreground">
              {associado.saldo_anterior > 0
                ? <span>Iniciou o ano de {ano} com <span className="font-semibold text-destructive">SALDO DEVEDOR de {formatCurrency(associado.saldo_anterior)}</span></span>
                : <span>Iniciou o ano de {ano} com <span className="font-semibold text-success">CRÉDITO de {formatCurrency(Math.abs(associado.saldo_anterior))}</span></span>
              }
            </div>
          )}

          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-2 px-3">{associado.nome}</th>
                <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-2 px-3">Mensalidade</th>
                <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-2 px-3">Pagamento</th>
                <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-2 px-3">Data</th>
                <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-2 px-3">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="py-2 px-3 text-xs text-card-foreground font-medium">{r.periodo}</td>
                  <td className="py-2 px-3 text-xs text-right font-mono text-muted-foreground">
                    {r.mensalidade > 0 ? formatCurrency(r.mensalidade) : "—"}
                  </td>
                  <td className={cn("py-2 px-3 text-xs text-right font-mono", r.pagamento > 0 ? "text-success font-medium" : "text-muted-foreground/40")}>
                    {r.pagamento > 0 ? formatCurrency(r.pagamento) : "—"}
                  </td>
                  <td className="py-2 px-3 text-xs text-right font-mono text-muted-foreground">
                    {r.dataPag || "—"}
                  </td>
                  <td className={cn("py-2 px-3 text-xs text-right font-mono font-medium",
                    r.saldoAcum > 0 ? "text-destructive" : r.saldoAcum < 0 ? "text-success" : "text-card-foreground"
                  )}>
                    {r.saldoAcum < 0 ? `-${formatCurrency(Math.abs(r.saldoAcum))}` : formatCurrency(r.saldoAcum)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-primary bg-muted/20">
                <td className="py-3 px-3 text-xs font-bold text-card-foreground">TOTAL</td>
                <td className="py-3 px-3 text-xs text-right font-mono font-bold text-card-foreground">{formatCurrency(totalMensalidade)}</td>
                <td className="py-3 px-3 text-xs text-right font-mono font-bold text-success">{formatCurrency(totalPagamento)}</td>
                <td className="py-3 px-3 text-xs text-right font-mono text-muted-foreground">{ano}</td>
                <td className={cn("py-3 px-3 text-xs text-right font-mono font-bold",
                  saldoFinal > 0 ? "text-destructive" : saldoFinal < 0 ? "text-success" : "text-card-foreground"
                )}>
                  {saldoFinal < 0 ? `-${formatCurrency(Math.abs(saldoFinal))}` : formatCurrency(saldoFinal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExtratoAssociado;
