import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Em produção (Railway/Render) defina a variável de ambiente DATABASE_URL
# apontando para o PostgreSQL. Localmente, se não definir nada, usa SQLite
# num arquivo (sistema.db) só para você testar sem precisar instalar Postgres.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sistema.db")

# Ajuste necessário para SQLite funcionar com FastAPI
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
