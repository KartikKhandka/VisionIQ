from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import BaseModel

class Category(BaseModel):
    __tablename__ = "categories"
    name = Column(String, unique=True, index=True, nullable=False)
    products = relationship("Product", back_populates="category")

class Brand(BaseModel):
    __tablename__ = "brands"
    name = Column(String, unique=True, index=True, nullable=False)
    products = relationship("Product", back_populates="brand")

class Product(BaseModel):
    __tablename__ = "products"
    
    category_id = Column(ForeignKey("categories.id"), nullable=False)
    brand_id = Column(ForeignKey("brands.id"), nullable=False)
    model_number = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    
    category = relationship("Category", back_populates="products")
    brand = relationship("Brand", back_populates="products")
    manuals = relationship("Manual", back_populates="product")
    specifications = relationship("Specification", back_populates="product")

class Manual(BaseModel):
    __tablename__ = "manuals"
    
    product_id = Column(ForeignKey("products.id"), nullable=False)
    title = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    language = Column(String, default="en")
    
    product = relationship("Product", back_populates="manuals")

class Specification(BaseModel):
    __tablename__ = "specifications"
    
    product_id = Column(ForeignKey("products.id"), nullable=False)
    key = Column(String, nullable=False)
    value = Column(String, nullable=False)
    
    product = relationship("Product", back_populates="specifications")
