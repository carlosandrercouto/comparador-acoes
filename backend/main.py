from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from scraper import scrape_acao

app = FastAPI(title="Comparador Previdenciário API")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to localhost:5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/stocks/{ticker}")
def get_stock(ticker: str):
    data = scrape_acao(ticker)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data
