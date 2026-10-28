import React, { useState, useRef, useEffect } from 'react';
import { BANDARAWELA_GND_DIVISIONS } from '../constants/locations';

export default function GndDropdown({
  value,
  onChange,
  lang = 'en',
  id = 'gnd_division',
  name = 'gnd_division',
  buttonClassName = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open, clear query on close
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const selectedItem = BANDARAWELA_GND_DIVISIONS.find((item) => item.value === value);

  const displayLabel = selectedItem
    ? lang === 'si' && selectedItem.labelSi
      ? `${selectedItem.value} (${selectedItem.labelSi})`
      : selectedItem.labelEn
    : value || (lang === 'si' ? 'ග්‍රාම නිලධාරී වසම තෝරන්න' : 'Select GND Division');

  const filtered = BANDARAWELA_GND_DIVISIONS.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      item.value.toLowerCase().includes(q) ||
      (item.labelSi && item.labelSi.toLowerCase().includes(q)) ||
      (item.labelEn && item.labelEn.toLowerCase().includes(q))
    );
  });

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Hidden input for HTML form compliance */}
      <input type="hidden" name={name} value={value || ''} />

      {/* Trigger Button - Always opens downwards */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          buttonClassName ||
          "w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none cursor-pointer flex items-center justify-between text-left"
        }
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate text-on-surface font-medium">
          {displayLabel}
        </span>
        <span
          className={`material-symbols-outlined text-outline transition-transform duration-200 text-xl ml-2 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        >
          keyboard_arrow_down
        </span>
      </button>

      {/* Downward Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-72">
          {/* Search box inside dropdown */}
          <div className="p-2 border-b border-outline-variant/30 bg-surface-container-low sticky top-0 z-10">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-lg pointer-events-none">
                search
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'si' ? 'වසම සොයන්න...' : 'Search division...'}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-slate-900"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 flex items-center"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Scrollable list */}
          <div className="overflow-y-auto divide-y divide-outline-variant/10 py-1" role="listbox">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-outline text-center">
                {lang === 'si' ? 'කිසිදු වසමක් හමු නොවීය' : 'No division found'}
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = item.value === value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange({ target: { name, value: item.value } });
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-xs sm:text-sm text-left flex items-center justify-between transition hover:bg-primary/10 hover:text-primary ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-on-surface'
                    }`}
                  >
                    <span>
                      {lang === 'si' && item.labelSi
                        ? `${item.value} (${item.labelSi})`
                        : item.labelEn}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-primary text-base ml-2 flex-shrink-0">
                        check
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
