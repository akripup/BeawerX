from src.constans import SQL_DB__URL
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import sqlite3

engine = create_engine(SQL_DB__URL, connect_args={'check_same_thread': False})

db_session = sessionmaker(autoflush=False, autocommit=False, bind=engine)

Base = declarative_base()

