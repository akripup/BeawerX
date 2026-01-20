from src.constans import SQL_DB_URL
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine(SQL_DB_URL)

db_session = sessionmaker(autoflush=False, autocommit=False, bind=engine)

Base = declarative_base()

