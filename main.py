import bcrypt
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from database import engine, get_db, Base

# Cria as tabelas automaticamente se não existirem
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Avaliação - Marketing API")

# Libera acesso do frontend (ajuste para o domínio real quando for pra produção)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # em produção, troque "*" pela URL do seu frontend
    allow_methods=["*"],
    allow_headers=["*"],
)


def hash_senha(senha: str) -> str:
    return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar_senha(senha: str, senha_hash: str) -> bool:
    return bcrypt.checkpw(senha.encode("utf-8"), senha_hash.encode("utf-8"))


@app.on_event("startup")
def seed_analista():
    """Garante que existe sempre um usuário analista para o primeiro acesso."""
    db = next(get_db())
    existe = db.query(models.Usuario).filter(models.Usuario.role == "analista").first()
    if not existe:
        analista = models.Usuario(
            nome="Analista Marketing",
            username="analista",
            password_hash=hash_senha("marketing2024"),
            role="analista",
        )
        db.add(analista)
        db.commit()


# ==============================
# AUTH
# ==============================
@app.post("/api/login", response_model=schemas.UsuarioOut)
def login(dados: schemas.LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.username == dados.username).first()
    if not usuario or not verificar_senha(dados.password, usuario.password_hash):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos.")
    return usuario


# ==============================
# AVALIADORES
# ==============================
@app.get("/api/avaliadores", response_model=list[schemas.AvaliadorOut])
def listar_avaliadores(db: Session = Depends(get_db)):
    avaliadores = db.query(models.Usuario).filter(models.Usuario.role == "avaliador").all()
    resultado = []
    for av in avaliadores:
        total = db.query(models.Avaliacao).filter(models.Avaliacao.avaliador_id == av.id).count()
        resultado.append(schemas.AvaliadorOut(
            id=av.id, nome=av.nome, username=av.username, total_avaliacoes=total
        ))
    return resultado


