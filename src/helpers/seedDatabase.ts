import User from '../models/User';
import Review from '../models/Review';

export const seedDatabase = async () => {
  try {
    const adminUsers = [
      {
        name: 'Admin User',
        email: 'admin@redberry.com',
        password: 'admin123*',
        role: 'admin' as const,
      },
      {
        name: 'Jignesh Lakum (SuperAdmin)',
        email: 'jigneshlakum@gmail.com',
        password: 'Admin@123*',
        role: 'admin' as const,
      },
      {
        name: 'Redberry Agri Admin',
        email: 'admin@redberryagri.com',
        password: 'admin123',
        role: 'admin' as const,
      },
    ];

    for (const u of adminUsers) {
      let existingUser = await User.findOne({ email: u.email });
      if (!existingUser) {
        existingUser = new User(u);
        await existingUser.save();
      } else {
        if (!existingUser.password.startsWith('$2a$') && !existingUser.password.startsWith('$2b$')) {
          existingUser.password = u.password;
          await existingUser.save();
        }
      }
    }

    // Seed initial reviews if review collection is empty
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      const initialReviews = [
        {
          name: 'Rameshbhai Patel',
          address: 'Anand, Gujarat',
          description: "Using Redberry's cotton crop protection schedule helped eliminate pink bollworms and whiteflies effectively. Our yield increased by 28% this harvest.",
          image: '/images/reviews/farmer_1.png',
          rate: 5,
        },
        {
          name: 'Rajesh Deshmukh',
          address: 'Akola, Maharashtra',
          description: "The growth regulator and micronutrient formulations gave our crop vigorous vegetative growth and heavy pod set even during the dry spell.",
          image: '/images/reviews/farmer_2.png',
          rate: 5,
        },
        {
          name: 'Suresh Kumar Verma',
          address: 'Karnal, Haryana',
          description: 'Redberry fungicides showed quick systemic action on rice blast and sheath blight. Our paddy grain quality and test weight improved remarkably.',
          image: '/images/reviews/farmer_3.png',
          rate: 5,
        },
        {
          name: 'Praveen Reddy',
          address: 'Guntur, Andhra Pradesh',
          description: 'The targeted pest management formulations gave fantastic results controlling black thrips and mites in our export chilli farms without leaf curl.',
          image: '/images/reviews/farmer_4.png',
          rate: 5,
        },
      ];

      await Review.insertMany(initialReviews);
      console.log('\x1b[32m✔ Initial Customer Reviews seeded successfully!\x1b[0m');
    }

    console.log('\x1b[32m✔ Admin Users initialized with bcrypt! (No static products seeded)\x1b[0m');
  } catch (error) {
    console.error('Error initializing database seeds:', (error as Error).message);
  }
};

