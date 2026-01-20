from src.dbmodels import Base
from src.dbscripts import db_session, engine
import uvicorn
    

'''В этом файле описана главная логика 
взаимодействия апи запросов, отправленных с front-а запросов и работы бд'''

# Base.metadata.create_all(bind=engine)

# Создаем подключение к бд

def get_db():
    db = db_session()
    try:
        yield db
    finally:
        db.close()

uvicorn.run("fascript:app", host="0.0.0.0", port=8000, reload=True)