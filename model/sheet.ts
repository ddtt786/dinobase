type SheetSelector = ["sheet", string, string];
type SheetListSelector = ["sheet", string];

type Sheet = { [key: string]: Deno.KvKeyPart | undefined };

export type { SheetSelector, Sheet, SheetListSelector };
