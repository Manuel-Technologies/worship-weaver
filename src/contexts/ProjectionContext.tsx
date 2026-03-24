import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { ServiceItem, SlideData, createBlackSlide } from "@/lib/service-types";
import { BibleReference, getVersesByReference, getLoadedVerses, BibleVerse } from "@/lib/bible-data";

export interface LiveScriptureState {
  book: string;
  chapter: number;
  currentVerse: number;
}

interface ProjectionState {
  serviceItems: ServiceItem[];
  currentItemIndex: number;
  currentSlideIndex: number;
  isLive: boolean;
  projectionWindow: Window | null;
  liveScripture: LiveScriptureState | null;
}

interface ProjectionContextType extends ProjectionState {
  setServiceItems: (items: ServiceItem[]) => void;
  addServiceItem: (item: ServiceItem) => void;
  removeServiceItem: (id: string) => void;
  moveServiceItem: (fromIndex: number, toIndex: number) => void;
  selectItem: (index: number) => void;
  selectSlide: (itemIndex: number, slideIndex: number) => void;
  goLive: (slide: SlideData) => void;
  goLiveScripture: (ref: BibleReference) => void;
  goBlack: () => void;
  nextVerse: () => void;
  prevVerse: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
  openProjectionWindow: () => void;
  closeProjectionWindow: () => void;
  currentSlide: SlideData | null;
  liveSlide: SlideData | null;
}

const ProjectionContext = createContext<ProjectionContextType | null>(null);

export function useProjection() {
  const ctx = useContext(ProjectionContext);
  if (!ctx) throw new Error("useProjection must be used within ProjectionProvider");
  return ctx;
}

