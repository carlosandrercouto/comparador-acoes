// Regras de negócio e critérios de classificação

export const SECTORS = ['financeiro', 'energia', 'saneamento', 'seguro', 'utilidade pública'];

export function calculateScore(stock) {
  let score = 0;
  const analysis = {};

  // Setor Perene (Bancos, Energia, Saneamento, Seguros)
  const setor = (stock.governanca?.setor || '').toLowerCase();
  const isPerennial = SECTORS.some(s => setor.includes(s));
  
  if (isPerennial) {
    score += 1;
    analysis.setor = { status: 'green', message: 'Setor perene (+1 ponto)' };
  } else {
    analysis.setor = { status: 'yellow', message: 'Setor cíclico ou não-perene (0 pontos)' };
  }

  // Histórico de Lucros (5 anos)
  const todosAnosPositivos = stock.consistencia_lucros?.todos_anos_positivos;
  let hasHistoricLoss = false;
  if (todosAnosPositivos) {
    score += 1;
    analysis.lucros = { status: 'green', message: 'Lucros consistentes nos últimos 5 anos (+1 ponto)' };
  } else {
    hasHistoricLoss = true;
    analysis.lucros = { status: 'red', message: 'Histórico de prejuízo (ALERTA VERMELHO: Zera a nota final)' };
  }

  // Dívida Líquida / EBITDA
  const divida = stock.solvencia?.divida_liquida_ebitda;
  const isUtility = setor.includes('energia') || setor.includes('saneamento') || setor.includes('utilidade');
  
  if (divida === null || divida === undefined) {
    analysis.divida = { status: 'yellow', message: 'Dado não aplicável (ex: bancos)' };
  } else if (divida < (isUtility ? 3.5 : 2.0)) {
    score += 1;
    analysis.divida = { status: 'green', message: `Dívida saudável para o setor (+1 ponto)` };
  } else {
    analysis.divida = { status: 'red', message: 'Dívida elevada para o setor' };
  }

  // ROE
  const roe = stock.rentabilidade?.roe;
  const isStateOwned = stock.ticker.includes('PETR') || stock.ticker.includes('BBAS'); // Simple mock check for estatais
  const roeTarget = isStateOwned ? 10 : 15;
  
  if (roe && roe > roeTarget) {
    score += 1;
    analysis.roe = { status: 'green', message: `ROE acima de ${roeTarget}% (+1 ponto)` };
  } else {
    analysis.roe = { status: roe > 0 ? 'yellow' : 'red', message: `ROE abaixo de ${roeTarget}%` };
  }

  // P/L
  const pl = stock.valuation?.pl;
  if (pl >= 5 && pl <= 15) {
    score += 1;
    analysis.pl = { status: 'green', message: 'P/L dentro da faixa ideal de 5 a 15 (+1 ponto)' };
  } else {
    analysis.pl = { status: 'yellow', message: 'P/L fora da faixa ideal' };
  }

  // Dividend Yield
  const dy = stock.proventos?.dividend_yield_12m;
  if (dy >= 6 && dy <= 10) {
    score += 1;
    analysis.dy = { status: 'green', message: 'DY dentro da faixa ideal de 6% a 10% (+1 ponto)' };
  } else if (dy > 10) {
    analysis.dy = { status: 'yellow', message: 'DY muito alto (possível armadilha/não recorrente)' };
  } else {
    analysis.dy = { status: 'yellow', message: 'DY abaixo de 6%' };
  }

  // P/VP cruzado com ROE
  const pvp = stock.valuation?.pvp;
  if (pvp !== null && pvp !== undefined && roe !== null && roe !== undefined) {
    if ((pvp < 1.5 && roe > 10) || (pvp > 1.5 && roe > 15)) {
      score += 1;
      analysis.pvp = { status: 'green', message: 'Relação P/VP e ROE atrativa (+1 ponto)' };
    } else if (pvp < 1.0 && roe < 10) {
      score -= 1;
      analysis.pvp = { status: 'red', message: 'Alerta de Value Trap (P/VP < 1 e ROE baixo) (-1 ponto)' };
    } else {
      analysis.pvp = { status: 'yellow', message: 'P/VP dentro da normalidade para o ROE atual' };
    }
  } else {
    analysis.pvp = { status: 'yellow', message: 'Dados de P/VP ou ROE indisponíveis' };
  }

  // Calculo Final do Score (Escala 0 a 10)
  let rawScore = Math.max(0, score);
  let finalScore = (rawScore / 7) * 10;
  
  if (hasHistoricLoss) {
    finalScore = 0;
  }

  return {
    score: finalScore,
    rawScore: score,
    analysis
  };
}
