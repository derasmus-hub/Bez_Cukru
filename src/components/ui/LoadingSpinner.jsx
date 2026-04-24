export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 border-4 border-stone-200 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  )
}
