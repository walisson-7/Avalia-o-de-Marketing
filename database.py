import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Em produção (Railway/Render) defina a variável de ambiente DATABASE_URL
# apontando para o PostgreSQL. Localmente, se não definir nada, usa SQLite
# num arquivo (sistema.db) só para você testar sem precisar instalar Postgres.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sistema.db")

# Railway/Render entregam a URL como "postgres://" ou "postgresql://",
# mas usamos o driver psycopg v3 (mais compatível com Python novo),
# então precisamos indicar isso explicitamente pro SQLAlchemy.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

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
