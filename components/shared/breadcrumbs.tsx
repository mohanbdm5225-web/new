import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          {item.href ? (
            <Link href={item.href} className="hover:text-slate-900">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
          {i < items.length - 1 && (
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          )}
        </div>
      ))}
    </nav>
  );
}