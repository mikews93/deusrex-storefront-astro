import { motion } from 'framer-motion';

interface BrandButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function BrandButton({ onClick, disabled, children, className = '' }: BrandButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center rounded-xl py-4 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 hover:shadow-xl disabled:opacity-50 disabled:shadow-none ${className}`}
      style={{
        background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary, var(--brand-primary)))',
      }}
    >
      {children}
    </motion.button>
  );
}
