from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # 'analista' ou 'avaliador'
    created_at = Column(DateTime, server_default=func.now())

    avaliacoes = relationship("Avaliacao", back_populates="avaliador", cascade="all, delete-orphan")


class Atividade(Base):
    __tablename__ = "atividades"

    id = Column(Integer, primary_key=True, index=True)
    semana = Column(String(100), nullable=False)
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text, nullable=True)
    criado_por = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Link(Base):
    __tablename__ = "links"

    id = Column(Integer, primary_key=True, index=True)
    semana = Column(String(100), nullable=False)
    titulo = Column(String(200), nullable=False)
    url = Column(String(500), nullable=False)
    criado_por = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    atividade_id = Column(Integer, ForeignKey("atividades.id"), nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now())

    avaliacoes = relationship("Avaliacao", back_populates="link", cascade="all, delete-orphan")


class Avaliacao(Base):
    __tablename__ = "avaliacoes"

    id = Column(Integer, primary_key=True, index=True)
    link_id = Column(Integer, ForeignKey("links.id"), nullable=False)
    avaliador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    precificacao = Column(Integer, nullable=False)
    organizacao = Column(Integer, nullable=False)
    execucao = Column(Integer, nullable=False)
    criatividade = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    link = relationship("Link", back_populates="avaliacoes")
    avaliador = relationship("Usuario", back_populates="avaliacoes")

    __table_args__ = (
        UniqueConstraint("link_id", "avaliador_id", name="uq_avaliacao_link_avaliador"),
    )

    @property
    def total(self):
        return self.precificacao + self.organizacao + self.execucao + self.criatividade
