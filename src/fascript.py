'''В этом модуле описана логика обработки api запросов'''
from src.famodels import PostModel, UserModel, PostCreate, UserCreate
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from src.main import get_db
from src.dbmodels import DBPostModel, DBUserModel

app = FastAPI()
#TODO
#Добавить аннотации для макс длинны символов


@app.get("/api/feed")
async def create_item():
    return 

#TODO возможно следует изменить формат даты
@app.get("/api/search_post")
async def search_post(author_name: Optional[str] = Query(None, description= 'Имя автора поста'),
                    creation_date: Optional[datetime] = Query(None, description= 'Дата публикации поста в формате dd.mm.YYYY', example="01.01.1991"),
                    post_title:  Optional[str] = Query(None, description= 'Заголовок поста')
                    ) -> List[PostModel]:
    filtered_posts = []
    for post in posts:
        should_include = True
        # Если пост не от этого автора - исключаем
        if author_name and post.author.user_name != author_name:
            should_include = False
        # Если дата поста не совпадает - исключаем  
        if creation_date and post.date != creation_date:
            should_include = False 
        # Если заголовок не содержит искомую строку - исключаем
        if post_title and post_title.lower() not in post.title.lower():
            should_include = False
        # Если все проверки пройдены - добавляем пост
        if should_include:
            filtered_posts.append(post)
    if filtered_posts:
        return filtered_posts
    raise HTTPException(status_code=404, detail='Пост не найден')

@app.post("/api/create_post", response_model=PostModel)
async def create_post(new_post: PostCreate, db: Session = Depends(get_db)) -> PostModel:
    db_user = db.query(DBUserModel).filter(DBUserModel.login == new_post.author_login).first()
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
async def create_user(new_user: UserCreate, db: Session = Depends(get_db)) -> UserModel:
    db_user = DBUserModel(
        user_name = new_user.user_name,
        avatar_url = new_user.avatar_url,
        login = new_user.login,
        age = new_user.age,
        life_status = new_user.life_status
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

#TODO
@app.put("/api/edit_post")
async def create_post(new_post: PostCreate) -> PostModel:
    pass
@app.put("/api/edit_user")
async def create_post(new_post: PostCreate) -> PostModel:
    pass
@app.delete("/api/delete_post")
async def create_post(new_post: PostCreate) -> PostModel:
    pass
@app.delete("/api/delete_user")
async def create_post(new_post: PostCreate) -> PostModel:
    pass