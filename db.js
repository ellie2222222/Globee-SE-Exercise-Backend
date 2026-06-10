import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const db = {
  /**
   * Initializes the database connection and seeds the default admin user.
   */
  async initializeDatabase() {
    await prisma.$connect();

    // Seed admin user if not exists
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@gmail.com' }
    });

    if (!existing) {
      const hashedPassword = bcrypt.hashSync('admin', 10);
      await prisma.user.create({
        data: {
          email: 'admin@gmail.com',
          password: hashedPassword,
          name: 'Admin',
          status: 'ACTIVE'
        }
      });
      console.log('Seeded default admin user: admin@gmail.com');
    }

    console.log('Database connected successfully via Prisma.');
  },
}