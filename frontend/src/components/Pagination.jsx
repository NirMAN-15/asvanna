import React, { useContext } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange, className = '' }) {
  const { lang } = useContext(LanguageContext);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate responsive smart window of page numbers with ellipsis
  const getVisiblePages = () => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`w-full min-w-0 pt-4 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-medium text-on-surface-variant ${className}`}>
      {/* Records Count Summary */}
      <div className="flex-shrink-0 text-center md:text-left select-none">
        <span className="font-semibold text-on-surface-variant">
          {lang === 'si'
            ? `සමස්ත ${totalItems} න් ${startItem} සිට ${endItem} දක්වා`
            : `Showing ${startItem} to ${endItem} of ${totalItems} records`}
        </span>
      </div>

      {/* Pagination Numbers and Chevrons Box */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center flex-shrink-0">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-outline-variant/60 bg-surface hover:bg-surface-variant disabled:opacity-30 disabled:hover:bg-surface disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center text-on-surface shadow-2xs"
          title={lang === 'si' ? 'පෙර පිටුව' : 'Previous Page'}
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Number Buttons & Ellipsis */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {visiblePages.map((item, idx) => {
            if (item === '...') {
              return (
                <span
                  key={`ellipsis_${idx}`}
                  className="w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center text-xs font-black text-on-surface-variant/70 select-none"
                >
                  •••
                </span>
              );
            }

            const p = Number(item);
            const isActive = p === currentPage;

            return (
              <button
                type="button"
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-primary text-white shadow-sm ring-1 ring-primary'
                    : 'border border-outline-variant/60 bg-surface hover:bg-surface-variant text-on-surface hover:border-outline shadow-2xs'
                }`}
                aria-current={isActive ? 'page' : undefined}
                title={`${lang === 'si' ? 'පිටුව' : 'Page'} ${p}`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-outline-variant/60 bg-surface hover:bg-surface-variant disabled:opacity-30 disabled:hover:bg-surface disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center text-on-surface shadow-2xs"
          title={lang === 'si' ? 'ඊළඟ පිටුව' : 'Next Page'}
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
