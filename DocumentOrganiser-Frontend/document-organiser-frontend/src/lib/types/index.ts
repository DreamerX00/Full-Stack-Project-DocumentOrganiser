// ============================================================
// Enums (matching backend)
// ============================================================

export enum DocumentCategory {
  DOCUMENTS = 'DOCUMENTS',
  IMAGES = 'IMAGES',
  VIDEOS = 'VIDEOS',
  AUDIO = 'AUDIO',
  ARCHIVES = 'ARCHIVES',
  CODE = 'CODE',
  SPREADSHEETS = 'SPREADSHEETS',
  PRESENTATIONS = 'PRESENTATIONS',
  OTHERS = 'OTHERS',
}

export enum SharePermission {
  VIEW = 'VIEW',
  DOWNLOAD = 'DOWNLOAD',
  EDIT = 'EDIT',
}

export enum ActivityType {
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_DOWNLOADED = 'DOCUMENT_DOWNLOADED',
  DOCUMENT_VIEWED = 'DOCUMENT_VIEWED',
  DOCUMENT_RENAMED = 'DOCUMENT_RENAMED',
  DOCUMENT_MOVED = 'DOCUMENT_MOVED',
  DOCUMENT_COPIED = 'DOCUMENT_COPIED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  DOCUMENT_RESTORED = 'DOCUMENT_RESTORED',
  DOCUMENT_PERMANENTLY_DELETED = 'DOCUMENT_PERMANENTLY_DELETED',
  DOCUMENT_FAVORITED = 'DOCUMENT_FAVORITED',
  DOCUMENT_UNFAVORITED = 'DOCUMENT_UNFAVORITED',
  DOCUMENT_TAGGED = 'DOCUMENT_TAGGED',
  DOCUMENT_UNTAGGED = 'DOCUMENT_UNTAGGED',
  FOLDER_CREATED = 'FOLDER_CREATED',
  FOLDER_RENAMED = 'FOLDER_RENAMED',
  FOLDER_MOVED = 'FOLDER_MOVED',
  FOLDER_DELETED = 'FOLDER_DELETED',
  FOLDER_RESTORED = 'FOLDER_RESTORED',
  FOLDER_PERMANENTLY_DELETED = 'FOLDER_PERMANENTLY_DELETED',
  SHARE_CREATED = 'SHARE_CREATED',
  SHARE_UPDATED = 'SHARE_UPDATED',
  SHARE_REVOKED = 'SHARE_REVOKED',
  SHARE_LINK_CREATED = 'SHARE_LINK_CREATED',
  SHARE_LINK_ACCESSED = 'SHARE_LINK_ACCESSED',
  SHARE_LINK_REVOKED = 'SHARE_LINK_REVOKED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_SETTINGS_UPDATED = 'USER_SETTINGS_UPDATED',
}

export enum NotificationType {
  DOCUMENT_SHARED = 'DOCUMENT_SHARED',
  FOLDER_SHARED = 'FOLDER_SHARED',
  SHARE_LINK_ACCESSED = 'SHARE_LINK_ACCESSED',
  STORAGE_WARNING = 'STORAGE_WARNING',
  STORAGE_FULL = 'STORAGE_FULL',
  DOCUMENT_COMMENT = 'DOCUMENT_COMMENT',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}

export type Role = 'USER' | 'ADMIN';
export type AuthProvider = 'GOOGLE' | 'LOCAL';
export type ViewMode = 'grid' | 'list';
export type SortField = 'name' | 'date' | 'size' | 'type';
export type SortDirection = 'asc' | 'desc';
export type Theme = 'light' | 'dark';
export type ItemType = 'DOCUMENT' | 'FOLDER';

// ============================================================
// API Response Wrappers
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errors?: ErrorDetails[];
}

export interface ErrorDetails {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================================
// Auth DTOs
// ============================================================

export interface GoogleAuthRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // "Bearer"
  expiresIn: number;
  user: UserResponse;
}

// ============================================================
// User DTOs
// ============================================================

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  profilePictureUrl?: string;
  role: Role;
  authProvider: AuthProvider;
  storageUsed: number;
  storageQuota: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettingsResponse {
  id: string;
  theme: Theme;
  language: string;
  notificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  defaultViewMode: ViewMode;
  defaultSortField: SortField;
  defaultSortDirection: SortDirection;
  storageQuotaMb: number;
}

export interface UpdateProfileRequest {
  name: string;
  bio?: string;
}

