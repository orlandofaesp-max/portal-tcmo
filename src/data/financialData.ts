// Mock data based on the uploaded spreadsheets

export interface Membro {
  id: string;
  numero: string;
  nome: string;
  mensalidadeValor: number;
  pagamentos: PagamentoMensalidade[];
  saldoAnterior: number; // positive = devedor, negative = crédito
}

export interface PagamentoMensalidade {
  id: string;
  mes: string;
  valor: number;
  dataPagamento: string | null;
}

export interface LancamentoCaixa {
  id: string;
  data: string;
  credito: number;
  debito: number;
  historico: string;
  categoria: string;
  saldo: number;
}

export interface MovimentoFinanceiro {
  categoria: string;
  valores: Record<string, number>;
}

export interface ComposicaoSaldo {
  numerariosCaixa: number;
  saldoContaCorrente: number;
  fundoReserva: number;
}

export const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

export const membros: Membro[] = [
  { id: '1', numero: '1', nome: 'Aiane', mensalidadeValor: 30, saldoAnterior: -30, pagamentos: [
    { id: 'p1-1', mes: 'JAN', valor: 0, dataPagamento: null },
    { id: 'p1-2', mes: 'FEV', valor: 60, dataPagamento: '03/02/26' },
  ]},
  { id: '2', numero: '2', nome: 'Ana Luísa', mensalidadeValor: 30, saldoAnterior: 0, pagamentos: [] },
  { id: '3', numero: '3', nome: 'Antonella', mensalidadeValor: 30, saldoAnterior: 30, pagamentos: [
    { id: 'p3-1', mes: 'JAN', valor: 60, dataPagamento: '05/01/26' },
    { id: 'p3-2', mes: 'FEV', valor: 30, dataPagamento: '27/02/26' },
  ]},
  { id: '4', numero: '4-5', nome: 'Balthazar / Denise', mensalidadeValor: 60, saldoAnterior: 0, pagamentos: [
    { id: 'p4-2', mes: 'FEV', valor: 120, dataPagamento: '10/02/26' },
  ]},
  { id: '5', numero: '6', nome: 'Carmen', mensalidadeValor: 30, saldoAnterior: 0, pagamentos: [
    { id: 'p5-1', mes: 'JAN', valor: 30, dataPagamento: '06/01/26' },
    { id: 'p5-2', mes: 'FEV', valor: 30, dataPagamento: '15/02/26' },
  ]},
  { id: '6', numero: '7', nome: 'Carolina', mensalidadeValor: 30, saldoAnterior: 0, pagamentos: [] },
  { id: '7', numero: '8', nome: 'Cristina', mensalidadeValor: 30, saldoAnterior: -30, pagamentos: [
    { id: 'p7-2', mes: 'FEV', valor: 60, dataPagamento: '12/02/26' },
  ]},
  { id: '8', numero: '9-10', nome: 'Cristine / Nicolau', mensalidadeValor: 60, saldoAnterior: 0, pagamentos: [
    { id: 'p8-2', mes: 'FEV', valor: 120, dataPagamento: '18/02/26' },
  ]},
  { id: '9', numero: '11', nome: 'Deyse', mensalidadeValor: 30, saldoAnterior: -20, pagamentos: [] },
  { id: '10', numero: '12-13', nome: 'Dionísio / Luciana', mensalidadeValor: 60, saldoAnterior: 0, pagamentos: [
    { id: 'p10-2', mes: 'FEV', valor: 720, dataPagamento: '05/02/26' },
  ]},
  { id: '11', numero: '14-15', nome: 'Edmar / Adriane', mensalidadeValor: 60, saldoAnterior: 0, pagamentos: [
    { id: 'p11-2', mes: 'FEV', valor: 60, dataPagamento: '20/02/26' },
  ]},
  { id: '12', numero: '16-17', nome: 'Eduardo / Deborah', mensalidadeValor: 60, saldoAnterior: 0, pagamentos: [
    { id: 'p12-2', mes: 'FEV', valor: 360, dataPagamento: '08/02/26' },
  ]},
  { id: '13', numero: '18', nome: 'Eneida', mensalidadeValor: 30, saldoAnterior: 0, pagamentos: [
    { id: 'p13-2', mes: 'FEV', valor: 60, dataPagamento: '14/02/26' },
  ]},
  { id: '14', numero: '19', nome: 'Gilmar', mensalidadeValor: 30, saldoAnterior: -20, pagamentos: [
    { id: 'p14-2', mes: 'FEV', valor: 340, dataPagamento: '02/02/26' },
  ]},
  { id: '15', numero: '20', nome: 'Goret', mensalidadeValor: 30, saldoAnterior: 680, pagamentos: [] },
  { id: '16', numero: '21', nome: 'Ivan Denardi', mensalidadeValor: 30, saldoAnterior: 0, pagamentos: [] },
  { id: '17', numero: '22-23', nome: 'Ivan Freo / Karolyn', mensalidadeValor: 60, saldoAnterior: 0, pagamentos: [] },
  { id: '18', numero: '24-25', nome: 'Joari / Franciele', mensalidadeValor: 60, saldoAnterior: 0, pagamentos: [
    { id: 'p18-2', mes: 'FEV', valor: 60, dataPagamento: '22/02/26' },
  ]},
  { id: '19', numero: '26', nome: 'Juliana', mensalidadeValor: 30, saldoAnterior: 0, pagamentos: [
    { id: 'p19-1', mes: 'JAN', valor: 30, dataPagamento: '15/01/26' },
    { id: 'p19-2', mes: 'FEV', valor: 30, dataPagamento: '17/02/26' },
  ]},
  { id: '20', numero: '27', nome: 'Karla', mensalidadeValor: 30, saldoAnterior: 0, pagamentos: [
    { id: 'p20-2', mes: 'FEV', valor: 90, dataPagamento: '25/02/26' },
  ]},
  { id: '21', numero: '28', nome: 'Luiz', mensalidadeValor: 30, saldoAnterior: 0, pagamentos: [
    { id: 'p21-1', mes: 'JAN', valor: 30, dataPagamento: '22/01/26' },
    { id: 'p21-2', mes: 'FEV', valor: 30, dataPagamento: '19/02/26' },
  ]},
  { id: '22', numero: '29-30', nome: 'Marcos / Clair', mensalidadeValor: 60, saldoAnterior: 0, pagamentos: [
    { id: 'p22-1', mes: 'JAN', valor: 60, dataPagamento: '23/01/26' },
    { id: 'p22-2', mes: 'FEV', valor: 60, dataPagamento: '21/02/26' },
  ]},
  { id: '23', numero: '31', nome: 'Maria Eduarda', mensalidadeValor: 30, saldoAnterior: 0, pagamentos: [
    { id: 'p23-1', mes: 'JAN', valor: 30, dataPagamento: '09/01/26' },
    { id: 'p23-2', mes: 'FEV', valor: 30, dataPagamento: '11/02/26' },
  ]},
  { id: '24', numero: '32', nome: 'Maria Luiza', mensalidadeValor: 30, saldoAnterior: 0, pagamentos: [
    { id: 'p24-1', mes: 'JAN', valor: 30, dataPagamento: '05/01/26' },
    { id: 'p24-2', mes: 'FEV', valor: 30, dataPagamento: '13/02/26' },
  ]},
  { id: '25', numero: '33', nome: 'Mariana', mensalidadeValor: 30, saldoAnterior: 0, pagamentos: [] },
  { id: '26', numero: '34-35', nome: 'Marlon / Eve', mensalidadeValor: 60, saldoAnterior: 0, pagamentos: [] },
  { id: '27', numero: '36', nome: 'Maurício', mensalidadeValor: 30, saldoAnterior: 30, pagamentos: [
    { id: 'p27-1', mes: 'JAN', valor: 30, dataPagamento: '05/01/26' },
    { id: 'p27-2', mes: 'FEV', valor: 30, dataPagamento: '16/02/26' },
  ]},
  { id: '28', numero: '37-38', nome: 'Orlando / Márcia', mensalidadeValor: 60, saldoAnterior: 0, pagamentos: [
    { id: 'p28-1', mes: 'JAN', valor: 60, dataPagamento: '29/01/26' },
    { id: 'p28-2', mes: 'FEV', valor: 60, dataPagamento: '23/02/26' },
  ]},
  { id: '29', numero: '39-40', nome: 'Rogério / Marelaine', mensalidadeValor: 60, saldoAnterior: 0, pagamentos: [
    { id: 'p29-1', mes: 'JAN', valor: 180, dataPagamento: '19/01/26' },
  ]},
  { id: '30', numero: '41', nome: 'Rosângela', mensalidadeValor: 30, saldoAnterior: 0, pagamentos: [
    { id: 'p30-2', mes: 'FEV', valor: 90, dataPagamento: '24/02/26' },
  ]},
  { id: '31', numero: '42', nome: 'Silmara', mensalidadeValor: 30, saldoAnterior: -65, pagamentos: [] },
  { id: '32', numero: '43', nome: 'Thaís', mensalidadeValor: 30, saldoAnterior: 159.08, pagamentos: [] },
  { id: '33', numero: '44-45', nome: 'Vagner / Santina', mensalidadeValor: 60, saldoAnterior: 190, pagamentos: [
    { id: 'p33-1', mes: 'JAN', valor: 190, dataPagamento: '08/01/26' },
  ]},
];

