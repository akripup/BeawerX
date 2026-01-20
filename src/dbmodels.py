from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from dbscripts import Base

class DBUserModel(Base): 
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, index=True)
    avatar_url = Column(String)
    login = Column(String, index=True)
    age = Column(Integer)
    life_status = Column(String)

class DBPostModel(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey('users.id'), index=True)
    author = relationship("DBUserModel") #, back_populates=True
    date = Column(DateTime, index=True)
    title = Column(String, index=True)
    body = Column(String)