# Comparador de Ações "Buy and Hold"

Aplicação Web Fullstack focada na análise e comparação fundamentalista de ações brasileiras (B3), auxiliando investidores na formação de uma carteira previdenciária e de renda passiva (Value Investing).

## Arquitetura e Tecnologias

O projeto é dividido em dois módulos principais e está preparado para automação de CI/CD via GitHub Actions:

*   **Frontend (`/frontend`)**: Desenvolvido em **React + Vite** com **Tailwind CSS v4**. Interface amigável, nativa em *Dark Mode*, contendo regras visuais de faróis (Verde, Amarelo, Vermelho) para cada métrica fundamentalista. O código é configurado com variáveis de ambiente locais e *secrets* para rodar em produção.
*   **Backend (`/backend`)**: Desenvolvido em **Python + FastAPI**. Ele atua como um Web Scraper assíncrono que busca as métricas atualizadas em tempo real do portal *Investidor10* utilizando o `BeautifulSoup4`.
*   **CI/CD (`/.github/workflows`)**: Esteiras automatizadas do GitHub Actions para teste de sintaxe/build (`ci.yml`) e Deploy contínuo da UI para o GitHub Pages (`deploy-pages.yml`).

## Como Executar o Projeto Localmente

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
Antes de rodar a UI, certifique-se de criar o seu arquivo de ambiente local baseando-se no exemplo:
```bash
cd frontend
cp .env.example .env
```
O frontend rodará na porta `5173` (padrão do Vite).

```bash
npm install
npm run dev
```

Abra o seu navegador e acesse: `http://localhost:5173`. Digite os tickers desejados (ex: `BBSE3`, `PETR4`, `TAEE11`) e clique em "Analisar Ativos".

## Deploy em Produção

O projeto está otimizado para deploy 100% gratuito. Recomendamos:
1. **Frontend**: Publicação no GitHub Pages via GitHub Actions. O workflow injeta a variável secret `VITE_API_URL` automaticamente.
2. **Backend**: Publicação no Render.com, criando um *Web Service* (Python 3, `pip install -r requirements.txt`, com o start command `uvicorn main:app --host 0.0.0.0 --port $PORT`).

## Regras de Pontuação (Score de 0 a 10)

O comparador gera uma Nota de 0.0 a 10.0 com base nas métricas extraídas. A soma total tem pesos e redutores baseados nas regras estritas de Value Investing:

*   **Setor Perene**: +1 ponto para setores como Energia, Saneamento, Finanças e Seguros.
*   **Lucros Consistentes**: +1 ponto se não apresentou prejuízos na base histórica (Guarda especial: a nota total é zerada caso haja prejuízo!).
*   **Dívida Líquida/EBITDA**: +1 ponto se for menor que 2.0x (ou 3.5x para elétricas).
*   **ROE**: +1 ponto se for maior que 15% (ou 10% para estatais).
*   **P/L**: +1 ponto se estiver na faixa ideal entre 5x e 15x.
*   **Dividend Yield**: +1 ponto se estiver na faixa ideal sustentável entre 6% e 10%.
*   **P/VP (Value Trap)**: Avalia o P/VP cruzado com a rentabilidade (ROE). Soma 1 ponto em faixas descontadas e rentáveis, mantém neutro, ou **penaliza** (-1 ponto) em cenários clássicos de "Value Trap" (P/VP muito baixo com ROE deprimido).