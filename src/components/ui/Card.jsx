export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden ${className}`}>
      {children}
    </div>
  )
}