export interface UpdateSettingsRequest {
  theme?: Theme;
  language?: string;
  notificationsEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  defaultViewMode?: ViewMode;
  defaultSortField?: SortField;
  defaultSortDirection?: SortDirection;
}

// ============================================================
// Document DTOs
// ============================================================

export interface DocumentResponse {
  id: string;
  name: string;
  originalName: string;
  contentType: string;
  size: number;
  category: DocumentCategory;
  storageKey: string;
  folderId?: string;
  folderName?: string;
  favorite: boolean;
  tags: string[];
  versionCount: number;
  currentVersion: number;
  thumbnailUrl?: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RenameDocumentRequest {
  newName: string;
}

export interface MoveDocumentRequest {
  targetFolderId?: string | null;
}

// ============================================================
// Folder DTOs
// ============================================================

export interface FolderResponse {
  id: string;
  name: string;
  description?: string;
  color?: string;
  parentFolderId?: string;
  parentFolderName?: string;
  documentCount: number;
  subfolderCount: number;
  totalSize: number;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTreeResponse {
  id: string;
  name: string;
  color?: string;
  parentFolderId?: string;
  documentCount: number;
  subfolderCount: number;
  children: FolderTreeResponse[];
}

export interface CreateFolderRequest {
  name: string;
  parentFolderId?: string | null;
  description?: string;
  color?: string;
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
  color?: string;
}

export interface MoveFolderRequest {
  targetParentFolderId: string | null;
}

// ============================================================
// Share DTOs
// ============================================================

export interface ShareWithUserRequest {
  email: string;
  permission: SharePermission;
  message?: string;
  notifyUser?: boolean;
}

export interface CreateShareLinkRequest {
  permission: SharePermission;
  password?: string;
  expiresAt?: string;
  maxAccessCount?: number;
}

export interface SharedItemResponse {
  id: string;
  itemType: ItemType;
  itemId: string;
  itemName: string;
  sharedByUserId: string;
  sharedByUserName: string;
  sharedByUserEmail: string;
  sharedWithUserId: string;
  sharedWithUserName: string;
  sharedWithUserEmail: string;
  permission: SharePermission;
  message?: string;
  createdAt: string;
}

export interface ShareLinkResponse {
  id: string;
  token: string;
  itemType: ItemType;
  itemId: string;
  itemName: string;
  permission: SharePermission;
  hasPassword: boolean;
  expiresAt?: string;
  maxAccessCount?: number;
  accessCount: number;
  createdByUserName: string;
  createdAt: string;
  active: boolean;
}

export interface PublicShareResponse {
  itemName: string;
  itemType: ItemType;
  contentType?: string;
  size?: number;
  permission: SharePermission;
  sharedBy: string;
  previewUrl?: string;
}

// ============================================================
// Trash DTOs
// ============================================================

export interface TrashItemResponse {
  id: string;
  itemType: ItemType;
  itemId: string;
  itemName: string;
  originalFolderId?: string;
  originalFolderName?: string;
  size: number;
  deletedAt: string;
  expiresAt: string;
}

// ============================================================
// Notification DTOs
// ============================================================

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  relatedItemId?: string;
  relatedItemType?: ItemType;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ============================================================
// Activity DTOs
// ============================================================

export interface ActivityResponse {
  id: string;
  activityType: ActivityType;
  description: string;
  itemId?: string;
  itemName?: string;
  itemType?: ItemType;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ============================================================
// Dashboard DTOs
// ============================================================

export interface DashboardStatsResponse {
  totalDocuments: number;
  totalFolders: number;
  storageUsed: number;
  storageQuota: number;
  storageUsedPercentage: number;
  favoriteCount: number;
  sharedWithMeCount: number;
  sharedByMeCount: number;
  documentsByCategory: Record<string, number>;
  recentDocuments: DocumentResponse[];
  recentActivities: ActivityResponse[];
}

// ============================================================
// Search DTOs
// ============================================================

export interface SearchResultResponse {
  id: string;
  name: string;
  itemType: ItemType;
  contentType?: string;
  category?: DocumentCategory;
}

export interface SearchRequest {
  query?: string;
  category?: DocumentCategory;
  contentType?: string;
  folderId?: string;
  startDate?: string;
  endDate?: string;
  sizeMin?: number;
  sizeMax?: number;
  favoritesOnly?: boolean;
  tags?: string[];
  sortBy?: SortField;
}

// ============================================================
// Health
// ============================================================

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}
