export interface UserDocument {
  doc_id?: number;
  title?: string;
  content?: string;
  authorizedUsers: string[];
  last_edit: string;
}

export interface SharedDocument {
  doc_id?: number;
  title?: string;
  content?: string;
  owner: { owner_id?: number; owner_name?: string };
}

export interface DocumentsGridProps {
  documents: UserDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<UserDocument[]>>;
}

export interface SharedDocumentsGridProps {
  sharedDocuments: SharedDocument[];
  setSharedDocuments: React.Dispatch<React.SetStateAction<SharedDocument[]>>;
}

export interface DocumentOptionsProps {
  docId?: number;
  ownerId?: number;
  title?: string;
  handleDocs:
    | React.Dispatch<React.SetStateAction<UserDocument[]>>
    | React.Dispatch<React.SetStateAction<SharedDocument[]>>;
  shared?: boolean;
}

export interface QuillProps {
  text: string;
  title: string;
  docId: string | undefined;
  onTextChange: (text: string) => void;
  onTitleChange: (title: string) => void;
  shared: boolean;
}
