import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const db = {
  /**
   * Initializes the database connection and seeds the default admin user.
   */
  async initializeDatabase() {
    await prisma.$connect();

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
    }
    const existing2 = await prisma.user.findUnique({
      where: { email: 'admin1@gmail.com' }
    });

    if (!existing2) {
      const hashedPassword = bcrypt.hashSync('admin', 10);
      await prisma.user.create({
        data: {
          email: 'admin1@gmail.com',
          password: hashedPassword,
          name: 'Admin1',
          status: 'INACTIVE'
        }
      });
    }

    console.log('Database connected successfully via Prisma.');
  },
}