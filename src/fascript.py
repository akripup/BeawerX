'''В этом модуле описана логика обработки api запросов'''
from fastapi.middleware.cors import CORSMiddleware
from src.famodels import PostModel, UserModel, PostCreate, UserCreate, UserLogin
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from src.main import get_db
from src.dbmodels import DBPostModel, DBUserModel

app = FastAPI()
#TODO
#Добавить аннотации для макс длинны символов


# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "null"],  # Разрешить все источники (для разработки)
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы
    allow_headers=["*"],  # Разрешить все заголовки
    expose_headers=["*"]
)


@app.get("/")
async def root():
    return {"message": "Hello World"}

# получаем ленту новостей
@app.get("/api/feed")
async def get_feeddb(db: Session = Depends(get_db)) -> List[PostModel]:
    db_posts = db.query(DBPostModel)
    # Ищем самые новые посты
    db_posts.order_by(DBPostModel.date.desc())
    # сколько постов выводить в ленте
    db_posts.limit(10)

    # ошибка если нет постов
    if db_posts is None:
        raise HTTPException(status_code=404, detail= 'Пользователь не найден')
    
    return db_posts

#TODO возможно следует изменить формат даты
@app.get("/api/search_post")
async def search_post(author_name: Optional[str] = Query(None, description= 'Имя автора поста'),
                    creation_date: Optional[datetime] = Query(None, description= 'Дата публикации поста в формате dd.mm.YYYY', examples ="01.01.1991"),
                    post_title:  Optional[str] = Query(None, description= 'Заголовок поста'),
                    db: Session = Depends(get_db)
                    ) -> List[PostModel]:
    # Добавляем фильтры только если параметры переданы
    query = db.query(DBPostModel).join(DBUserModel, DBPostModel.author_id == DBUserModel.id)
    
    if author_name:
        query = query.filter(DBUserModel.user_name.ilike(f"%{author_name}%"))
    
    if creation_date:
        # Фильтр по точной дате (можно изменить на диапазон)
        query = query.filter(DBPostModel.date == creation_date)
    
    if post_title:
        query = query.filter(DBPostModel.title.ilike(f"%{post_title}%"))
    
    # Получаем ВСЕ подходящие посты
    db_posts = query.all()

    if db_posts is None:
        raise HTTPException(status_code=404, detail= 'Пользователь не найден')
    
    return db_posts

@app.post("/api/create_post", response_model=PostModel)
async def create_post(new_post: PostCreate,
                    db: Session = Depends(get_db)) -> PostModel:
    db_user = db.query(DBUserModel).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail= 'Пользователь не найден')
    
    db_post = DBPostModel(
    author_id=db_user.id,   
    title=new_post.title,
    body=new_post.body,
    date=datetime.now()
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.post("/api/create_user", response_model= UserModel)
async def create_user(new_user: UserCreate, 
                    db: Session = Depends(get_db)) -> UserModel:
    db_user = DBUserModel(
        user_name = new_user.user_name,
        login = new_user.login,
        user_password = new_user.user_password,
        age = new_user.age,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

#TODO добавить try и -> и поменять respince model на новый класс
@app.post("/api/login")  # Ожидается ОДИН пользователь
async def login_user(
    logining_user: UserLogin,
    db: Session = Depends(get_db)
):
    password = logining_user.user_password
    login = logining_user.login

    # Ищем пользователя по точному совпадению логина и пароля
    db_user = db.query(DBUserModel).filter(
        DBUserModel.login == login,
        DBUserModel.user_password == password
    ).first() 

    if db_user is None:
        raise HTTPException(status_code=404, detail= 'Пользователь не найден')
    
    access_token = {'access_token': login + '+' + password,
                    'my_user_name': db_user.user_name}
    
    return access_token

# #TODO
# @app.put("/api/edit_post")
# async def create_post(new_post: PostCreate) -> PostModel:
#     pass
# @app.put("/api/edit_user")
# async def create_post(new_post: PostCreate) -> PostModel:
#     pass
# @app.delete("/api/delete_post")
# async def create_post(new_post: PostCreate) -> PostModel:
#     pass
# @app.delete("/api/delete_user")
# async def create_post(new_post: PostCreate) -> PostModel:
#     pass