@app.post("/api/avaliadores", response_model=schemas.UsuarioOut)
def criar_avaliador(dados: schemas.AvaliadorCreate, db: Session = Depends(get_db)):
    existe = db.query(models.Usuario).filter(models.Usuario.username == dados.username).first()
    if existe:
        raise HTTPException(status_code=400, detail="Usuário já existe.")
    novo = models.Usuario(
        nome=dados.nome,
        username=dados.username,
        password_hash=hash_senha(dados.password),
        role="avaliador",
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


@app.delete("/api/avaliadores/{avaliador_id}")
def remover_avaliador(avaliador_id: int, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == avaliador_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Avaliador não encontrado.")
    db.delete(usuario)
    db.commit()
    return {"ok": True}


# ==============================
# ATIVIDADES
# ==============================
@app.get("/api/atividades", response_model=list[schemas.AtividadeOut])
def listar_atividades(db: Session = Depends(get_db)):
    return db.query(models.Atividade).order_by(models.Atividade.created_at.desc()).all()


@app.post("/api/atividades", response_model=schemas.AtividadeOut)
def criar_atividade(dados: schemas.AtividadeCreate, criado_por: int, db: Session = Depends(get_db)):
    nova = models.Atividade(
        semana=dados.semana, titulo=dados.titulo, descricao=dados.descricao, criado_por=criado_por
    )
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova


@app.delete("/api/atividades/{atividade_id}")
def remover_atividade(atividade_id: int, db: Session = Depends(get_db)):
    atividade = db.query(models.Atividade).filter(models.Atividade.id == atividade_id).first()
    if not atividade:
        raise HTTPException(status_code=404, detail="Atividade não encontrada.")
    db.delete(atividade)
    db.commit()
    return {"ok": True}


# ==============================
# LINKS
# ==============================
@app.get("/api/links", response_model=list[schemas.LinkOut])
def listar_links(db: Session = Depends(get_db)):
    links = db.query(models.Link).order_by(models.Link.created_at.desc()).all()
    resultado = []
    for l in links:
        total = db.query(models.Avaliacao).filter(models.Avaliacao.link_id == l.id).count()
        resultado.append(schemas.LinkOut(
            id=l.id, semana=l.semana, titulo=l.titulo, url=l.url,
            created_at=l.created_at, total_avaliacoes=total
        ))
    return resultado


@app.post("/api/links", response_model=schemas.LinkOut)
def criar_link(dados: schemas.LinkCreate, criado_por: int, db: Session = Depends(get_db)):
    novo = models.Link(semana=dados.semana, titulo=dados.titulo, url=dados.url, criado_por=criado_por)
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return schemas.LinkOut(
        id=novo.id, semana=novo.semana, titulo=novo.titulo, url=novo.url,
        created_at=novo.created_at, total_avaliacoes=0
    )


@app.delete("/api/links/{link_id}")
def remover_link(link_id: int, db: Session = Depends(get_db)):
    link = db.query(models.Link).filter(models.Link.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link não encontrado.")
    db.delete(link)  # cascade remove as avaliações desse link também
    db.commit()
    return {"ok": True}


# ==============================
# AVALIAÇÕES
# ==============================
@app.get("/api/avaliacoes", response_model=list[schemas.AvaliacaoOut])
def listar_avaliacoes(avaliador_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Avaliacao)
    if avaliador_id is not None:
        query = query.filter(models.Avaliacao.avaliador_id == avaliador_id)
    avaliacoes = query.all()
    return [
        schemas.AvaliacaoOut(
            id=a.id, link_id=a.link_id, avaliador_id=a.avaliador_id,
            precificacao=a.precificacao, organizacao=a.organizacao,
            execucao=a.execucao, criatividade=a.criatividade, total=a.total,
        ) for a in avaliacoes
    ]


@app.post("/api/avaliacoes", response_model=schemas.AvaliacaoOut)
def criar_avaliacao(dados: schemas.AvaliacaoCreate, db: Session = Depends(get_db)):
    for campo in [dados.precificacao, dados.organizacao, dados.execucao, dados.criatividade]:
        if campo < 0 or campo > 5:
            raise HTTPException(status_code=400, detail="Cada critério deve ser entre 0 e 5.")

    existente = db.query(models.Avaliacao).filter(
        models.Avaliacao.link_id == dados.link_id,
        models.Avaliacao.avaliador_id == dados.avaliador_id,
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Você já avaliou este link.")

    nova = models.Avaliacao(
        link_id=dados.link_id,
        avaliador_id=dados.avaliador_id,
        precificacao=dados.precificacao,
        organizacao=dados.organizacao,
        execucao=dados.execucao,
        criatividade=dados.criatividade,
    )
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return schemas.AvaliacaoOut(
        id=nova.id, link_id=nova.link_id, avaliador_id=nova.avaliador_id,
        precificacao=nova.precificacao, organizacao=nova.organizacao,
        execucao=nova.execucao, criatividade=nova.criatividade, total=nova.total,
    )


# ==============================
# RANKING
# ==============================
@app.get("/api/ranking", response_model=list[schemas.RankingItem])
def ranking(db: Session = Depends(get_db)):
    links = db.query(models.Link).all()
    resultado = []
    for l in links:
        avaliacoes = db.query(models.Avaliacao).filter(models.Avaliacao.link_id == l.id).all()
        count = len(avaliacoes)
        total_pts = sum(a.total for a in avaliacoes)
        media = lambda campo: round(sum(getattr(a, campo) for a in avaliacoes) / count, 1) if count else 0.0
        resultado.append(schemas.RankingItem(
            link_id=l.id, semana=l.semana, titulo=l.titulo, url=l.url,
            total_pts=total_pts, count=count,
            media_precificacao=media("precificacao"),
            media_organizacao=media("organizacao"),
            media_execucao=media("execucao"),
            media_criatividade=media("criatividade"),
        ))
    resultado.sort(key=lambda r: r.total_pts, reverse=True)
    return resultado


@app.post("/api/ranking/zerar")
def zerar_ranking(db: Session = Depends(get_db)):
    db.query(models.Avaliacao).delete()
    db.query(models.Link).delete()
    db.commit()
    return {"ok": True}
