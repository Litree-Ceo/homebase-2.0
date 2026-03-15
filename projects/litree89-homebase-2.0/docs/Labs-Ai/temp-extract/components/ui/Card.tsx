import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm p-4 md:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
