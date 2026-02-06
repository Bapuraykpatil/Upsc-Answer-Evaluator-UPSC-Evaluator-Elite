# # backend/database.py

# from __future__ import annotations

# from typing import AsyncGenerator
# #from .db.models.email_otp import EmailOTP  # noqa: F401

# from sqlalchemy.ext.asyncio import (
#     AsyncEngine,
#     AsyncSession,
#     async_sessionmaker,
#     create_async_engine,
# )
# from sqlalchemy.orm import DeclarativeBase

# from .config import settings


# class Base(DeclarativeBase):
#     """Declarative base for all ORM models."""
#     pass


# def create_db_engine() -> AsyncEngine:
#     """
#     Creates the Async SQLAlchemy engine.
#     Works with:
#       - postgresql+asyncpg://...
#       - sqlite+aiosqlite:///...
#     """
#     url = settings.sqlalchemy_database_uri

#     # For SQLite, pool arguments differ. Keep it simple & safe:
#     connect_args = {}
#     engine_kwargs = {
#         "echo": settings.DB_ECHO,
#         "future": True,
#     }

#     if url.startswith("sqlite"):
#         # SQLite async: sqlite+aiosqlite:///./file.db
#         engine_kwargs["connect_args"] = {"check_same_thread": False}
#     else:
#         # Postgres/MySQL etc.
#         engine_kwargs.update(
#             {
#                 "pool_size": settings.DB_POOL_SIZE,
#                 "max_overflow": settings.DB_MAX_OVERFLOW,
#                 "pool_recycle": settings.DB_POOL_RECYCLE,
#                 "pool_pre_ping": True,
#             }
#         )

#     return create_async_engine(url, **engine_kwargs)


# engine: AsyncEngine = create_db_engine()

# AsyncSessionLocal = async_sessionmaker(
#     bind=engine,
#     class_=AsyncSession,
#     expire_on_commit=False,
#     autoflush=False,
#     autocommit=False,
# )


# async def get_db() -> AsyncGenerator[AsyncSession, None]:
#     """
#     FastAPI dependency:
#       async def route(db: AsyncSession = Depends(get_db)):
#           ...
#     """
#     async with AsyncSessionLocal() as session:
#         yield session


# async def init_db(create_tables: bool = False) -> None:
#     """
#     Initialize database.
#     In production, you typically use Alembic migrations instead of create_all.

#     If create_tables=True, it will create all tables for imported models.
#     """
#     if not create_tables:
#         return

#     # IMPORTANT: Import all models so SQLAlchemy knows them before create_all.
#     # Adjust imports to match your structure.
#     from .db.models.user import User  # noqa: F401
#     from .db.models.question import Question  # noqa: F401
#     from .db.models.submission import Submission  # noqa: F401
#     from .db.models.evaluation import Evaluation  # noqa: F401
#     from .db.models.score import Score  # noqa: F401
#     from .db.models.visual import Visual  # noqa: F401

#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)
#         from .db.models.email_otp import EmailOTP  # noqa: F401
#         async def init_db(create_tables: bool = False) -> None:
#     if not create_tables:
#         return

#     from .db.models.user import User  # noqa: F401
#     from .db.models.question import Question  # noqa: F401
#     from .db.models.submission import Submission  # noqa: F401
#     from .db.models.evaluation import Evaluation  # noqa: F401
#     from .db.models.score import Score  # noqa: F401
#     from .db.models.visual import Visual  # noqa: F401
#     from .db.models.email_otp import EmailOTP  # noqa: F401  ✅ add here only

#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)
from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from .config import settings


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


def create_db_engine() -> AsyncEngine:
    url = settings.sqlalchemy_database_uri

    engine_kwargs = {
        "echo": settings.DB_ECHO,
        "future": True,
    }

    if url.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    else:
        engine_kwargs.update(
            {
                "pool_size": settings.DB_POOL_SIZE,
                "max_overflow": settings.DB_MAX_OVERFLOW,
                "pool_recycle": settings.DB_POOL_RECYCLE,
                "pool_pre_ping": True,
            }
        )

    return create_async_engine(url, **engine_kwargs)


engine: AsyncEngine = create_db_engine()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db(create_tables: bool = False) -> None:
    if not create_tables:
        return

    # Import all models here (NOT at top) to avoid circular imports
    from .db.models.user import User  # noqa: F401
    from .db.models.question import Question  # noqa: F401
    from .db.models.submission import Submission  # noqa: F401
    from .db.models.evaluation import Evaluation  # noqa: F401
    from .db.models.score import Score  # noqa: F401
    from .db.models.visual import Visual  # noqa: F401
    from .db.models.email_otp import EmailOTP  # noqa: F401
    from .db.models.pending_registration import PendingRegistration  # noqa: F401
    from .db.models.pending_otp import PendingOTP  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    await engine.dispose()
