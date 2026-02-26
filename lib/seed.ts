import { dbConnect } from './mongodb';
import Pizza from '../models/Pizza';

const PIZZAS_INICIALES = [
  {
    name: 'Pepperoni Clásica',
    price: 180,
    description: 'Doble pepperoni, mozzarella y salsa de tomate artesanal.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600',
    category: 'clasica'
  },
  {
    name: 'Mexicana Especial',
    price: 210,
    description: 'Chorizo, jalapeño, cebolla y un toque de aguacate.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600',
    category: 'especial'
  },
  {
    name: 'Hawaiana Gourmet',
    price: 190,
    description: 'Piña caramelizada, jamón premium y extra queso.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600',
    category: 'clasica'
  }
];

export const seedDatabase = async () => {
  try {
    await dbConnect();
    
    // Opcional: Limpiar la base de datos antes de cargar (cuidado en producción)
    await Pizza.deleteMany({}); 
    
    await Pizza.insertMany(PIZZAS_INICIALES);
    console.log("✅ ¡Pizzas cargadas exitosamente en MongoDB para Tabasco!");
  } catch (error) {
    console.error("❌ Error al sembrar la base de datos:", error);
  }
};