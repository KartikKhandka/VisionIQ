import os
from sqlalchemy import create_engine
from alembic.config import Config
from alembic import command
from models.base import BaseModel
import models.user
import models.product
import models.activity

if __name__ == "__main__":
    # Create an in-memory SQLite database
    engine = create_engine("sqlite:///:memory:")
    
    # Create all tables in the database to match the models
    BaseModel.metadata.create_all(engine)
    
    # Configure Alembic
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", "sqlite:///:memory:")
    
    # Run autogenerate
    command.revision(alembic_cfg, autogenerate=True, message="initial_migration")
