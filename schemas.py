from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ---------- Auth ----------
class LoginRequest(BaseModel):
    username: str
    password: str


class UsuarioOut(BaseModel):
    id: int
    nome: str
    username: str
    role: str

    class Config:
        from_attributes = True


# ---------- Avaliadores ----------
class AvaliadorCreate(BaseModel):
    nome: str
    username: str
    password: str


class AvaliadorOut(BaseModel):
    id: int
    nome: str
    username: str
    total_avaliacoes: int = 0

    class Config:
        from_attributes = True


# ---------- Atividades ----------
class AtividadeCreate(BaseModel):
    semana: str
    titulo: str
    descricao: Optional[str] = None


class AtividadeOut(BaseModel):
    id: int
    semana: str
    titulo: str
    descricao: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Links ----------
class LinkCreate(BaseModel):
    semana: str
    titulo: str
    url: str
    atividade_id: Optional[int] = None


class LinkOut(BaseModel):
    id: int
    semana: str
    titulo: str
    url: str
    atividade_id: Optional[int] = None
    created_at: datetime
    total_avaliacoes: int = 0

    class Config:
        from_attributes = True


# ---------- Avaliações ----------
class AvaliacaoCreate(BaseModel):
    link_id: int
    avaliador_id: int
    precificacao: int
    organizacao: int
    execucao: int
    criatividade: int


class AvaliacaoOut(BaseModel):
    id: int
    link_id: int
    avaliador_id: int
    precificacao: int
    organizacao: int
    execucao: int
    criatividade: int
    total: int

    class Config:
        from_attributes = True


# ---------- Ranking ----------
class RankingItem(BaseModel):
    link_id: int
    semana: str
    titulo: str
    url: str
    total_pts: int
    count: int
    media_precificacao: float
    media_organizacao: float
    media_execucao: float
    media_criatividade: float
