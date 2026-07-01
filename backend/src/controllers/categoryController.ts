import { Request, Response } from 'express';
import { prisma } from '../index';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    const categoryExists = await prisma.category.findUnique({ where: { name } });
    
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await prisma.category.create({
      data: { name, description }
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting category' });
  }
};
