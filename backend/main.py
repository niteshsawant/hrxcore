from fastapi import FastAPI

app = FastAPI(title="HRXCORE Backend")

@app.get("/health")
def health_check():
    return {"status": "ok"}
