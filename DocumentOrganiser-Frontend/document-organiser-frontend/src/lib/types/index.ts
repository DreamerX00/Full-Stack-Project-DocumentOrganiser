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
  error?: ErrorDetails;
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

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // "Bearer"
  expiresIn: number;
  user: UserResponse;
}

// ============================================================
// User DTOs (matches backend UserResponse.java)
// ============================================================

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  role: Role;
  emailVerified?: boolean;
  storageUsedBytes: number;
  storageLimitBytes: number;
  createdAt: string;
  settings?: UserSettingsResponse;
}

export interface UserSettingsResponse {
  theme: string;
  language: string;
  storageLimitMb?: number;
  notificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  defaultView: string;
  sortBy: string;
  sortOrder: string;
  // Onboarding fields
  profession?: string;
  subcategory?: string;
  specialization?: string;
  onboardingComplete?: boolean;
}

export interface UpdateProfileRequest {
  name: string;
  bio?: string;
}

export interface UpdateSettingsRequest {
  theme?: string;
  language?: string;
  notificationsEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  defaultView?: string;
  sortBy?: string;
  sortOrder?: string;
  // Onboarding fields
  profession?: string;
  subcategory?: string;
  specialization?: string;
  onboardingComplete?: boolean;
}

// ============================================================
// Document DTOs (matches backend DocumentResponse.java)
// ============================================================

export interface DocumentResponse {
  id: string;
  name: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  category: DocumentCategory;
  version: number;
  isFavorite: boolean;
  downloadCount: number;
  folderId?: string;
  folderPath?: string;
  tags: string[];
  thumbnailUrl?: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
}

export interface RenameDocumentRequest {
  newName: string;
}

export interface MoveDocumentRequest {
  targetFolderId?: string | null;
}

// ============================================================
// Folder DTOs (matches backend FolderResponse.java)
// ============================================================

export interface FolderResponse {
  id: string;
  name: string;
  path: string;
  color?: string;
  description?: string;
  isRoot: boolean;
  parentFolderId?: string;
  createdAt: string;
  updatedAt: string;
  subFolders: FolderResponse[];
  documentCount: number;
  subFolderCount: number;
}

export interface FolderTreeResponse {
  id: string;
  name: string;
  path?: string;
  color?: string;
  isRoot?: boolean;
  children: FolderTreeResponse[];
  documentCount: number;
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
  targetFolderId: string | null;
}

// ============================================================
// Share DTOs (matches backend SharedItemResponse.java)
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
  itemType: string;
  itemId: string;
  itemName: string;
  sharedByEmail: string;
  sharedByName: string;
  sharedWithEmail: string;
  sharedWithName: string;
  permission: SharePermission;
  expiresAt?: string;
  message?: string;
  createdAt: string;
  isExpired?: boolean;
}

export interface ShareLinkResponse {
  id: string;
  token: string;
  url: string;
  itemType: string;
  itemId: string;
  itemName: string;
  permission: SharePermission;
  expiresAt?: string;
  hasPassword: boolean;
  accessCount: number;
  maxAccessCount?: number;
  isActive: boolean;
  createdAt: string;
}

// ============================================================
// Trash DTOs (matches backend TrashItemResponse.java)
// ============================================================

export interface TrashItemResponse {
  id: string;
  itemType: string;
  itemId: string;
  itemName: string;
  originalPath?: string;
  fileSize: number;
  deletedAt: string;
  expiresAt: string;
  daysUntilPermanentDeletion: number;
}

// ============================================================
// Notification DTOs (matches backend NotificationResponse.java)
// ============================================================

export interface NotificationResponse {
  id: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  resourceType?: string;
  resourceId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ============================================================
// Activity DTOs (matches backend ActivityResponse.java)
// ============================================================

export interface ActivityResponse {
  id: string;
  activityType: ActivityType;
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ============================================================
// Dashboard DTOs (matches backend DashboardStatsResponse.java)
// ============================================================

export interface DashboardStatsResponse {
  totalDocuments: number;
  totalFolders: number;
  storageUsedBytes: number;
  storageLimitBytes: number;
  storageUsedPercentage: number;
  favoriteCount: number;
  sharedWithMeCount: number;
  sharedByMeCount: number;
  documentsByCategory: Record<string, number>;
  recentDocuments: DocumentResponse[];
  recentActivity: ActivityResponse[];
}

// ============================================================
// Search DTOs (matches backend SearchResultResponse.java)
// ============================================================

export interface SearchResultResponse {
  documents: DocumentResponse[];
  folders: FolderResponse[];
  totalDocuments: number;
  totalFolders: number;
  totalResults: number;
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
