from src.dbmodels import Base
from src.dbscripts import db_session, engine
    

'''В этом файле описана главная логика 
взаимодействия апи запросов, отправленных с front-а запросов и работы бд'''

Base.metadata.create_all(bind=engine)

# Создаем подключение к бд

def get_db():
    db = db_session()
    try:
        yield db
    finally:
        db.close()