export function ProjectionProvider({ children }: { children: React.ReactNode }) {
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [liveSlide, setLiveSlide] = useState<SlideData | null>(null);
  const [liveScripture, setLiveScripture] = useState<LiveScriptureState | null>(null);
  const projectionWindowRef = useRef<Window | null>(null);

  const currentSlide = serviceItems[currentItemIndex]?.slides[currentSlideIndex] || null;

  const broadcastSlide = useCallback((slide: SlideData | null) => {
    const win = projectionWindowRef.current;
    if (win && !win.closed) {
      win.postMessage({ type: "SLIDE_UPDATE", slide }, "*");
    }
  }, []);

  const makeVerseSlide = useCallback((verse: BibleVerse): SlideData => ({
    id: crypto.randomUUID(),
    title: "",
    reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
    bodyLines: [`${verse.text}`],
  }), []);

  const goLiveScripture = useCallback((ref: BibleReference) => {
    const verses = getVersesByReference({ ...ref, verseEnd: undefined });
    const singleVerse = verses.length > 0 ? verses[0] : null;
    if (!singleVerse) return;

    setLiveScripture({ book: ref.book, chapter: ref.chapter, currentVerse: ref.verseStart });
    const slide = makeVerseSlide(singleVerse);
    setIsLive(true);
    setLiveSlide(slide);
    broadcastSlide(slide);
  }, [broadcastSlide, makeVerseSlide]);

  const nextVerse = useCallback(() => {
    if (!liveScripture) return;
    const next = liveScripture.currentVerse + 1;
    const allVerses = getLoadedVerses();
    const verse = allVerses.find(
      (v) => v.book_name.toLowerCase() === liveScripture.book.toLowerCase() &&
        v.chapter === liveScripture.chapter && v.verse === next
    );
    if (!verse) return;
    setLiveScripture((prev) => prev ? { ...prev, currentVerse: next } : null);
    const slide = makeVerseSlide(verse);
    setLiveSlide(slide);
    broadcastSlide(slide);
  }, [liveScripture, broadcastSlide, makeVerseSlide]);

  const prevVerse = useCallback(() => {
    if (!liveScripture || liveScripture.currentVerse <= 1) return;
    const prev = liveScripture.currentVerse - 1;
    const allVerses = getLoadedVerses();
    const verse = allVerses.find(
      (v) => v.book_name.toLowerCase() === liveScripture.book.toLowerCase() &&
        v.chapter === prev ? v.chapter === liveScripture.chapter : false && v.verse === prev
    );
    const correctVerse = allVerses.find(
      (v) => v.book_name.toLowerCase() === liveScripture.book.toLowerCase() &&
        v.chapter === liveScripture.chapter && v.verse === prev
    );
    if (!correctVerse) return;
    setLiveScripture((p) => p ? { ...p, currentVerse: prev } : null);
    const slide = makeVerseSlide(correctVerse);
    setLiveSlide(slide);
    broadcastSlide(slide);
  }, [liveScripture, broadcastSlide, makeVerseSlide]);

  const addServiceItem = useCallback((item: ServiceItem) => {
    setServiceItems((prev) => [...prev, item]);
  }, []);

  const removeServiceItem = useCallback((id: string) => {
    setServiceItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const moveServiceItem = useCallback((fromIndex: number, toIndex: number) => {
    setServiceItems((prev) => {
      const items = [...prev];
      const [removed] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, removed);
      return items;
    });
  }, []);

  const selectItem = useCallback((index: number) => {
    setCurrentItemIndex(index);
    setCurrentSlideIndex(0);
  }, []);

  const selectSlide = useCallback((itemIndex: number, slideIndex: number) => {
    setCurrentItemIndex(itemIndex);
    setCurrentSlideIndex(slideIndex);
  }, []);

  const goLive = useCallback((slide: SlideData) => {
    setIsLive(true);
    setLiveSlide(slide);
    broadcastSlide(slide);
    // Track scripture context from the slide reference
    if (slide.reference) {
      const match = slide.reference.match(/^(.+?)\s+(\d+):(\d+)/);
      if (match) {
        setLiveScripture({ book: match[1], chapter: parseInt(match[2]), currentVerse: parseInt(match[3]) });
      }
    }
  }, [broadcastSlide]);

  const goBlack = useCallback(() => {
    const black = createBlackSlide();
    setLiveSlide(black);
    broadcastSlide(black);
  }, [broadcastSlide]);

  const nextSlide = useCallback(() => {
    const item = serviceItems[currentItemIndex];
    if (!item) return;
    if (currentSlideIndex < item.slides.length - 1) {
      const next = currentSlideIndex + 1;
      setCurrentSlideIndex(next);
      if (isLive) {
        setLiveSlide(item.slides[next]);
        broadcastSlide(item.slides[next]);
      }
    } else if (currentItemIndex < serviceItems.length - 1) {
      const nextItem = currentItemIndex + 1;
      setCurrentItemIndex(nextItem);
      setCurrentSlideIndex(0);
      if (isLive) {
        setLiveSlide(serviceItems[nextItem].slides[0]);
        broadcastSlide(serviceItems[nextItem].slides[0]);
      }
    }
  }, [serviceItems, currentItemIndex, currentSlideIndex, isLive, broadcastSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      const prev = currentSlideIndex - 1;
      setCurrentSlideIndex(prev);
      const item = serviceItems[currentItemIndex];
      if (isLive && item) {
        setLiveSlide(item.slides[prev]);
        broadcastSlide(item.slides[prev]);
      }
    } else if (currentItemIndex > 0) {
      const prevItem = currentItemIndex - 1;
      const prevSlideIdx = serviceItems[prevItem].slides.length - 1;
      setCurrentItemIndex(prevItem);
      setCurrentSlideIndex(prevSlideIdx);
      if (isLive) {
        setLiveSlide(serviceItems[prevItem].slides[prevSlideIdx]);
        broadcastSlide(serviceItems[prevItem].slides[prevSlideIdx]);
      }
    }
  }, [serviceItems, currentItemIndex, currentSlideIndex, isLive, broadcastSlide]);

  const openProjectionWindow = useCallback(() => {
    const win = window.open("/projection", "AmboPro_Projection", "width=1920,height=1080");
    projectionWindowRef.current = win;
  }, []);

  const closeProjectionWindow = useCallback(() => {
    projectionWindowRef.current?.close();
    projectionWindowRef.current = null;
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "b" || e.key === "B") {
        goBlack();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextSlide, prevSlide, goBlack]);

  return (
    <ProjectionContext.Provider
      value={{
        serviceItems,
        currentItemIndex,
        currentSlideIndex,
        isLive,
        projectionWindow: projectionWindowRef.current,
        setServiceItems,
        addServiceItem,
        removeServiceItem,
        moveServiceItem,
        selectItem,
        selectSlide,
        goLive,
        goBlack,
        nextSlide,
        prevSlide,
        openProjectionWindow,
        closeProjectionWindow,
        currentSlide,
        liveSlide,
      }}
    >
      {children}
    </ProjectionContext.Provider>
  );
}
