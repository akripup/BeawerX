from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, Annotated

class UserModel(BaseModel):
    id: int
    user_name: str
    user_password: str
    avatar_url: Optional[str] = None
    login: str
    age: Optional[int] = None
    life_status: Optional[str] = None
    class Config:
        from_attributes = True

class PostModel(BaseModel):
    id: int
    author_id: int = None
    author: UserModel =None
    date: datetime = None
    title: Optional[str] = None
    body: str = None
    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    author_login: str = None
    title: str = None
    body: str = None
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    user_name: Annotated[str, Field(..., title='Имя пользователя', min_length = 2)]
    user_password: Annotated[str, Field(..., title='Пароль пользователя', min_length = 2)]
    login: Annotated[str, Field(..., title='Логин пользователя', min_length = 2)]
    age: Annotated[int, Field(title='Возраст пользователя', ge=0, le=120)]
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    user_password: Annotated[str, Field(..., title='Пароль пользователя', min_length = 2)]
    login: Annotated[str, Field(..., title='Логин пользователя', min_length = 2)]
    class Config:
        from_attributes = True

