type FileSelector = ["storage", string];

interface File {
  name: string;
  ext: string;
  path: string;
}

export type { FileSelector, File };
