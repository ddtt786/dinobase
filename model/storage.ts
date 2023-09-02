type FileSelector = ["storage", string];

interface StorageFile {
  name: string;
  ext: string;
  path: string;
}

export type { FileSelector, StorageFile };
