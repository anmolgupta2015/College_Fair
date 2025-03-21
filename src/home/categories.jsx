import { Link } from "react-router-dom";
import {
  Book,
  Laptop,
  Sofa,
  Shirt,
  FileText,
  Ticket,
  Backpack,
  BikeIcon as Bicycle,
  Coffee,
  Gift,
} from "lucide-react";

export default function Categories() {
  const categories = [
    { name: "Textbooks", icon: Book, count: 245 },
    { name: "Electronics", icon: Laptop, count: 189 },
    { name: "Furniture", icon: Sofa, count: 124 },
    { name: "Clothing", icon: Shirt, count: 97 },
    { name: "Notes & Guides", icon: FileText, count: 156 },
    { name: "Event Tickets", icon: Ticket, count: 78 },
    { name: "Accessories", icon: Backpack, count: 112 },
    { name: "Transportation", icon: Bicycle, count: 45 },
    { name: "Food & Drinks", icon: Coffee, count: 67 },
    { name: "Miscellaneous", icon: Gift, count: 93 },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-500 to-indigo-600 py-12 flex items-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white">Browse Categories</h2>
          <p className="text-white/80 max-w-lg mx-auto">
            Find exactly what you need by exploring our popular categories.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={`/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex flex-col items-center justify-center p-6 bg-white/10 rounded-xl border border-white/20
                hover:bg-white/20 transition-all duration-300 text-white shadow-md"
              >
                <div className="h-14 w-14 flex items-center justify-center bg-white/20 rounded-full mb-3">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="text-sm text-white/80">{category.count} items</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