export const lancamentosCaixa: LancamentoCaixa[] = [
  { id: 'lc1', data: '01/01/26', credito: 0, debito: 0, historico: 'Saldo Anterior', categoria: 'Saldo', saldo: 22864.74 },
  { id: 'lc2', data: '02/01/26', credito: 50.00, debito: 0, historico: 'Contribuição - Roberto Rudnick', categoria: 'Contribuição', saldo: 22914.74 },
  { id: 'lc3', data: '05/01/26', credito: 30.00, debito: 0, historico: 'Mensalidade - Maria Luiza', categoria: 'Mensalidade', saldo: 22944.74 },
  { id: 'lc4', data: '05/01/26', credito: 30.00, debito: 0, historico: 'Mensalidade - Maurício', categoria: 'Mensalidade', saldo: 22974.74 },
  { id: 'lc5', data: '05/01/26', credito: 30.00, debito: 0, historico: 'Mensalidade - Antonela', categoria: 'Mensalidade', saldo: 23004.74 },
  { id: 'lc6', data: '06/01/26', credito: 30.00, debito: 0, historico: 'Mensalidade - Carmen', categoria: 'Mensalidade', saldo: 23034.74 },
  { id: 'lc7', data: '08/01/26', credito: 190.00, debito: 0, historico: 'Mensalidade Vagner/Santina', categoria: 'Mensalidade', saldo: 23224.74 },
  { id: 'lc8', data: '09/01/26', credito: 30.00, debito: 0, historico: 'Mensalidade Maria Eduarda', categoria: 'Mensalidade', saldo: 23254.74 },
  { id: 'lc9', data: '12/01/26', credito: 0, debito: 40.70, historico: 'Tarifa Bancária', categoria: 'Tarifa', saldo: 23214.04 },
  { id: 'lc10', data: '15/01/26', credito: 30.00, debito: 0, historico: 'Mensalidade Juliana', categoria: 'Mensalidade', saldo: 23244.04 },
  { id: 'lc11', data: '19/01/26', credito: 180.00, debito: 0, historico: 'Mensalidade Rogério/Marelaine', categoria: 'Mensalidade', saldo: 23424.04 },
  { id: 'lc12', data: '22/01/26', credito: 30.00, debito: 0, historico: 'Mensalidade Luiz', categoria: 'Mensalidade', saldo: 23454.04 },
  { id: 'lc13', data: '23/01/26', credito: 60.00, debito: 0, historico: 'Mensalidade Marcos/Clair', categoria: 'Mensalidade', saldo: 23514.04 },
  { id: 'lc14', data: '23/01/26', credito: 0, debito: 99.42, historico: 'Sanepar', categoria: 'Utilidade', saldo: 23414.62 },
  { id: 'lc15', data: '26/01/26', credito: 0, debito: 587.07, historico: 'Reembolso Homenagem Oxum - Mariana', categoria: 'Reembolso', saldo: 22827.55 },
  { id: 'lc16', data: '26/01/26', credito: 0, debito: 3189.19, historico: 'Reembolso Escada/Copel - Eduardo', categoria: 'Reembolso', saldo: 19638.36 },
  { id: 'lc17', data: '26/01/26', credito: 0, debito: 609.68, historico: 'Reembolso Despesas de Cartório - Baltha', categoria: 'Reembolso', saldo: 19028.68 },
  { id: 'lc18', data: '26/01/26', credito: 0, debito: 130.00, historico: 'Devolução Confraternização - Aiane', categoria: 'Evento', saldo: 18898.68 },
  { id: 'lc19', data: '27/01/26', credito: 0, debito: 1562.09, historico: 'Reembolso Confraternização - Balthazar', categoria: 'Evento', saldo: 17336.59 },
  { id: 'lc20', data: '27/01/26', credito: 0, debito: 350.23, historico: 'Cesta Natal p/ proprietária da Chácara', categoria: 'Evento', saldo: 16986.36 },
  { id: 'lc21', data: '27/01/26', credito: 0, debito: 3.46, historico: 'Tarifa Bancária', categoria: 'Tarifa', saldo: 16982.90 },
  { id: 'lc22', data: '29/01/26', credito: 60.00, debito: 0, historico: 'Mensalidade - Orlando/Marcia', categoria: 'Mensalidade', saldo: 17042.90 },
  { id: 'lc23', data: '30/01/26', credito: 30.00, debito: 0, historico: 'Mensalidade - Antonella', categoria: 'Mensalidade', saldo: 17072.90 },
  { id: 'lc24', data: '31/01/26', credito: 1.87, debito: 0, historico: 'Rendimento Aplicação Diária', categoria: 'Rendimento', saldo: 17074.77 },
];

