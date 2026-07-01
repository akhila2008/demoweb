import { Request, Response } from 'express';
import { prisma } from '../index';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    });
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

// Admin only
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, type, fabric, color, images, stock, categoryId } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        type,
        fabric,
        color,
        images,
        stock: Number(stock),
        categoryId
      }
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// Admin only
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// Admin only
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};
