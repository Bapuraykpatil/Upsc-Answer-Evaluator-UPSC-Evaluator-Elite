# # # backend/main.py

# # from __future__ import annotations

# # from contextlib import asynccontextmanager

# # from fastapi import FastAPI
# # from fastapi.middleware.cors import CORSMiddleware

# # from .config import settings
# # from .database import init_db

# # # Import routers (expected to exist at these paths)
# # from .api.auth.routes import router as auth_router
# # from .api.users.routes import router as users_router
# # from .api.questions.routes import router as questions_router
# # from .api.submissions.routes import router as submissions_router
# # from .api.evaluations.routes import router as evaluations_router


# # @asynccontextmanager
# # async def lifespan(app: FastAPI):
# #     """
# #     Runs on app startup/shutdown.
# #     - Initializes DB (optional create_all for dev)
# #     """
# #     # In dev you can auto-create tables; in prod use Alembic.
# #     create_tables = settings.ENV.lower() == "dev"
# #     await init_db(create_tables=create_tables)

# #     yield

# #     # Shutdown hooks (close redis connections etc.) can be added here.


# # def create_app() -> FastAPI:
# #     app = FastAPI(
# #         title=settings.PROJECT_NAME,
# #         debug=settings.DEBUG,
# #         lifespan=lifespan,
# #     )

# #     # CORS
# #     app.add_middleware(
# #         CORSMiddleware,
# #         allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
# #         allow_credentials=True,
# #         allow_methods=["*"],
# #         allow_headers=["*"],
# #     )

# #     # Health check
# #     @app.get("/health", tags=["system"])
# #     async def health():
# #         return {"status": "ok", "project": settings.PROJECT_NAME, "env": settings.ENV}
# #     app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],  # later restrict in prod
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )


# #     # API routers
# #     app.include_router(auth_router, prefix=settings.API_V1_PREFIX, tags=["auth"])
# #     app.include_router(users_router, prefix=settings.API_V1_PREFIX, tags=["users"])
# #     app.include_router(questions_router, prefix=settings.API_V1_PREFIX, tags=["questions"])
# #     app.include_router(submissions_router, prefix=settings.API_V1_PREFIX, tags=["submissions"])
# #     app.include_router(evaluations_router, prefix=settings.API_V1_PREFIX, tags=["evaluations"])

# #     return app


# # app = create_app()
# # from fastapi.responses import RedirectResponse

# # @app.get("/", include_in_schema=False)
# # async def root():
# #     return RedirectResponse(url="/docs")
# # from fastapi.middleware.cors import CORSMiddleware

# # backend/main.py

# # backend/main.py

# # backend/main.py

# # from __future__ import annotations
# # from contextlib import asynccontextmanager

# # from fastapi import FastAPI
# # from fastapi.middleware.cors import CORSMiddleware
# # from fastapi.responses import RedirectResponse

# # from .config import settings
# # from .database import init_db

# # from .api.auth.routes import router as auth_router
# # from .api.users.routes import router as users_router
# # from .api.questions.routes import router as questions_router
# # from .api.submissions.routes import router as submissions_router
# # from .api.evaluations.routes import router as evaluations_router


# # @asynccontextmanager
# # async def lifespan(app: FastAPI):
# #     create_tables = settings.ENV.lower() == "dev"
# #     await init_db(create_tables=create_tables)
# #     yield


# # def create_app() -> FastAPI:
# #     app = FastAPI(
# #         title=settings.PROJECT_NAME,
# #         debug=settings.DEBUG,
# #         lifespan=lifespan,
# #     )

# #     # ✅ REQUIRED & CORRECT CORS CONFIG
# #    from fastapi.middleware.cors import CORSMiddleware

# # origins = [
# #     "http://192.168.0.101:5500",  # your frontend
# #     "http://192.168.0.107:5500",
# #     "http://localhost:5500",
# #     "http://127.0.0.1:5500",
# # ]

# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=origins,          # must include the exact Origin
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# #     # Health check
# #     @app.get("/health", tags=["system"])
# #     async def health():
# #         return {
# #             "status": "ok",
# #             "project": settings.PROJECT_NAME,
# #             "env": settings.ENV,
# #         }

