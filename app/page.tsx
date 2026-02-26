// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-6xl font-black text-gray-900 mb-6">
        La mejor pizza de <span className="text-red-600">Tabasco</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Las pizzas más ricas de la región, también te ofrecemos deliciosos snacks, cafés y postres.
      </p>
      <Link 
        href="/menu" 
        className="bg-red-600 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-200"
      >
        ¡Ordena Ahora!
      </Link>
    </main>
  );
}