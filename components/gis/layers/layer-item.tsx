"use client";

export function LayerItem({ name }: { name: string }) {
  return (
    <div className="p-2 border mb-2 rounded text-sm">
      {name}
    </div>
  );
}