# #     # API routers
# #     app.include_router(auth_router, prefix=settings.API_V1_PREFIX, tags=["auth"])
# #     app.include_router(users_router, prefix=settings.API_V1_PREFIX, tags=["users"])
# #     app.include_router(questions_router, prefix=settings.API_V1_PREFIX, tags=["questions"])
# #     app.include_router(submissions_router, prefix=settings.API_V1_PREFIX, tags=["submissions"])
# #     app.include_router(evaluations_router, prefix=settings.API_V1_PREFIX, tags=["evaluations"])

# #     return app


# # app = create_app()


# # @app.get("/", include_in_schema=False)
# # async def root():
# #     return RedirectResponse(url="/docs")
# from __future__ import annotations
# from contextlib import asynccontextmanager

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import RedirectResponse

# from .config import settings
# from .database import init_db

# from .api.auth.routes import router as auth_router
# from .api.users.routes import router as users_router
# from .api.questions.routes import router as questions_router
# from .api.submissions.routes import router as submissions_router
# from .api.evaluations.routes import router as evaluations_router


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     create_tables = settings.ENV.lower() == "dev"
#     await init_db(create_tables=create_tables)
#     yield


# def create_app() -> FastAPI:
#     app = FastAPI(
#         title=settings.PROJECT_NAME,
#         debug=settings.DEBUG,
#         lifespan=lifespan,
#     )

#     # origins = [
#     #     "http://192.168.0.101:5500",
#     #     "http://192.168.0.107:5500",
#     #     "http://localhost:5500",
#     #     "http://127.0.0.1:5500",
#     # ]
#     origins = [
#   "http://192.168.0.105:5500",
#   "http://192.168.0.101:5500",
#   "http://192.168.0.107:5500",
#   "http://localhost:5500",
#   "http://127.0.0.1:5500",
# ]

#     app.add_middleware(
#         CORSMiddleware,
#         allow_origins=origins,
#         allow_credentials=False,   # for Bearer token auth, this can be False
#         allow_methods=["*"],
#         allow_headers=["*"],
#     )

#     @app.get("/health", tags=["system"])
#     async def health():
#         return {"status": "ok", "project": settings.PROJECT_NAME, "env": settings.ENV}

#     app.include_router(auth_router, prefix=settings.API_V1_PREFIX, tags=["auth"])
#     app.include_router(users_router, prefix=settings.API_V1_PREFIX, tags=["users"])
#     app.include_router(questions_router, prefix=settings.API_V1_PREFIX, tags=["questions"])
#     app.include_router(submissions_router, prefix=settings.API_V1_PREFIX, tags=["submissions"])
#     app.include_router(evaluations_router, prefix=settings.API_V1_PREFIX, tags=["evaluations"])

#     return app


# app = create_app()


# @app.get("/", include_in_schema=False)
# async def root():
#     return RedirectResponse(url="/docs")
from __future__ import annotations
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from .config import settings
from .database import init_db

from .api.auth.routes import router as auth_router
from .api.users.routes import router as users_router
from .api.questions.routes import router as questions_router
from .api.submissions.routes import router as submissions_router
from .api.evaluations.routes import router as evaluations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables = settings.ENV.lower() == "dev"
    await init_db(create_tables=create_tables)
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.DEBUG,
        lifespan=lifespan,
    )

    origins = settings.CORS_ORIGINS or [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ]

    app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

    @app.get("/health", tags=["system"])
    async def health():
        return {
            "status": "ok",
            "project": settings.PROJECT_NAME,
            "env": settings.ENV,
        }

    app.include_router(auth_router, prefix=settings.API_V1_PREFIX, tags=["auth"])
    app.include_router(users_router, prefix=settings.API_V1_PREFIX, tags=["users"])
    app.include_router(questions_router, prefix=settings.API_V1_PREFIX, tags=["questions"])
    app.include_router(submissions_router, prefix=settings.API_V1_PREFIX, tags=["submissions"])
    app.include_router(evaluations_router, prefix=settings.API_V1_PREFIX, tags=["evaluations"])

    return app


app = create_app()


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")
