interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className, ...props }: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-100",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

