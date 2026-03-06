// hooks/useDebouncedSearch.js
import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Hook para búsquedas con debounce
 * Evita hacer requests en cada keystroke
 */
export const useDebouncedSearch = (searchFn, delayMs = 300) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const debounceTimerRef = useRef(null);

  const search = useCallback(
    async (searchQuery) => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        setResults([]);
        return;
      }

      // Limpiar timer anterior
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Configurar nuevo timer
      debounceTimerRef.current = setTimeout(async () => {
        try {
          setIsSearching(true);
          setSearchError(null);
          const searchResults = await searchFn(searchQuery.trim());
          setResults(searchResults);
        } catch (error) {
          console.error("Search error:", error);
          setSearchError(error.message || "Error en búsqueda");
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, delayMs);
    },
    [searchFn, delayMs],
  );

  const handleInputChange = useCallback(
    (value) => {
      setQuery(value);
      search(value);
    },
    [search],
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setSearchError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    query,
    results,
    isSearching,
    searchError,
    handleInputChange,
    clearSearch,
  };
};
