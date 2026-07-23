"use client";

import NearMeToggle from "@/components/search/NearMeToggle";
import { highlightMatch } from "@/lib/highlight";
import { fetchSuggestions } from "@/lib/searchApi";
import type { Suggestion } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type SearchBarProps = {
  initialQuery?: string;
  initialNearMe?: boolean;
  size?: "default" | "large";
  onSearch?: (query: string, nearMe: boolean) => void;
  showNearMe?: boolean;
  lat?: number;
  lng?: number;
  geoLoading?: boolean;
};

function HighlightedText({ text, query }: { text: string; query: string }) {
  const parts = highlightMatch(text, query);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <strong key={i} className="font-semibold text-[#2563eb]">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function SearchBar({
  initialQuery = "",
  initialNearMe = true,
  size = "default",
  onSearch,
  showNearMe = true,
  lat,
  lng,
  geoLoading = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [nearMe, setNearMe] = useState(initialNearMe);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const isLarge = size === "large";

  const navigateToSearch = useCallback(
    (searchQuery: string) => {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      params.set("nearMe", String(nearMe));
      if (nearMe && lat !== undefined && lng !== undefined) {
        params.set("lat", String(lat));
        params.set("lng", String(lng));
      }
      if (onSearch) {
        onSearch(searchQuery, nearMe);
      } else {
        router.push(`/search?${params.toString()}`);
      }
    },
    [nearMe, lat, lng, onSearch, router]
  );

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const selectSuggestion = useCallback(
    (text: string) => {
      setQuery(text);
      closeDropdown();
      navigateToSearch(text);
    },
    [closeDropdown, navigateToSearch]
  );

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const results = await fetchSuggestions(query);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && e.key === "ArrowDown" && suggestions.length > 0) {
      setIsOpen(true);
      setActiveIndex(0);
      e.preventDefault();
      return;
    }

    if (!isOpen) {
      if (e.key === "Enter" && query.trim()) {
        e.preventDefault();
        navigateToSearch(query.trim());
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          selectSuggestion(suggestions[activeIndex].text);
        } else if (query.trim()) {
          navigateToSearch(query.trim());
        }
        break;
      case "Escape":
        closeDropdown();
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-center ${
          isLarge ? "gap-4" : ""
        }`}
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => query.trim() && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search medications…"
            aria-label="Search medications"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            role="combobox"
            className={`w-full rounded-full border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 outline-none transition-shadow focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${
              isLarge
                ? "h-14 px-6 pr-12 text-base"
                : "h-11 px-5 pr-11 text-sm"
            }`}
          />
          <svg
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400 ${
              isLarge ? "right-5 h-5 w-5" : "right-4 h-4 w-4"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
            />
          </svg>
        </div>

        <div className="flex items-center gap-3">
          {showNearMe && (
            <NearMeToggle
              enabled={nearMe}
              onChange={setNearMe}
              loading={geoLoading && nearMe}
            />
          )}
          <button
            type="button"
            onClick={() => query.trim() && navigateToSearch(query.trim())}
            className={`shrink-0 rounded-full bg-[#2563eb] font-semibold text-white transition-colors hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] ${
              isLarge ? "h-14 px-8 text-base" : "h-11 px-7 text-sm"
            }`}
          >
            Search
          </button>
        </div>
      </div>

      {isOpen && query.trim() && (
        <ul
          id="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
        >
          {suggestLoading ? (
            <li className="px-4 py-3 text-sm text-gray-500">Loading…</li>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.type}-${suggestion.text}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(suggestion.text)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
                  index === activeIndex ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    suggestion.type === "medicine"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-purple-50 text-purple-700"
                  }`}
                >
                  {suggestion.type === "medicine" ? "Medicine" : "Pharmacy"}
                </span>
                <span className="text-sm text-gray-900">
                  <HighlightedText text={suggestion.text} query={query} />
                </span>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-gray-500">
              No suggestions for &ldquo;{query}&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
