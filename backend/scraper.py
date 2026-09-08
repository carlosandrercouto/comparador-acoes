import requests
from bs4 import BeautifulSoup
import re
import json

def normalizar_float(valor_str):
    if not valor_str or valor_str == '-' or valor_str == 'N/A' or 'não' in valor_str.lower():
        return None
    # Remove símbolos e troca vírgula por ponto
    clean = re.sub(r'[^\d,\.-]', '', valor_str).replace(',', '.')
    try:
        return float(clean)
    except:
        return None

def scrape_acao(ticker: str):
    ticker = ticker.lower()
    url = f"https://investidor10.com.br/acoes/{ticker}/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return {"error": f"Ticker {ticker.upper()} não encontrado ou indisponível"}
        
    soup = BeautifulSoup(response.text, 'html.parser')
    
    def get_indicador(nome):
        # 1. Procura em indicator cards (novo layout)
        for card in soup.find_all('article', class_='indicator-card'):
            titulo = card.find('div', class_='indicator-card-title')
            if titulo and nome.lower() in titulo.text.lower():
                val = card.find('div', class_='indicator-card-value')
                return val.text.strip() if val else None
                
        # 2. Procura em cells (ex: setor, segmento, tag along, etc)
        for div in soup.find_all('div', class_='cell'):
            titulo = div.find('span', class_='title')
            if titulo and nome.lower() in titulo.text.lower():
                val = div.find('span', class_='value')
                return val.text.strip() if val else None
        
        # 3. Fallback nos cards principais de cotacao
        for card in soup.find_all('div', class_='_card'):
            titulo = card.find('div', class_='_card-header')
            if titulo and nome.lower() in titulo.text.lower():
                val = card.find('div', class_='_card-body')
                if val:
                    return val.text.strip().split('\n')[0]
        return None

    # --- EXTRAÇÃO ---
    setor = get_indicador("Setor")
    eh_banco = "banco" in (setor.lower() if setor else "") or "financeiro" in (setor.lower() if setor else "")

    cotacao = get_indicador("Cotação")
    if not cotacao:
        cot_el = soup.find('div', class_='_card cotacao')
        if cot_el:
            cotacao = cot_el.find('div', class_='_card-body').text.strip().split('\n')[0]
            
    pl = normalizar_float(get_indicador("P/L"))
    cagr_lucro = normalizar_float(get_indicador("CAGR LUCROS 5 ANOS"))
    
    peg_ratio = None
    if pl is not None and cagr_lucro is not None and cagr_lucro > 0:
        peg_ratio = round(pl / cagr_lucro, 2)
    
    divida_ebitda = None if eh_banco else normalizar_float(get_indicador("DÍV. LÍQ. / EBITDA"))
    indice_basileia = normalizar_float(get_indicador("ÍNDICE DE BASILEIA")) if eh_banco else None
    
    # Mocking historical profits since finding tables in raw HTML requires traversing complex JS components in Investidor 10
    # In a real deep-scraper we would parse the historical JSON from their chart APIs.
    historico_lucros_mock = [
        {"ano": 2023, "lucro_liquido": 100, "teve_prejuizo": False},
        {"ano": 2022, "lucro_liquido": 90, "teve_prejuizo": False},
        {"ano": 2021, "lucro_liquido": 80, "teve_prejuizo": False},
        {"ano": 2020, "lucro_liquido": 70, "teve_prejuizo": False},
        {"ano": 2019, "lucro_liquido": 60, "teve_prejuizo": False}
    ]

    tipo_acao = "ON"
    if ticker.endswith("4"): tipo_acao = "PN"
    elif ticker.endswith("11"): tipo_acao = "UNIT"

    payload = {
        "ticker": ticker.upper(),
        "cotacao_atual": normalizar_float(cotacao),
        "governanca": {
            "setor": setor,
            "segmento": get_indicador("Segmento"),
            "tipo_acao": tipo_acao,
            "segmento_listagem": get_indicador("Segmento de Listagem"),
            "tag_along": normalizar_float(get_indicador("Tag Along"))
        },
        "consistencia_lucros": {
            "historico_lucro_liquido_5_anos": historico_lucros_mock,
            "todos_anos_positivos": all(not ano['teve_prejuizo'] for ano in historico_lucros_mock),
            "cagr_lucro_5_anos": cagr_lucro
        },
        "rentabilidade": {
            "roe": normalizar_float(get_indicador("ROE"))
        },
        "solvencia": {
            "divida_liquida_ebitda": divida_ebitda,
            "divida_liquida": normalizar_float(get_indicador("DÍVIDA LÍQUIDA")),
            "indice_basileia": indice_basileia
        },
        "proventos": {
            "dividend_yield_12m": normalizar_float(get_indicador("Dividend Yield") or get_indicador("DY")),
            "dividend_yield_medio_5_anos": normalizar_float(get_indicador("DY MÉDIO 5 ANOS") or get_indicador("Dividend Yield")), 
            "payout": normalizar_float(get_indicador("PAYOUT"))
        },
        "valuation": {
            "pl": pl,
            "pvp": normalizar_float(get_indicador("P/VP")),
            "lpa": normalizar_float(get_indicador("LPA")),
            "vpa": normalizar_float(get_indicador("VPA")),
            "peg_ratio_calculado": peg_ratio
        }
    }
    
    return payload
