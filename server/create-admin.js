import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import prisma from './src/lib/prisma.js';

dotenv.config();

const args = process.argv.slice(2);
const email = args[0] || 'admin@nonsatravels.com';
const password = args[1] || 'Admin123!';
const firstName = args[2] || 'Admin';
const lastName = args[3] || 'User';

console.log('\n Creating admin with:');
console.log(`   Email: ${email}`);
console.log(`   Name: ${firstName} ${lastName}\n`);

const createAdmin = async () => {
  try {
    await prisma.$connect();
    console.log(' Connected to PostgreSQL');

    const existingAdmin = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (existingAdmin) {
      await prisma.user.update({ where: { id: existingAdmin.id }, data: { role: 'admin' } });
      console.log('  User already exists — role updated to admin');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          role: 'admin',
          isVerified: true,
        },
      });
      console.log(' Admin user created successfully!');
      console.log('\n    Email:', email);
      console.log('    Password:', password);
      console.log('\n     Please change the password after first login!');
    }

    await prisma.$disconnect();
    console.log('\n Done!');
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