export const resumoFinanceiro = {
  entradas: {
    JAN: {
      'Recebimento de Contribuições Terceiros': 50.00,
      'Recebimento Mensalidades Integr. TCMO': 730.00,
      'Rendimento Aplicação Diária (BB Rende Fácil)': 1.87,
      'Rendimento Conta Poupança': 1192.25,
    },
    FEV: {
      'Recebimento de Contribuições Terceiros': 550.00,
      'Recebimento Doações Integr. TCMO': 200.00,
      'Recebimento Mensalidades Integr. TCMO': 2470.00,
      'Recebimento Reembolso de Velas': 340.00,
      'Rendimento Aplicação Diária (BB Rende Fácil)': 19.60,
      'Rendimento Conta Poupança': 1185.36,
      'Venda de Caixas de Ovos': 70.00,
    },
  },
  saidas: {
    JAN: {
      'Cesta de Natal - proprietária trab. cachoeira': -350.23,
      'Copel': -99.19,
      'Custas Cartório': -609.68,
      'Despesas Confraternização': -1562.09,
      'Devolução Pagamento Confraternização': -130.00,
      'Escada Profissional': -3090.00,
      'Material Homenagem Oxum': -587.07,
      'Sanepar': -99.42,
      'Tarifa Bancária': -44.16,
    },
    FEV: {
      'Ar condicionado (manutenção)': -200.00,
      'Copel': -192.65,
      'Extintores (recarga)': -140.00,
      'Flores e Velas 7 dias - Trabalho de Praia': -128.50,
      'Imagens Lembrança Final do Ano + embalagens': -900.00,
      'Sanepar': -99.42,
      'Tarifa Bancária': -40.70,
      'Tarifa de Pix Enviado': -1.98,
      'Vistoria Bombeiros': -132.89,
    },
  },
  saldoAnterior: 200180.06,
  composicao: {
    JAN: { numerariosCaixa: 0, saldoContaCorrente: 17074.77, fundoReserva: 178507.57 },
    FEV: { numerariosCaixa: 0, saldoContaCorrente: 20073.59, fundoReserva: 178507.57 },
  },
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};
