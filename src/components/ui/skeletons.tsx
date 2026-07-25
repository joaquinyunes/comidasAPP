// ============================================
// SKELETON COMPONENTS - Loading states
// ============================================

export function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 animate-fadeIn">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-24 skeleton" />
          <div className="h-6 w-32 skeleton" />
        </div>
        <div className="w-10 h-10 rounded-xl skeleton" />
      </div>
      <div className="h-1.5 w-full skeleton" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl animate-fadeIn" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-40 skeleton" />
            <div className="h-2.5 w-24 skeleton" />
          </div>
          <div className="h-8 w-20 skeleton rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 skeleton" />
        <div className="w-10 h-10 rounded-xl skeleton" />
      </div>
      <div className="h-7 w-28 skeleton" />
      <div className="h-1.5 w-full skeleton" />
    </div>
  );
}

export function SkeletonMenuCard() {
  return (
    <div className="flex bg-white border border-gray-100 rounded-2xl overflow-hidden animate-fadeIn">
      <div className="w-24 h-24 skeleton flex-shrink-0" />
      <div className="flex-1 p-4 space-y-2">
        <div className="h-4 w-32 skeleton" />
        <div className="h-3 w-48 skeleton" />
        <div className="flex gap-1 mt-2">
          <div className="h-5 w-12 skeleton rounded-full" />
          <div className="h-5 w-16 skeleton rounded-full" />
        </div>
        <div className="h-8 w-24 skeleton rounded-lg mt-2" />
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fadeIn">
      <div className="text-5xl mb-4 opacity-40">{icon}</div>
      <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 max-w-xs">{description}</p>
    </div>
  );
}
