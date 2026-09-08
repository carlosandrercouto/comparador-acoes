import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Tooltip from './Tooltip';
import ScoreBadge from './ScoreBadge';
import { calculateScore } from '../utils/scoring';

export default function ComparisonTable({ tickers, onBack }) {
  const [stocksData, setStocksData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const promises = tickers.map(t => 
          fetch(`http://localhost:8000/api/stocks/${t}`)
            .then(res => {
              if (!res.ok) throw new Error(`Falha ao buscar ${t}`);
              return res.json();
            })
            .then(data => ({ data, ...calculateScore(data) }))
            .catch(err => {
              console.error(err);
              return null; // Ignore failed requests for now
            })
        );
        
        const results = await Promise.all(promises);
        setStocksData(results.filter(Boolean));
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tickers]);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[50vh] text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="text-lg font-medium">Extraindo dados em tempo real...</p>
      </div>
    );
  }

  if (stocksData.length === 0) {
    return (
      <div className="w-full text-center py-20 text-slate-300">
        Nenhum dado encontrado para as ações selecionadas.
        <br/><button onClick={onBack} className="mt-4 text-emerald-500 underline">Voltar</button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (status === 'green') return 'text-emerald-400';
    if (status === 'yellow') return 'text-amber-400';
    if (status === 'red') return 'text-rose-400';
    return 'text-slate-300';
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Dashboard de Comparação</h2>
          <p className="text-slate-400 text-sm mt-1">Análise fundamentalista das ações selecionadas</p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium text-sm border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Nova Pesquisa
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 bg-slate-950/50 border-b border-slate-800 text-slate-400 font-semibold text-sm w-1/4">
                  Indicadores
                </th>
                {stocksData.map(item => (
                  <th key={item.data.ticker} className="p-4 bg-slate-950/50 border-b border-slate-800 text-center border-l border-slate-800/50">
                    <a 
                      href={`https://investidor10.com.br/acoes/${item.data.ticker.toLowerCase()}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-bold text-slate-100 hover:text-emerald-400 hover:underline transition-colors inline-block"
                      title="Ver no Investidor10"
                    >
                      {item.data.ticker}
                    </a>
                    <div className="text-sm font-normal text-slate-400 mt-1">
                      R$ {item.data.cotacao_atual?.toFixed(2) || '-'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {/* Setor */}
              <tr className="hover:bg-slate-800/20 transition-colors">
                <td className="p-4 text-sm text-slate-300">
                  <Tooltip message="Setores perenes (energia, saneamento, bancos, seguros) tendem a ser mais resilientes.">
                    Setor & Segmento
                  </Tooltip>
                </td>
                {stocksData.map((item, idx) => (
                  <td key={idx} className="p-4 text-center border-l border-slate-800/50">
                    <ScoreBadge 
                      status={item.analysis.setor?.status} 
                      value={item.data.governanca?.setor || '-'} 
                      tooltipMsg={item.analysis.setor?.message}
                    />
                  </td>
                ))}
              </tr>

              {/* Histórico Lucros */}
              <tr className="hover:bg-slate-800/20 transition-colors">
                <td className="p-4 text-sm text-slate-300">
                  <Tooltip message="CAGR de Lucros de 5 anos. Crescimento constante é vital para dividendos crescentes.">
                    Crescimento Lucros (5a)
                  </Tooltip>
                </td>
                {stocksData.map((item, idx) => (
                  <td key={idx} className="p-4 text-center border-l border-slate-800/50">
                    <ScoreBadge 
                      status={item.analysis.lucros?.status} 
                      value={`${item.data.consistencia_lucros?.cagr_lucro_5_anos?.toFixed(1) || '-'}%`} 
                      tooltipMsg={item.analysis.lucros?.message}
                    />
                  </td>
                ))}
              </tr>

              {/* Dívida Líquida / EBITDA */}
              <tr className="hover:bg-slate-800/20 transition-colors">
                <td className="p-4 text-sm text-slate-300">
                  <Tooltip message="Ideal abaixo de 2x (ou 3.5x para utilities). Bancos não possuem esta métrica.">
                    Dív. Líq / EBITDA
                  </Tooltip>
                </td>
                {stocksData.map((item, idx) => (
                  <td key={idx} className="p-4 text-center border-l border-slate-800/50">
                    <ScoreBadge 
                      status={item.analysis.divida?.status} 
                      value={item.data.solvencia?.divida_liquida_ebitda ?? 'N/A'} 
                      tooltipMsg={item.analysis.divida?.message}
                    />
                  </td>
                ))}
              </tr>

              {/* ROE */}
              <tr className="hover:bg-slate-800/20 transition-colors">
                <td className="p-4 text-sm text-slate-300">
                  <Tooltip message="Retorno sobre Patrimônio Líquido. Ideal > 15% (ou > 10% para estatais).">
                    ROE
                  </Tooltip>
                </td>
                {stocksData.map((item, idx) => (
                  <td key={idx} className="p-4 text-center border-l border-slate-800/50">
                    <ScoreBadge 
                      status={item.analysis.roe?.status} 
                      value={`${item.data.rentabilidade?.roe?.toFixed(1) || '-'}%`} 
                      tooltipMsg={item.analysis.roe?.message}
                    />
                  </td>
                ))}
              </tr>

              {/* P/L */}
              <tr className="hover:bg-slate-800/20 transition-colors">
                <td className="p-4 text-sm text-slate-300">
                  <Tooltip message="Preço / Lucro. Ideal entre 5x e 15x. Indica quantos anos para reaver o capital.">
                    P/L
                  </Tooltip>
                </td>
                {stocksData.map((item, idx) => (
                  <td key={idx} className="p-4 text-center border-l border-slate-800/50">
                    <ScoreBadge 
                      status={item.analysis.pl?.status} 
                      value={`${item.data.valuation?.pl?.toFixed(2) || '-'}`} 
                      tooltipMsg={item.analysis.pl?.message}
                    />
                  </td>
                ))}
              </tr>

              {/* DY */}
              <tr className="hover:bg-slate-800/20 transition-colors">
                <td className="p-4 text-sm text-slate-300">
                  <Tooltip message="Dividend Yield 12m. Ideal entre 6% e 10% para não ser insustentável.">
                    Dividend Yield
                  </Tooltip>
                </td>
                {stocksData.map((item, idx) => (
                  <td key={idx} className="p-4 text-center border-l border-slate-800/50">
                    <ScoreBadge 
                      status={item.analysis.dy?.status} 
                      value={`${item.data.proventos?.dividend_yield_12m?.toFixed(1) || '-'}%`} 
                      tooltipMsg={item.analysis.dy?.message}
                    />
                  </td>
                ))}
              </tr>

            </tbody>
            <tfoot className="bg-slate-950/80 border-t-2 border-slate-800">
              <tr>
                <td className="p-5 font-bold text-slate-100 text-lg">
                  Score Final
                </td>
                {stocksData.map((item, idx) => (
                  <td key={idx} className="p-5 text-center border-l border-slate-800/50">
                    <div className="flex flex-col items-center">
                      <span className={`text-3xl font-black ${item.score >= 4 ? 'text-emerald-400' : item.score >= 2 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {item.score}/5
                      </span>
                      <span className="text-xs text-slate-500 font-medium uppercase mt-1 tracking-wider">
                        Pontos
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
