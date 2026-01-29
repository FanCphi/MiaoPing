import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  // Create Restaurants
  const bistro = await prisma.restaurant.create({
    data: {
      name: 'Vibe Bistro',
      location: 'Downtown Art District',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      mealSets: {
        create: [
          {
            title: 'Weekend Brunch Set',
            price: 128,
            minPeople: 4,
            maxPeople: 6,
            menuDetails: 'Avocado Toast, Eggs Benedict, Pancakes, Coffee',
          },
          {
            title: 'Dinner Party Platter',
            price: 299,
            minPeople: 6,
            maxPeople: 8,
            menuDetails: 'Steak, Pasta, Salad, Wine',
          },
        ],
      },
    },
  })

  const sushi = await prisma.restaurant.create({
    data: {
      name: 'Sakura Sushi',
      location: 'Tech Park',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
      mealSets: {
        create: [
          {
            title: 'Omakase Experience',
            price: 588,
            minPeople: 2,
            maxPeople: 4,
            menuDetails: 'Chef Choice Sushi, Sashimi, Miso Soup, Dessert',
          },
        ],
      },
    },
  })
  
  // Create a User (Host)
  const host = await prisma.user.create({
    data: {
      phone: '13800138000',
      nickname: 'Alex',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      school: 'Tech University',
      bio: 'Foodie & Developer',
      vibeScore: 100,
      interests: JSON.stringify(['Foodie', 'Tech', 'Travel']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1542596594-649edbc13630?w=800&q=80',
        'https://images.unsplash.com/photo-1552374196-c4e7ffc6e194?w=800&q=80'
      ])
    }
  })

  console.log({ bistro, sushi, host })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
