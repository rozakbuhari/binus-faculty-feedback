import "reflect-metadata";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";
import { Category } from "../entities/Category";
import bcrypt from "bcryptjs";

async function runSeeders() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected for seeding...");

    const userRepository = AppDataSource.getRepository(User);
    const categoryRepository = AppDataSource.getRepository(Category);

    // Seed Categories
    const categories = [
      { categoryName: "Academic", description: "Issues related to academic matters, curriculum, and teaching quality" },
      { categoryName: "Administration", description: "Administrative processes, documentation, and bureaucracy" },
      { categoryName: "Student Affairs", description: "Student activities, organizations, and welfare" },
      { categoryName: "Facilities", description: "Campus facilities, infrastructure, and maintenance" },
      { categoryName: "IT Services", description: "Technology, systems, and digital services" },
      { categoryName: "Financial", description: "Tuition, scholarships, and financial matters" },
      { categoryName: "Library", description: "Library services, resources, and facilities" },
      { categoryName: "Other", description: "Other feedback and suggestions" },
    ];

    for (const cat of categories) {
      const existingCategory = await categoryRepository.findOne({
        where: { categoryName: cat.categoryName },
      });
      if (!existingCategory) {
        await categoryRepository.save(categoryRepository.create(cat));
        console.log(`Category "${cat.categoryName}" created`);
      }
    }

    // Seed Users
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const users = [
      {
        name: "System Administrator",
        email: "admin@faculty.edu",
        password: hashedPassword,
        role: UserRole.FACULTY_ADMIN,
      },
      {
        name: "Academic Unit",
        email: "unit@faculty.edu",
        password: await bcrypt.hash("unit123", 10),
        role: UserRole.RELATED_UNIT,
      },
      {
        name: "Faculty Dean",
        email: "leader@faculty.edu",
        password: await bcrypt.hash("leader123", 10),
        role: UserRole.FACULTY_LEADERSHIP,
      },
      {
        name: "John Doe",
        email: "user@faculty.edu",
        password: userPassword,
        role: UserRole.END_USER,
      },
      {
        name: "Jane Smith",
        email: "jane@faculty.edu",
        password: userPassword,
        role: UserRole.END_USER,
      },
    ];

    for (const userData of users) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });
      if (!existingUser) {
        await userRepository.save(userRepository.create(userData));
        console.log(`User "${userData.email}" created`);
      }
    }

    console.log("Seeding completed successfully!");
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

runSeeders();
