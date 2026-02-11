'use client';

import Link from 'next/link';
import { DocumentCategory } from '@/lib/types';
import { getCategoryInfo } from '@/lib/utils/format';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const categories = Object.values(DocumentCategory);

export default function CategoriesPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-muted-foreground">Browse documents by type</p>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => {
          const info = getCategoryInfo(category);
          const Icon = info.icon;

          return (
            <Link key={category} href={`/dashboard/categories/${category.toLowerCase()}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className={cn('rounded-xl p-4 mb-3', info.bgColor)}>
                    <Icon className={cn('h-8 w-8', info.color)} />
                  </div>
                  <h3 className="font-medium text-sm">{info.label}</h3>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
