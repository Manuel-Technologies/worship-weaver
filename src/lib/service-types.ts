export type ServiceItemType = "scripture" | "song" | "announcement" | "media" | "blank";

export interface SlideData {
  id: string;
  title: string;
  subtitle?: string;
  bodyLines: string[];
  reference?: string;
  background?: string;
}

export interface ServiceItem {
  id: string;
  type: ServiceItemType;
  title: string;
  subtitle?: string;
  slides: SlideData[];
  sourceId?: string; // song id or verse reference
}

export function createBlankSlide(id?: string): SlideData {
  return {
    id: id || crypto.randomUUID(),
    title: "",
    bodyLines: [],
  };
}

export function createBlackSlide(): SlideData {
  return {
    id: "black",
    title: "",
    bodyLines: [],
    background: "black",
  };
}
