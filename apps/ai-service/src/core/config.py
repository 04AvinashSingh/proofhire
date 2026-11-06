
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    AI_SERVICE_PORT: int = 8000
    AI_SERVICE_HOST: str = "0.0.0.0"
    LOG_LEVEL: str = "info"
    LLM_PROVIDER: str = "mock"  # "mock" | "openai" | "anthropic" | "ollama"
    OPENAI_API_KEY: str | None = None
    ANTHROPIC_API_KEY: str | None = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    EMBEDDING_DIMENSION: int = 1536
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:4000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
