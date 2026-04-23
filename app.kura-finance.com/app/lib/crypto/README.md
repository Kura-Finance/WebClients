# Zero-Knowledge Crypto Setup

## 前端安裝指令

```bash
cd /Users/rick/Code/kura/app.kura-finance.com
npm install tssrp6a
```

> `keyDerivation.ts` 使用瀏覽器原生 Web Crypto API，**不需要額外安裝套件**。

## 新增檔案

```
app/lib/crypto/
├── keyDerivation.ts    # PBKDF2 + HKDF + AES-GCM（純 Web Crypto）
├── srpClient.ts        # SRP-6a client（需要 tssrp6a）
└── zkAuth.ts           # 整合入口（login/register/clearSession）
```

## 流程說明

### 登入（SRP 模式）
```
1. getSRPSalts(email) → { srpSalt, kekSalt }
2. deriveKeysFromPassword(password, srpSalt, kekSalt) → { kek, authKeyHex }
   (純 client，password 永遠不傳出去)
3. srpChallengePhase1(email) → { sessionId, serverB, encryptedDataKey }
4. srpVerifyPhase2(email, authKeyHex, ...) → { user, serverM2 }
5. unsealDataKey(encryptedDataKey, kek) → dataKeyHex（存 memory）
```

### 註冊（驗證碼 + SRP）
```
1. requestRegistrationCode(email) → 後端寄送驗證碼
2. 前端本地推導 srpSalt/srpVerifier/kekSalt
3. 前端本地產生並加密 Data Key → encryptedDataKey
4. verifyRegistration(email, verificationCode, srpSalt, srpVerifier, encryptedDataKey, kekSalt)
```

### 安全屬性
| 資產 | 存放位置 | 後端可見 |
|------|----------|----------|
| 密碼 | 從不離開瀏覽器 | ❌ |
| Master Key | 只在 JS memory | ❌ |
| KEK | Web Crypto（不可匯出） | ❌ |
| Data Key | JS memory（登出清除） | ❌ |
| encryptedDataKey | DB | ✅（但無法解密）|
| SRP verifier | DB | ✅（但無法反推密碼）|
