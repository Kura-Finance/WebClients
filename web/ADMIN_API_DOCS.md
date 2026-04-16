/**
 * 管理員路由 API 文件
 * ==========================================
 * 前端適配後端管理員帳戶管理路由
 * ==========================================
 * 
 * 認證要求:
 *   - 所有端點均需要用 Secret Key 登入後的有效 JWT Token
 *   - Token 存儲在 HttpOnly Cookie: adminToken
 *   - 或在 Header 中: X-Admin-Token
 * 
 * 基礎 URL: http://localhost:3000/api/admin
 */

/**
 * POST /api/admin/admins
 * 創建新管理員帳戶
 * 
 * 認證:
 *   Cookie: adminToken (自動發送)
 *   或 Header: X-Admin-Token
 * 
 * 請求體:
 * {
 *   "email": "string (required)",        // 管理員郵箱
 *   "name": "string (optional)"          // 管理員名稱，默認為郵箱前綴
 * }
 * 
 * 成功回應 (201):
 * {
 *   "message": "Admin created successfully",
 *   "admin": {
 *     "id": "16",
 *     "email": "newadmin@example.com",
 *     "name": "New Admin",
 *     "createdAt": "2026-04-16T17:08:34.178Z"
 *   }
 * }
 * 
 * 錯誤回應:
 * - 401: 未授權 (無有效 Token)
 * - 400: 無效郵箱格式
 * - 409: 郵箱已存在
 * - 500: 伺服器錯誤
 */
POST /api/admin/admins
Content-Type: application/json
Cookie: adminToken=<valid-jwt-token>

{
  "email": "newadmin@example.com",
  "name": "New Admin"
}

---

/**
 * PUT /api/admin/admins/:adminId
 * 修改管理員帳戶
 * 
 * 認證:
 *   Cookie: adminToken (自動發送)
 *   或 Header: X-Admin-Token
 * 
 * 參數:
 *   - adminId: 管理員 ID (路徑參數)
 * 
 * 請求體 (任一或多個欄位):
 * {
 *   "email": "string (optional)",        // 新郵箱地址
 *   "name": "string (optional)"          // 新名稱
 * }
 * 
 * 成功回應 (200):
 * {
 *   "message": "Admin updated successfully",
 *   "admin": {
 *     "id": "16",
 *     "email": "updated@example.com",
 *     "name": "Updated Admin",
 *     "createdAt": "2026-04-16T17:08:34.178Z"
 *   }
 * }
 * 
 * 錯誤回應:
 * - 401: 未授權 (無有效 Token)
 * - 400: 無效郵箱格式
 * - 404: 管理員不存在
 * - 409: 郵箱已存在
 * - 500: 伺服器錯誤
 */
PUT /api/admin/admins/16
Content-Type: application/json
Cookie: adminToken=<valid-jwt-token>

{
  "email": "updated@example.com",
  "name": "Updated Admin"
}

---

/**
 * DELETE /api/admin/admins/:adminId
 * 刪除管理員帳戶
 * 
 * 認證:
 *   Cookie: adminToken (自動發送)
 *   或 Header: X-Admin-Token
 * 
 * 參數:
 *   - adminId: 管理員 ID (路徑參數)
 * 
 * 成功回應 (200):
 * {
 *   "message": "Admin deleted successfully",
 *   "admin": {
 *     "id": "16",
 *     "email": "updated@example.com",
 *     "name": "Updated Admin",
 *     "createdAt": "2026-04-16T17:08:34.178Z"
 *   }
 * }
 * 
 * 錯誤回應:
 * - 401: 未授權 (無有效 Token)
 * - 403: 禁止 (無法刪除系統管理員)
 * - 404: 管理員不存在
 * - 500: 伺服器錯誤
 * 
 * 特殊限制:
 *   - 無法刪除系統管理員 (adminId = 'secret-admin')
 */
DELETE /api/admin/admins/16
Cookie: adminToken=<valid-jwt-token>

---

/**
 * GET /api/admin/admins
 * 列出所有管理員帳戶 (包含分頁和搜尋)
 * 
 * 認證:
 *   Cookie: adminToken (自動發送)
 *   或 Header: X-Admin-Token
 * 
 * 查詢參數:
 *   - page: 分頁頁碼 (默認: 1)
 *   - pageSize: 每頁項目數 (默認: 10, 最大: 100)
 *   - search: 搜尋關鍵字 (按郵箱或名稱搜尋)
 * 
 * 成功回應 (200):
 * {
 *   "admins": [
 *     {
 *       "id": "1",
 *       "email": "admin@example.com",
 *       "name": "John Admin",
 *       "createdAt": "2026-03-18T00:00:00.000Z"
 *     },
 *     ...
 *   ],
 *   "total": 15,              // 符合條件的總管理員數
 *   "page": 1,                // 當前頁碼
 *   "pageSize": 10,           // 每頁項目數
 *   "totalPages": 2           // 總頁數
 * }
 * 
 * 錯誤回應:
 * - 401: 未授權 (無有效 Token)
 * - 500: 伺服器錯誤
 */
GET /api/admin/admins?page=1&pageSize=10&search=alice
Cookie: adminToken=<valid-jwt-token>

---

/**
 * 客戶端函數 (app/lib/admin/adminAuth.ts)
 * ==========================================
 */

// 創建新管理員
import { createAdmin } from '@/lib/admin/adminAuth';

try {
  const newAdmin = await createAdmin('newemail@example.com', 'New Admin Name');
  console.log('Admin created:', newAdmin);
} catch (error) {
  console.error('Failed to create admin:', error.message);
}

// 更新管理員
import { updateAdmin } from '@/lib/admin/adminAuth';

try {
  const updated = await updateAdmin('16', {
    email: 'updated@example.com',
    name: 'Updated Name'
  });
  console.log('Admin updated:', updated);
} catch (error) {
  console.error('Failed to update admin:', error.message);
}

// 刪除管理員
import { deleteAdmin } from '@/lib/admin/adminAuth';

try {
  await deleteAdmin('16');
  console.log('Admin deleted successfully');
} catch (error) {
  console.error('Failed to delete admin:', error.message);
}
