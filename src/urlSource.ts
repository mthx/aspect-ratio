import { useState } from "react";

export interface UrlSource {
  url: string;
  revoke(): void;
}

export class FileUrlSource implements UrlSource {
  url: string;
  constructor(file: File) {
    this.url = URL.createObjectURL(file);
  }
  revoke() {
    return URL.revokeObjectURL(this.url);
  }
}

export class DefaultUrlSource implements UrlSource {
  constructor(public url: string) {}
  revoke() {}
}

export const useUrlSourceState = (): [UrlSource | undefined, (newValue: UrlSource | undefined) => void] => {
  const [v, setV] = useState<UrlSource | undefined>();
  return [v, (newValue: UrlSource | undefined) => {
    if (v) {
      v.revoke();
    }
    setV(newValue);
  }]
}