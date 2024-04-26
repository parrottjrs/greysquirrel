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
  authorizedUsers?: string[];
}

export interface QuillProps {
  quillRef: any;
  text: any;
  title: string;
  docId: string | undefined;
  onTextChange: (text: string, delta: any, source: any) => void;
  onTitleChange: (title: string) => void;
  shared: boolean;
}

export interface VerifyAccountProps {
  verified: boolean;
  sent: boolean;
  sendNewToken: () => Promise<void>;
  tokenExpired: boolean;
  createDocument: () => Promise<void>;
}

export interface SigninFormData {
  username: string;
  password: string;
  remember: boolean;
}

export interface SignupFormData {
  username: string;
  email: string;
  emailCheck: string;
  firstName: string;
  lastName: string;
  password: string;
  passCheck: string;
}
