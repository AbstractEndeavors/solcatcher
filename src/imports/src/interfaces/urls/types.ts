import type {StringLike} from './imports.js';
export interface UrlParse {
  scheme: string;
  netloc: string;
}
export interface UrlParsed  extends UrlParse{
  identifier: string;
  url: string;
}

export interface UrlDict extends UrlParse{
  identifier: string;
  path?: string;
  name: string;     // REQUIRED
  ext: string;      // REQUIRED (give it defaults)
}

export type UrlInput =
  | string
  | UrlParse;

export type Url=string

export type UrlLike  = UrlParse | UrlDict | StringLike | UrlInput | string | Date | null | undefined;
