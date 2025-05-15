// Declarações de tipos globais
interface RiseWorshipSearch {
  activate: (query: string) => void;
  deactivate: () => void;
}

declare global {
  interface Window {
    riseWorshipSearch?: RiseWorshipSearch;
  }
}

export {};
