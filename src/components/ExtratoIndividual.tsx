import { useRef } from "react";
import { FileDown, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, meses, Membro } from "@/data/financialData";
import { cn } from "@/lib/utils";

interface ExtratoIndividualProps {
  membro: Membro;
  onBack: () => void;
  onSendWhatsApp: (m: Membro) => void;
}

const ExtratoIndividual = ({ membro, onBack, onSendWhatsApp }: ExtratoIndividualProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Extrato - ${membro.nome}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; background: #fff; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #c9a961; padding-bottom: 16px; }
        .header h1 { font-size: 18px; color: #c9a961; letter-spacing: 2px; }
        .header h2 { font-size: 14px; color: #444; margin-top: 4px; }
        .header p { font-size: 12px; color: #888; margin-top: 4px; }
        .info-box { background: #f8f6f0; border: 1px solid #e8e2d0; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #555; }
        .info-box .highlight { font-weight: 600; }
        .info-box .devedor { color: #dc3545; }
        .info-box .credito { color: #28a745; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f0ebe0; color: #8b7a56; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; padding: 8px 12px; text-align: right; border-bottom: 2px solid #d4c9a8; }
        th:first-child, th:nth-child(2) { text-align: left; }
        td { padding: 7px 12px; border-bottom: 1px solid #eee; font-size: 12px; text-align: right; }
        td:first-child, td:nth-child(2) { text-align: left; }
        .paid { color: #28a745; font-weight: 500; }
        .unpaid { color: #ccc; }
        .negative { color: #28a745; }
        .positive { color: #dc3545; }
        .total-row { font-weight: 700; border-top: 2px solid #c9a961; background: #faf8f3; }
        .total-row td { padding: 10px 12px; }
        .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
      </style></head><body>
      <div class="header">
        <h1>TCMO</h1>
        <h2>EXTRATO DE MENSALIDADES — 2026</h2>
        <p>Emitido em ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>
      ${content.innerHTML}
      <div class="footer">Tesouraria TCMO — Documento gerado automaticamente</div>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 300);
  };

  // Calculate running balance
  const calcExtrato = () => {
    const rows: { periodo: string; mensalidade: number; pagamento: number; dataPag: string; saldoAcum: number }[] = [];
    let saldo = 0;

    // Saldo anterior
    if (membro.saldoAnterior !== 0) {
      if (membro.saldoAnterior > 0) {
        // devedor
        saldo = membro.saldoAnterior;
        rows.push({ periodo: '2025', mensalidade: membro.saldoAnterior, pagamento: 0, dataPag: '', saldoAcum: saldo });
      } else {
        // crédito
        saldo = membro.saldoAnterior; // negative = crédito
        rows.push({ periodo: '2025', mensalidade: 0, pagamento: Math.abs(membro.saldoAnterior), dataPag: '', saldoAcum: saldo });
      }
    }

    meses.forEach(mes => {
      const pags = membro.pagamentos.filter(p => p.mes === mes);
      const totalPago = pags.reduce((s, p) => s + p.valor, 0);
      saldo = saldo + membro.mensalidadeValor - totalPago;
      rows.push({
        periodo: mes,
        mensalidade: membro.mensalidadeValor,
        pagamento: totalPago,
        dataPag: pags[0]?.dataPagamento || '',
        saldoAcum: saldo,
      });
    });

    const totalMensalidade = rows.reduce((s, r) => s + r.mensalidade, 0);
    const totalPagamento = rows.reduce((s, r) => s + r.pagamento, 0);

    return { rows, totalMensalidade, totalPagamento, saldoFinal: saldo };
  };

  const { rows, totalMensalidade, totalPagamento, saldoFinal } = calcExtrato();

  return (
    <div>
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-card-foreground gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onSendWhatsApp(membro)} className="border-border text-muted-foreground hover:text-success gap-2">
            <Send className="w-3.5 h-3.5" /> Enviar via WhatsApp
          </Button>
          <Button size="sm" onClick={handleExportPDF} className="bg-gradient-gold text-primary-foreground hover:opacity-90 gap-2">
            <FileDown className="w-3.5 h-3.5" /> Gerar PDF
          </Button>
        </div>
      </div>

      {/* Extrato Card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden max-w-2xl mx-auto">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border text-center bg-muted/20">
          <h2 className="text-lg font-bold text-primary tracking-widest">TCMO</h2>
          <p className="text-sm text-card-foreground mt-1">EXTRATO DE MENSALIDADES — 2026</p>
          <p className="text-xs text-muted-foreground mt-1">Emitido em {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div ref={printRef} className="px-8 py-6">
          {/* Info box */}
          {membro.saldoAnterior !== 0 && (
            <div className="info-box bg-muted/30 border border-border rounded-lg px-4 py-3 mb-5 text-xs text-muted-foreground">
              {membro.saldoAnterior > 0
                ? <span>Você iniciou o ano de 2026 com <span className="highlight font-semibold devedor text-destructive">SALDO DEVEDOR de {formatCurrency(membro.saldoAnterior)}</span></span>
                : <span>Você iniciou o ano de 2026 com <span className="highlight font-semibold credito text-success">CRÉDITO de {formatCurrency(Math.abs(membro.saldoAnterior))}</span></span>
              }
            </div>
          )}

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-2 px-3">{membro.nome}</th>
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
                    {r.mensalidade > 0 ? formatCurrency(r.mensalidade) : '—'}
                  </td>
                  <td className={cn("py-2 px-3 text-xs text-right font-mono", r.pagamento > 0 ? "paid text-success font-medium" : "unpaid text-muted-foreground/40")}>
                    {r.pagamento > 0 ? formatCurrency(r.pagamento) : '—'}
                  </td>
                  <td className="py-2 px-3 text-xs text-right font-mono text-muted-foreground">
                    {r.dataPag || '—'}
                  </td>
                  <td className={cn("py-2 px-3 text-xs text-right font-mono font-medium",
                    r.saldoAcum > 0 ? "positive text-destructive" : r.saldoAcum < 0 ? "negative text-success" : "text-card-foreground"
                  )}>
                    {r.saldoAcum < 0 ? `-${formatCurrency(Math.abs(r.saldoAcum))}` : formatCurrency(r.saldoAcum)}
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="total-row border-t-2 border-primary bg-muted/20">
                <td className="py-3 px-3 text-xs font-bold text-card-foreground">TOTAL</td>
                <td className="py-3 px-3 text-xs text-right font-mono font-bold text-card-foreground">{formatCurrency(totalMensalidade)}</td>
                <td className="py-3 px-3 text-xs text-right font-mono font-bold text-success">{formatCurrency(totalPagamento)}</td>
                <td className="py-3 px-3 text-xs text-right font-mono text-muted-foreground">2026</td>
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

export default ExtratoIndividual;
