type SheetSelector = ["sheet", string, string];
type SheetListSelector = ["sheet", string];

type Sheet = { [key: string]: Deno.KvKeyPart };

export type { SheetSelector, Sheet, SheetListSelector };
