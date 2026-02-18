export default function PageTransition({ children }) {
  return (
    <div className="animate-fade-slide">
      {children}
    </div>
  );
}
