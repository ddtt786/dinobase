type NoteSelector = ["note", string];

interface Note {
  title: string;
  created_at: number;
}

export type { NoteSelector, Note };
