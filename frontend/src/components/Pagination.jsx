import React, { useContext } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
  const { lang } = useContext(LanguageContext);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-outline-variant/30 text-xs font-medium text-on-surface-variant">
      <div>
        <span>
          {lang === 'si'
            ? `සමස්ත ${totalItems} න් ${startItem} සිට ${endItem} දක්වා පෙන්වයි`
            : `Showing ${startItem} to ${endItem} of ${totalItems} records`}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-variant disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p) => {
            const isActive = p === currentPage;
            return (
              <button
                type="button"
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'border border-outline-variant/50 hover:bg-surface-variant text-on-surface'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-variant disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
