from src.dbmodels import Base
from src.dbscripts import db_session, engine

'''В этом файле описана логика главная логика 
взаимодействия апи запросов, отправленных с front-а запросов и бд'''

Base.metadata.create_all(bind=engine)

# Создаем подключение к бд
def get_db():
    db = db_session()
    try:
        yield db
    finally:
        db.close()