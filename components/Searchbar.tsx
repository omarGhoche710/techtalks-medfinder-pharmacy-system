"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Medication } from "../data/medications";
import { getAutocompleteSuggestions, highlightMatch } from "../lib/searchMedications";

type SearchBarProps = {
  medications: Medication[];
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
};

function HighlightedText({ text, query }: { text: string; query: string }) {
  const parts = highlightMatch(text, query);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <strong key={index} className="font-semibold text-[#2563EB]">
            {part}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

export default function Searchbar({
  medications,
  query,
  onQueryChange,
  onSearch,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = getAutocompleteSuggestions(medications, query);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const selectSuggestion = useCallback(
    (medication: Medication) => {
      onQueryChange(medication.name);
      onSearch(medication.name);
      closeDropdown();
      inputRef.current?.blur();
    },
    [closeDropdown, onQueryChange, onSearch]
  );

  const handleSearch = useCallback(() => {
    onSearch(query);
    closeDropdown();
  }, [closeDropdown, onSearch, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && event.key === "ArrowDown" && suggestions.length > 0) {
      setIsOpen(true);
      setActiveIndex(0);
      event.preventDefault();
      return;
    }

    if (!isOpen) {
      if (event.key === "Enter") {
        handleSearch();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        event.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          selectSuggestion(suggestions[activeIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        closeDropdown();
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative w-full top-0 max-w-2xl">
      <div className="flex items-center">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="Search"
            aria-label="Search medications"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="search-autocomplete"
            role="combobox"
            onChange={(event) => {
              onQueryChange(event.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => query.trim() && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="h-11 w-full rounded-full border border-[#E5E7EB] bg-white px-5 pr-11 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-shadow focus:border-[#2563EB] focus:shadow-[0_0_0_3px_#EFF6FF]"
          />
          <svg
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
            />
          </svg>
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="h-11 shrink-0 rounded-full bg-[#2563EB] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] active:scale-[0.98]"
        >
          Search
        </button>
      </div>

      {isOpen && query.trim() && (
        <ul
          id="search-autocomplete"
          role="listbox"
          className="absolute left-0 right-14 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-[0_8px_30px_rgba(37,99,235,0.08)]"
        >
          {suggestions.length > 0 ? (
            suggestions.map((medication, index) => (
              <li
                key={medication.id}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(medication)}
                className={`cursor-pointer px-4 py-3 transition-colors ${index === activeIndex
                  ? "bg-[#EFF6FF]"
                  : "hover:bg-[#F3F4F6]"
                  }`}
              >
                <div className="flex items-center">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                    style={{ backgroundColor: medication.imageColor }}
                  >
                    {medication.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#111827]">
                      <HighlightedText text={medication.name} query={query} />
                    </p>
                    <p className="truncate text-xs text-[#6B7280]">
                      <HighlightedText text={medication.code} query={query} />
                      <span className="mx-1.5 text-[#E5E7EB]">·</span>
                      Exp {medication.expiry.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-[#6B7280]">
              No medications found for &ldquo;{query}&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  );
}