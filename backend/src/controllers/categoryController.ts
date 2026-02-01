import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Category } from "../entities/Category";

const categoryRepository = () => AppDataSource.getRepository(Category);

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryRepository().find({
      where: { isActive: true },
      order: { categoryName: "ASC" },
    });

    return res.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await categoryRepository().findOne({
      where: { id: Number(id) },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json({ category });
  } catch (error) {
    console.error("Get category by id error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { categoryName, description } = req.body;

    const existingCategory = await categoryRepository().findOne({
      where: { categoryName },
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = categoryRepository().create({
      categoryName,
      description,
    });

    await categoryRepository().save(category);

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { categoryName, description, isActive } = req.body;

    const category = await categoryRepository().findOne({
      where: { id: Number(id) },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (categoryName) category.categoryName = categoryName;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await categoryRepository().save(category);

    return res.json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
