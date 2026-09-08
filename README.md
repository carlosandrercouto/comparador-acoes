# Comparador de Ações "Buy and Hold"

Aplicação Web Fullstack focada na análise e comparação fundamentalista de ações brasileiras (B3), auxiliando investidores na formação de uma carteira previdenciária e de renda passiva (Value Investing).

## Arquitetura

O projeto é dividido em dois módulos principais:

*   **Frontend (`/frontend`)**: Desenvolvido em **React + Vite** com **Tailwind CSS v4**. Interface amigável, nativa em *Dark Mode*, contendo regras visuais de faróis (Verde, Amarelo, Vermelho) para cada métrica fundamentalista.
*   **Backend (`/backend`)**: Desenvolvido em **Python + FastAPI**. Ele atua como um Web Scraper assíncrono que busca as métricas atualizadas em tempo real do portal *Investidor10* utilizando o `BeautifulSoup4`.

## Como Executar o Projeto

Para visualizar a aplicação corretamente, é necessário rodar os dois serviços (Backend e Frontend) simultaneamente em abas separadas do terminal.

### 1. Rodando o Backend (API)
O backend rodará na porta `8000` fornecendo as cotações em tempo real.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Rodando o Frontend (UI)
O frontend rodará na porta `5173` (padrão do Vite).

```bash
cd frontend
npm install
npm run dev
```

Abra o seu navegador e acesse: `http://localhost:5173`. Digite os tickers desejados (ex: `BBSE3`, `PETR4`, `TAEE11`) e clique em "Analisar Ativos".

## Regras de Pontuação (Score)

O comparador gera um "Score" de 0 a 5 com base nas métricas extraídas:
*   **Setor Perene**: +1 ponto para setores como Energia, Saneamento, Finanças e Seguros.
*   **Lucros Consistentes**: +1 se a empresa não apresentou prejuízos nos últimos 5 anos.
*   **Dívida Líquida/EBITDA**: +1 se for menor que 2.0x (ou 3.5x para elétricas).
*   **ROE**: +1 se for maior que 15% (ou 10% para estatais).
*   **P/L**: +1 se estiver na faixa ideal entre 5 e 15.
*   **Dividend Yield**: +1 se estiver na faixa ideal sustentável entre 6% e 10%.