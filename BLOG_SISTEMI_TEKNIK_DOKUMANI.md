# Kişisel Blog Sistemi — Teknik Uygulama Dokümanı

> Spring Boot + Next.js ile öğretici, sınırları belirlenmiş bir kişisel blog projesi  
> Doküman tarihi: 31 Ağustos 2026  
> Durum: Kapsam sabitlendi

## 1. Dokümanın amacı

Bu doküman kodun kendisi değildir. Projeyi geliştirecek kişinin hangi sırayla, hangi sınırlar içinde ve hangi kabul kriterleriyle ilerleyeceğini tarif eder. Her checkpoint tamamlanmadan sonraki checkpoint'e geçilmemelidir.

Proje iki uygulamadan oluşur:

- `backend`: Java 21, Spring Boot ve Maven ile REST API.
- `frontend`: Next.js App Router ile public sayfalar ve `/admin` paneli.

Yerel çalışma adresleri:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PostgreSQL: geliştiricinin yerel PostgreSQL kurulumu
- Yüklenen dosyalar: backend'in yerel `uploads/` dizini

Bu doküman domain, sunucuya yayınlama, Docker, CI/CD, CDN veya bulut depolama anlatmaz.

---

## 2. Sabit kapsam

### 2.1 Public sayfalar

- `/` — ana sayfa ve son blog yazıları
- `/blog` — blog listesi
- `/blog/[slug]` — blog detayı
- `/about` — hakkımda
- `/projects` — projeler
- `/contact` — iletişim bilgileri

### 2.2 Admin sayfaları

- `/admin/login`
- `/admin`
- `/admin/blog`
- `/admin/blog/new`
- `/admin/blog/[id]/edit`
- `/admin/about`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/[id]/edit`
- `/admin/contact`
- `/admin/account`

Public ve admin sayfaları aynı Next.js projesinde bulunur. Backend dışında ikinci bir API veya Next.js Route Handler katmanı kurulmaz.

### 2.3 Kapsam dışında kalanlar

- Kullanıcı kaydı ve çoklu kullanıcı
- Rol/izin matrisi; yalnızca tek `ADMIN` vardır
- Şifremi unuttum ve e-posta gönderimi
- Taslak/yayınlama iş akışı
- Kategori, etiket ve arama
- Yorum, beğeni ve görüntülenme sayacı
- İletişim mesaj formu
- TinyMCE içinden görsel/video yükleme
- Görsel kırpma ve otomatik format dönüştürme
- Çoklu dil
- Domain, production cookie ayarı ve deployment
- Object storage, CDN ve dosya yedekleme otomasyonu

Bu maddeler ilk sürüme yanlışlıkla eklenmemelidir.

---

## 3. Teknoloji tabanı

Doküman hazırlanırken doğrulanan stabil sürümler:

| Alan | Seçim | Not |
|---|---|---|
| Backend | Spring Boot `4.1.1` | Preview `4.2.0-M1` kullanılmaz |
| Java | Java `21` LTS | Spring Boot 4.1.1 ile uyumludur |
| Build | Maven `3.6.3+` | Maven Wrapper repoya eklenir |
| Güvenlik | Spring Security `7.1.x` | Sürümü Spring Boot yönetir |
| Veritabanı | PostgreSQL | Şema Flyway ile yönetilir |
| Frontend | Next.js `16.2.9` | App Router + TypeScript |
| Node.js | `20.9+` | Next.js 16 alt sınırı |
| Rich text | TinyMCE `8` | Resmî React wrapper kullanılır |

Sürüm seçimi için stabil sürüm sabitlenir ve lock dosyaları repoya alınır. Her kurulumda körlemesine `latest` yükseltmesi yapılmaz.

### 3.1 Backend bağımlılıkları

Spring Initializr veya `pom.xml` üzerinden şu bağımlılıklar seçilir:

- `spring-boot-starter-webmvc`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `spring-boot-starter-security`
- `spring-boot-starter-security-oauth2-resource-server`
- `spring-boot-starter-flyway`
- PostgreSQL JDBC driver
- `spring-boot-starter-test`
- `spring-security-test`

Rich text temizliği için ayrıca bakımı devam eden bir sunucu tarafı HTML sanitizer seçilmelidir. Öneri: **OWASP Java HTML Sanitizer**. Sürümü Maven Central'daki güncel stabil sürümden doğrulanıp açıkça sabitlenmelidir.

`Lombok`, `MapStruct`, özel JWT kütüphanesi ve ayrı dosya yükleme kütüphanesi eklenmez. Manuel mapper yeterlidir; JWT üretme/doğrulama Spring Security'nin `JwtEncoder` ve `JwtDecoder` API'leriyle yapılır. Multipart desteği Spring MVC'de zaten vardır.

### 3.2 Frontend bağımlılıkları

- Next.js tarafından gelen React ve TypeScript bağımlılıkları
- `@tinymce/tinymce-react`

Başlangıçta state management, form, HTTP client veya auth kütüphanesi eklenmez. Native `fetch`, React state ve `FormData` bu kapsam için yeterlidir.

### Araştırma notları

Geliştirmeye başlamadan önce şu kavramlar kısa şekilde araştırılmalıdır:

- Spring Boot starter ve dependency management ne sağlar?
- Next.js Server Component ile Client Component farkı nedir?
- JPA Entity ile API DTO neden aynı nesne olmamalıdır?
- Database migration neden `ddl-auto=create` yerine tercih edilir?

---

## 4. Mimari sınırlar

### 4.1 İstek akışı

```text
Browser
  └─ Next.js :3000
       ├─ public sayfalar ───────┐
       └─ /admin + formlar ─────┼─ fetch + credentials ──> Spring Boot :8080
                                │                           ├─ PostgreSQL
                                │                           └─ ./uploads
                                └─────────────────────────────────────────
```

Next.js doğrudan PostgreSQL'e veya dosya sistemine erişmez. Bütün iş kuralları, yetkilendirme ve kalıcı veri kontrolü backend'dedir.

### 4.2 Backend paketleme

Katmanları proje genelinde dağıtmak yerine özellik bazlı paketleme kullanılır:

```text
com.example.blog
├── auth
│   ├── controller
│   ├── dto
│   ├── entity
│   ├── repository
│   └── service
├── blog
│   ├── controller
│   ├── dto
│   ├── entity
│   ├── mapper
│   ├── repository
│   └── service
├── about
├── project
├── contact
├── storage
├── security
├── config
└── common
    ├── error
    └── validation
```

Kısa tanımlar:

- **Entity:** Veritabanı tablosuna eşlenen nesne.
- **DTO:** API'nin aldığı veya döndürdüğü kontrollü veri şekli.
- **Mapper:** Entity ile DTO arasındaki dönüşümü yapar.
- **Repository:** Veritabanı erişimini soyutlar.
- **Service:** İş kurallarının bulunduğu katmandır.
- **ServiceImpl:** Service sözleşmesinin uygulanmasıdır.
- **Controller:** HTTP isteğini alır; iş kuralı taşımaz.

Service + Impl ayrımı bu öğretici dokümanın açık gereksinimidir. Yeni özellikler için ek soyutlama, factory veya generic CRUD altyapısı kurulmaz.

### 4.3 Frontend klasörleme

```text
src
├── app
│   ├── (public)
│   │   ├── blog
│   │   ├── about
│   │   ├── projects
│   │   └── contact
│   └── admin
├── components
│   ├── public
│   └── admin
├── features
│   ├── auth
│   ├── blog
│   ├── about
│   ├── projects
│   └── contact
└── lib
    ├── api.ts
    └── validation.ts
```

Admin ve public bileşenler karıştırılmaz. Bununla birlikte her dosya için ayrı soyutlama üretilmez; tekrar oluşmadan helper yazılmaz.

---

## 5. Veri modeli

Kimlik alanlarında PostgreSQL `BIGINT GENERATED BY DEFAULT AS IDENTITY` kullanılabilir. Zamanlar UTC tutulur; API'de ISO-8601 döndürülür.

### 5.1 `admin_users`

| Alan | Tür | Kural |
|---|---|---|
| `id` | bigint | Primary key |
| `username` | varchar(80) | Unique, boş olamaz |
| `password_hash` | varchar(100) | BCrypt hash |
| `created_at` | timestamptz | Otomatik |
| `updated_at` | timestamptz | Otomatik |

İlk admin, uygulama açılırken `ADMIN_USERNAME` ve `ADMIN_PASSWORD` environment değerlerinden yalnızca kayıt yoksa oluşturulur. Düz parola veritabanına veya loglara yazılmaz.

### 5.2 `refresh_sessions`

| Alan | Tür | Kural |
|---|---|---|
| `id` | uuid | JWT `jti` değeri |
| `admin_id` | bigint | FK → `admin_users` |
| `token_hash` | char(64) | Refresh JWT'nin SHA-256 özeti |
| `expires_at` | timestamptz | Zorunlu |
| `revoked_at` | timestamptz | Nullable |
| `created_at` | timestamptz | Otomatik |

Ham refresh token saklanmaz. Refresh işlemi eski oturumu iptal edip yeni token üretir.

### 5.3 `blog_posts`

| Alan | Tür | Kural |
|---|---|---|
| `id` | bigint | Primary key |
| `title` | varchar(150) | 3–150 karakter |
| `summary` | varchar(300) | 20–300 karakter |
| `content_html` | text | Temizlenmiş rich text |
| `slug` | varchar(180) | Unique, değişmez |
| `thumbnail_path` | varchar(255) | Relative dosya yolu |
| `thumbnail_alt` | varchar(160) | Erişilebilirlik için zorunlu |
| `reading_time_minutes` | smallint | Backend hesaplar |
| `created_at` | timestamptz | Otomatik |
| `updated_at` | timestamptz | Otomatik |

Slug başlık ilk oluşturulduğunda üretilir. Başlık daha sonra değişse bile mevcut bağlantı bozulmaması için slug otomatik değiştirilmez. Çakışmada `ornek-baslik-2`, `ornek-baslik-3` biçiminde sıra eklenir.

### 5.4 `about_pages`

| Alan | Tür | Kural |
|---|---|---|
| `id` | bigint | Tek kayıt |
| `content_html` | text | Temizlenmiş rich text |
| `updated_at` | timestamptz | Otomatik |

Bu tablo tek kayıtlı bir ayar sayfasıdır. Admin ekranı `PUT` ile oluşturur veya günceller; ayrı listeleme/silme akışı yoktur.

### 5.5 `projects`

| Alan | Tür | Kural |
|---|---|---|
| `id` | bigint | Primary key |
| `title` | varchar(150) | Düz metin, 3–150 karakter |
| `description_html` | text | Temizlenmiş rich text |
| `image_path` | varchar(255) | Relative dosya yolu |
| `image_alt` | varchar(160) | Zorunlu |
| `github_url` | varchar(300) | Nullable, HTTPS GitHub URL |
| `created_at` | timestamptz | Otomatik |
| `updated_at` | timestamptz | Otomatik |

Projeler en yeni kayıt önce olacak şekilde sıralanır. İlk sürümde sürükle-bırak sıralama alanı yoktur.

### 5.6 `contact_info` ve `social_links`

`contact_info`:

| Alan | Tür | Kural |
|---|---|---|
| `id` | bigint | Tek kayıt |
| `email` | varchar(254) | Geçerli e-posta, zorunlu |
| `updated_at` | timestamptz | Otomatik |

`social_links`:

| Alan | Tür | Kural |
|---|---|---|
| `id` | bigint | Primary key |
| `contact_info_id` | bigint | FK |
| `platform` | varchar(30) | İzinli platformlardan biri |
| `url` | varchar(300) | HTTPS URL |

İzinli platformlar: `GITHUB`, `LINKEDIN`, `X`, `INSTAGRAM`, `YOUTUBE`, `WEBSITE`. Aynı platform bir kez eklenebilir. `PUT /api/admin/contact` işlemi e-posta ve link listesini birlikte günceller.

### Araştırma notları

- `timestamptz` ile Java `Instant` arasındaki ilişki nedir?
- Unique constraint yalnızca uygulama kontrolünden neden daha güvenlidir?
- Refresh token'ın kendisi yerine hash'i neden saklanır?
- `CascadeType.ALL` her ilişkide neden otomatik tercih edilmemelidir?

---

## 6. İçerik ve dosya validasyonları

Frontend aynı kontrolleri kullanıcı deneyimi için tekrarlar; fakat güvenilir kaynak backend'dir.

### 6.1 Metin sınırları

| Alan | Minimum | Maksimum | Ölçüm |
|---|---:|---:|---|
| Blog başlığı | 3 | 150 | Trim edilmiş düz metin |
| Kısa açıklama | 20 | 300 | Trim edilmiş düz metin |
| Blog içeriği | 100 | 50.000 | HTML temizlendikten sonraki düz metin |
| Thumbnail alt metni | 3 | 160 | Düz metin |
| Hakkımda | 100 | 30.000 | Temizlenmiş düz metin |
| Proje başlığı | 3 | 150 | Düz metin |
| Proje açıklaması | 20 | 20.000 | Temizlenmiş düz metin |
| Proje görsel alt metni | 3 | 160 | Düz metin |

HTML etiket sayısı karakter sınırını yanıltmamalıdır. Doğru sıra:

1. Gelen HTML'yi sanitize et.
2. Sanitize edilen HTML'den düz metni çıkar.
3. Boşlukları normalize et.
4. Minimum/maksimum uzunluğu bu metinde kontrol et.
5. Temizlenmiş HTML'yi kaydet.

### 6.2 TinyMCE HTML politikası

İzin verilecek temel öğeler:

- Paragraf ve başlıklar: `p`, `h2`, `h3`, `h4`
- Vurgu: `strong`, `em`, `u`, `s`
- Liste: `ul`, `ol`, `li`
- İçerik: `blockquote`, `pre`, `code`, `br`
- Bağlantı: `a[href]`

Engellenecekler:

- `script`, `style`, `iframe`, `object`, `embed`
- `onerror`, `onclick` gibi bütün event attribute'ları
- `javascript:` ve güvenli olmayan URL şemaları
- Inline görsel, video ve dosya embedleri

Dış bağlantılara güvenli `rel="noopener noreferrer"` davranışı eklenmelidir. Frontend'de `dangerouslySetInnerHTML` yalnızca backend tarafından sanitize edilmiş içerik için kullanılabilir.

### 6.3 Görsel sınırları

- Format: JPEG veya PNG
- Maksimum dosya boyutu: `5 MB`
- Minimum ölçü: `320 × 180`
- Maksimum ölçü: `4096 × 4096`
- Blog için bir thumbnail zorunlu
- Proje için bir görsel zorunlu
- Güncellemede yeni dosya gönderilmezse mevcut dosya korunur

Kontrol yalnızca uzantıyla yapılmaz:

1. Multipart isteğinin toplam boyutunu Spring ayarında sınırla.
2. `MultipartFile#getSize()` ile boyutu kontrol et.
3. İzinli media type kontrolü yap.
4. Dosya imzası/gerçek görüntü olarak okunabilirliğini kontrol et.
5. Görsel header'ından genişlik ve yüksekliği kontrol et.
6. Orijinal adı kullanmadan UUID tabanlı dosya adı üret.

Örnek ayar:

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 6MB

app:
  storage:
    upload-dir: ${UPLOAD_DIR:./uploads}
```

Backend içindeki doğrulama yine gereklidir; servlet limiti tek başına dosyanın gerçekten JPEG/PNG olduğunu kanıtlamaz.

### 6.4 Dosya yaşam döngüsü

- Veritabanında absolute path değil, `blog/<uuid>.jpg` gibi relative path tutulur.
- `uploads/` Git'e eklenmez.
- Yeni kayıt başarısız olursa o istek sırasında yazılan dosya silinir.
- Görsel değiştirme başarıyla tamamlanınca eski dosya silinir.
- İçerik silinince bağlı dosya silinir.
- Dosya silinemediğinde veritabanı işlemi sessizce başarılı gösterilmez; hata loglanır ve kontrollü cevap dönülür.
- Dosya yolu kullanıcı girdisiyle birleştirilmez; path traversal engellenir.

Public görseller Spring'in static resource mapping özelliğiyle `/uploads/**` altında sunulur. Ayrı bir image controller yazmak gerekmez.

### 6.5 Okuma süresi

Okuma süresi yönetici tarafından girilmez. Backend sanitize edilmiş düz metindeki kelime sayısını kullanır:

```text
readingTime = max(1, ceil(wordCount / 200.0))
```

Bu basit model Türkçe kişisel blog için yeterlidir. Daha gelişmiş dil analizi bu projenin kapsamında değildir.

---

## 7. Authentication ve güvenlik sözleşmesi

### 7.1 Temel kararlar

- Tek admin hesabı vardır.
- Access ve refresh token JWT'dir.
- İki JWT de `HttpOnly` cookie içindedir.
- Token değerleri JSON response ile frontend'e verilmez.
- Access token ömrü: `15 dakika`.
- Refresh token ömrü: `7 gün`.
- Access ve refresh için ayrı, güçlü HMAC secret kullanılır.
- Refresh token her kullanımda döndürülür; eski token iptal edilir.
- Frontend tokenları `localStorage` veya `sessionStorage` içinde tutmaz.

### 7.2 Yerel cookie ayarları

| Cookie | HttpOnly | SameSite | Secure | Path | Süre |
|---|---|---|---|---|---|
| `access_token` | Evet | `Strict` | Hayır | `/api` | 15 dk |
| `refresh_token` | Evet | `Strict` | Hayır | `/api/auth` | 7 gün |
| `XSRF-TOKEN` | Hayır | `Strict` | Hayır | `/` | Oturum |

`Domain` attribute'u yazılmaz. `Secure=false` yalnızca `http://localhost` geliştirme kapsamı içindir. Bu doküman production cookie konfigürasyonu tarif etmez.

### 7.3 CORS

Backend yalnızca şu origin'e izin verir:

```text
http://localhost:3000
```

Gerekli kurallar:

- `allowCredentials(true)`
- İzinli metotlar: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- İzinli header'lar: `Content-Type`, `X-XSRF-TOKEN`
- Origin için `*` kullanılmaz
- Frontend bütün auth/admin çağrılarında `credentials: "include"` kullanır

Port farkı nedeniyle frontend ve backend cross-origin'dir. İkisinin de `localhost` olması cookie ve CSRF gereksinimini ortadan kaldırmaz.

### 7.4 CSRF

Cookie tabanlı authentication CSRF koruması gerektirir. Spring Security'nin `CookieCsrfTokenRepository` mekanizması kullanılır:

- Backend `XSRF-TOKEN` cookie'sini üretir.
- Bu cookie auth tokenı değildir; JavaScript'in okuyabilmesi için `HttpOnly=false` olur.
- Frontend değiştiren isteklerde değeri `X-XSRF-TOKEN` header'ına koyar.
- Login ve logout sonrasında yeni CSRF token alınır.
- `GET`, `HEAD` ve `OPTIONS` dışındaki istekler token olmadan reddedilir.

Frontend açılışta `GET /api/auth/csrf` çağrısı yapar. Login sonrası Spring eski CSRF değerini temizleyebileceğinden aynı endpoint tekrar çağrılır.

### 7.5 Authentication akışları

#### Login

1. Frontend CSRF token alır.
2. Kullanıcı adı/parola `POST /api/auth/login` ile gönderilir.
3. Backend BCrypt ile parolayı doğrular.
4. Access JWT ve refresh JWT üretir.
5. Refresh JWT hash'i `refresh_sessions` tablosuna yazılır.
6. İki JWT cookie olarak eklenir; response body token içermez.
7. Frontend `GET /api/auth/me` ile admin bilgisini alır.

#### Access token yenileme

1. Admin isteği `401` alır.
2. Frontend yalnızca bir kez `POST /api/auth/refresh` çağırır.
3. Backend refresh JWT imzasını, süresini, `type` claim'ini ve DB hash'ini doğrular.
4. Eski refresh session iptal edilir.
5. Yeni access + refresh JWT ve yeni refresh session üretilir.
6. İlk istek bir kez tekrar edilir.
7. Refresh de başarısızsa kullanıcı login sayfasına yönlendirilir.

Sonsuz retry döngüsü kurulmaz. Aynı anda gelen çok sayıda `401` için tek refresh isteğini paylaşma problemi araştırılmalı; ilk sürümde basit bir in-memory promise kilidi yeterlidir.

#### Logout

- Mevcut refresh session iptal edilir.
- Access ve refresh cookie'leri oluşturuldukları aynı `Path` değerleriyle temizlenir.
- Response `204 No Content` olur.

#### Şifre değiştirme

- Eski parola tekrar doğrulanır.
- Yeni parola en az 12, en fazla 72 karakter olur.
- Yeni parola BCrypt ile hash'lenir.
- Admin'e ait bütün refresh session kayıtları iptal edilir.
- Cookie'ler temizlenir; kullanıcı tekrar login olur.

#### Tüm oturumları kapatma

- Admin'e ait bütün aktif refresh session kayıtları iptal edilir.
- Mevcut cookie'ler temizlenir.

### 7.6 Backend yetkilendirme

- `/api/auth/**` içindeki login, refresh ve CSRF endpoint'leri kendi kurallarına göre açıktır.
- `GET /api/public/**` ve `/uploads/**` public'tir.
- `/api/admin/**` yalnızca doğrulanmış `ADMIN` yetkisine açıktır.
- Frontend route guard yalnızca kullanıcı deneyimidir; gerçek güvenlik backend'de yapılır.

Access cookie'yi Spring Security'ye bağlamak için `BearerTokenResolver` sözleşmesinin cookie okuyan küçük bir implementasyonu kullanılabilir. Yeni bir tam auth framework'ü kurulmaz.

### Araştırma notları

- `HttpOnly`, `SameSite`, `Secure`, `Path` ve `Domain` neyi ayrı ayrı korur?
- XSS ve CSRF arasındaki fark nedir?
- Refresh token rotation ve replay detection neden birlikte düşünülür?
- JWT imzası token içeriğini neden şifrelemez?
- Frontend route guard neden backend authorization yerine geçmez?

---

## 8. REST API sözleşmesi

API prefix'i `/api` olarak sabittir. Tarihler ISO-8601, content type varsayılan olarak `application/json` olur.

### 8.1 Auth endpoint'leri

| Metot | Endpoint | Yetki | Sonuç |
|---|---|---|---|
| `GET` | `/api/auth/csrf` | Public | CSRF token üretir/döndürür |
| `POST` | `/api/auth/login` | Public + CSRF | Cookie'leri oluşturur, `204` |
| `POST` | `/api/auth/refresh` | Refresh cookie + CSRF | Tokenları döndürür, `204` |
| `POST` | `/api/auth/logout` | Auth + CSRF | Mevcut oturumu kapatır, `204` |
| `POST` | `/api/auth/logout-all` | Auth + CSRF | Tüm oturumları kapatır, `204` |
| `GET` | `/api/auth/me` | Auth | Admin özetini döndürür |
| `PUT` | `/api/auth/password` | Auth + CSRF | Şifreyi değiştirir, `204` |

### 8.2 Public endpoint'ler

| Metot | Endpoint | Sonuç |
|---|---|---|
| `GET` | `/api/public/blog-posts` | En yeni blog yazıları |
| `GET` | `/api/public/blog-posts/{slug}` | Blog detayı |
| `GET` | `/api/public/about` | Hakkımda içeriği |
| `GET` | `/api/public/projects` | En yeni projeler |
| `GET` | `/api/public/contact` | E-posta + sosyal linkler |

İlk sürümde blog listesi sayfalama olmadan döner. Kayıt sayısı ölçülebilir biçimde büyürse pagination eklenir.

### 8.3 Admin endpoint'leri

| Metot | Endpoint | Veri biçimi |
|---|---|---|
| `GET` | `/api/admin/blog-posts` | JSON |
| `POST` | `/api/admin/blog-posts` | Multipart |
| `GET` | `/api/admin/blog-posts/{id}` | JSON |
| `PUT` | `/api/admin/blog-posts/{id}` | Multipart |
| `DELETE` | `/api/admin/blog-posts/{id}` | `204` |
| `GET` | `/api/admin/about` | JSON |
| `PUT` | `/api/admin/about` | JSON |
| `GET` | `/api/admin/projects` | JSON |
| `POST` | `/api/admin/projects` | Multipart |
| `GET` | `/api/admin/projects/{id}` | JSON |
| `PUT` | `/api/admin/projects/{id}` | Multipart |
| `DELETE` | `/api/admin/projects/{id}` | `204` |
| `GET` | `/api/admin/contact` | JSON |
| `PUT` | `/api/admin/contact` | JSON |

### 8.4 Multipart sözleşmesi

Blog create isteği:

```text
Content-Type: multipart/form-data

data        application/json
thumbnail   image/jpeg veya image/png
```

`data` JSON örneği:

```json
{
  "title": "Spring Security Cookie Akışı",
  "summary": "HttpOnly cookie ile access ve refresh token akışının özeti.",
  "contentHtml": "<p>İçerik...</p>",
  "thumbnailAlt": "Dizüstü bilgisayarda güvenlik yapılandırması"
}
```

Güncellemede `thumbnail` opsiyoneldir; gelmezse eski dosya korunur. Proje multipart isteği aynı yapıyı `data` + `image` parçalarıyla izler.

### 8.5 Hata cevabı

Bütün controller hataları `@RestControllerAdvice` üzerinden tek biçimde döner:

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "İstek doğrulanamadı.",
  "fieldErrors": {
    "title": "Başlık 3 ile 150 karakter arasında olmalıdır."
  },
  "timestamp": "2026-08-31T10:00:00Z"
}
```

Önerilen durum kodları:

- `200` — başarılı GET/PUT
- `201` — başarılı create
- `204` — body gerektirmeyen işlem
- `400` — validation veya bozuk multipart
- `401` — authentication yok/geçersiz
- `403` — CSRF veya yetki reddi
- `404` — kayıt yok
- `409` — unique constraint/slug çakışması
- `413` — dosya çok büyük
- `415` — desteklenmeyen dosya formatı

Stack trace veya teknik exception mesajı kullanıcıya döndürülmez.

---

## 9. Backend katman örnekleri

Bu parçalar tam uygulama değil; katmanların sorumluluğunu gösteren kısa örneklerdir.

### 9.1 DTO

```java
public record BlogPostCreateRequest(
    @NotBlank @Size(min = 3, max = 150) String title,
    @NotBlank @Size(min = 20, max = 300) String summary,
    @NotBlank @Size(max = 60_000) String contentHtml,
    @NotBlank @Size(min = 3, max = 160) String thumbnailAlt
) {}

public record BlogPostResponse(
    Long id,
    String title,
    String summary,
    String contentHtml,
    String slug,
    String thumbnailUrl,
    String thumbnailAlt,
    int readingTimeMinutes,
    Instant createdAt,
    Instant updatedAt
) {}
```

DTO API sınırıdır. Entity doğrudan response yapılmaz. `contentHtml` üzerindeki `@Size` yalnızca kaba istek sınırıdır; sanitize edilmiş düz metin sınırı service içinde ayrıca kontrol edilir.

### 9.2 Entity

```java
@Entity
@Table(name = "blog_posts")
public class BlogPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 300)
    private String summary;

    @Column(name = "content_html", nullable = false, columnDefinition = "text")
    private String contentHtml;

    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    // thumbnailPath, thumbnailAlt, readingTimeMinutes, timestamps
    // getter/setter'lar burada yer alır.
}
```

Entity yalnızca kalıcı veri modelidir. HTTP, `MultipartFile` veya UI bilgisi taşımaz.

### 9.3 Repository

```java
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    Optional<BlogPost> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<BlogPost> findAllByOrderByCreatedAtDesc();
}
```

Spring Data JPA temel CRUD implementasyonunu üretir; tekrar bir generic repository katmanı yazılmaz.

### 9.4 Manuel mapper

```java
@Component
public class BlogPostMapper {
    public BlogPostResponse toResponse(BlogPost post) {
        return new BlogPostResponse(
            post.getId(),
            post.getTitle(),
            post.getSummary(),
            post.getContentHtml(),
            post.getSlug(),
            "/uploads/" + post.getThumbnailPath(),
            post.getThumbnailAlt(),
            post.getReadingTimeMinutes(),
            post.getCreatedAt(),
            post.getUpdatedAt()
        );
    }
}
```

Bu proje için mapper birkaç satırdır; MapStruct bağımlılığı eklemek gerekli değildir.

### 9.5 Service ve Impl

```java
public interface BlogPostService {
    BlogPostResponse create(BlogPostCreateRequest request, MultipartFile thumbnail);
    BlogPostResponse update(long id, BlogPostUpdateRequest request, MultipartFile thumbnail);
    void delete(long id);
    List<BlogPostResponse> findAllPublic();
    BlogPostResponse findBySlug(String slug);
}
```

```java
@Service
@Transactional(readOnly = true)
public class BlogPostServiceImpl implements BlogPostService {
    private final BlogPostRepository repository;
    private final BlogPostMapper mapper;
    private final StorageService storage;
    private final RichTextService richText;
    private final SlugService slugService;

    @Override
    @Transactional
    public BlogPostResponse create(
        BlogPostCreateRequest request,
        MultipartFile thumbnail
    ) {
        String safeHtml = richText.sanitizeAndValidate(
            request.contentHtml(), 100, 50_000
        );
        String path = storage.storeValidatedImage(thumbnail, "blog");

        try {
            BlogPost post = new BlogPost();
            post.setTitle(request.title().trim());
            post.setSummary(request.summary().trim());
            post.setContentHtml(safeHtml);
            post.setSlug(slugService.uniqueSlug(request.title()));
            post.setThumbnailPath(path);
            post.setThumbnailAlt(request.thumbnailAlt().trim());
            post.setReadingTimeMinutes(richText.readingTime(safeHtml));
            return mapper.toResponse(repository.save(post));
        } catch (RuntimeException error) {
            storage.deleteQuietly(path);
            throw error;
        }
    }
}
```

Service iş kuralını koordine eder. Controller'a veya mapper'a dosya yaşam döngüsü ve okuma süresi hesabı taşınmaz.

### 9.6 Controller

```java
@RestController
@RequestMapping("/api/admin/blog-posts")
public class AdminBlogPostController {
    private final BlogPostService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BlogPostResponse> create(
        @Valid @RequestPart("data") BlogPostCreateRequest data,
        @RequestPart("thumbnail") MultipartFile thumbnail
    ) {
        BlogPostResponse created = service.create(data, thumbnail);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
```

Controller isteği ayrıştırır ve service'i çağırır. Entity oluşturma, HTML temizleme veya dosya adı üretme controller'a konmaz.

### 9.7 Aynı kalıbın diğer alanlara uygulanması

- `AboutPage`: DTO → Service → tek kaydı upsert → Mapper → Response
- `Project`: multipart controller → görsel doğrulama → rich text sanitize → Entity
- `ContactInfo`: e-posta + izinli sosyal link listesi → tek transaction ile replace
- `Auth`: request DTO → AuthenticationManager/PasswordEncoder → token + cookie service

Ortak bir `BaseCrudService`, generic mapper veya generic controller yazılmaz. Alanların kuralları farklıdır ve ortaklık henüz kanıtlanmamıştır.

---

## 10. Next.js uygulama yaklaşımı

### 10.1 Public taraf

- Public içerik için Server Component kullanılabilir.
- Veriler backend'in public endpoint'lerinden alınır.
- Blog detay route'u `[slug]` kullanır.
- `title` ve `summary`, temel sayfa metadata'sında kullanılabilir.
- Backend'den gelen relative görsel yolu `http://localhost:8080` tabanıyla birleştirilir.
- Rich text yalnızca sanitize edilmiş HTML olduğu sözleşmesiyle render edilir.

Public sayfalar auth state'e bağlı değildir. İlk sürümde cache stratejisi özelleştirilmez; geliştirme sırasında güncel içeriğin görünmesi önceliklidir.

### 10.2 Admin taraf

Admin formları ve TinyMCE Client Component olur. `/admin` açıldığında frontend `GET /api/auth/me` çağırır:

- `200`: panel gösterilir.
- `401`: bir kez refresh denenir.
- Refresh başarısız: `/admin/login` yönlendirmesi yapılır.

Bir cookie'nin varlığını kontrol etmek yetkilendirme sayılmaz. Backend her `/api/admin/**` çağrısını ayrıca doğrular.

### 10.3 Ortak fetch helper

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...init.headers,
      // Değiştiren isteklerde X-XSRF-TOKEN burada eklenir.
    },
  });
}
```

Bu helper'a başlangıçta cache, interceptor zinciri veya generic response framework'ü eklenmez. `401 → refresh → tek retry` davranışı ihtiyaç geldiğinde burada tutulur.

### 10.4 Multipart gönderimi

```ts
const form = new FormData();

form.append(
  "data",
  new Blob([JSON.stringify(values)], { type: "application/json" })
);
form.append("thumbnail", selectedFile);

await apiFetch("/api/admin/blog-posts", {
  method: "POST",
  body: form,
});
```

`FormData` kullanırken `Content-Type` header'ı elle yazılmaz. Boundary değerini browser üretir.

### 10.5 TinyMCE önerisi

Resmî React wrapper kullanılır:

```bash
npm install @tinymce/tinymce-react
```

Editor yalnızca client tarafında yüklenir:

```tsx
"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((module) => module.Editor),
  { ssr: false }
);
```

Önerilen araçlar:

- `lists`
- `link`
- `code`
- `wordcount`
- Başlık, kalın, italik, altı çizili, liste, alıntı ve link toolbar seçenekleri

`image`, `media`, `iframe` ve premium plugin'ler eklenmez. Tiny Cloud API key `NEXT_PUBLIC_TINYMCE_API_KEY` değişkeninden okunur. Bu değer frontend'de görünür olduğundan gizli backend secretı gibi değerlendirilmez; yalnızca Tiny Cloud hesabında localhost/domain kısıtı uygulanır.

TinyMCE yalnızca düzenleme deneyimidir. HTML'nin güvenli kabul edilmesi için backend sanitization yine zorunludur.

### 10.6 Frontend validasyonu

Frontend şunları göndermeden önce kontrol eder:

- Zorunlu alanlar
- Metin uzunlukları
- Dosya seçimi
- Dosya boyutu ve `image/jpeg` / `image/png` tipi
- GitHub URL formatı
- E-posta formatı

Frontend hataları alan yanında gösterir. Backend'den gelen `fieldErrors` aynı alanlara bağlanır. Frontend kontrolünün geçmesi backend'in isteği kabul etmek zorunda olduğu anlamına gelmez.

### Araştırma notları

- Client Component neden gerektiğinde ve sınırlı alanda kullanılmalıdır?
- `FormData` boundary neden elle yazılmamalıdır?
- `dangerouslySetInnerHTML` neden yalnızca sanitize edilmiş içerikte kullanılmalıdır?
- `NEXT_PUBLIC_` değişkenleri neden gizli değildir?

---

## 11. Environment ve uygulama ayarları

Backend örnek değişkenleri:

```dotenv
DB_URL=jdbc:postgresql://localhost:5432/personal_blog
DB_USERNAME=blog_user
DB_PASSWORD=change-me
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me-with-a-long-password
JWT_ACCESS_SECRET=base64-encoded-random-secret
JWT_REFRESH_SECRET=another-base64-encoded-random-secret
UPLOAD_DIR=./uploads
```

Frontend örnek değişkenleri:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_TINYMCE_API_KEY=your-tinymce-key
```

Gerçek `.env` dosyaları Git'e eklenmez. Repoya yalnızca anahtar isimlerini ve zararsız placeholder değerlerini içeren `.env.example` alınır.

Önerilen backend ayarları:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
  flyway:
    enabled: true
```

Şema değişiklikleri `src/main/resources/db/migration` altındaki Flyway SQL dosyalarıyla yapılır.

---

## 12. Checkpoint planı

Her checkpoint sonunda uygulama çalışır durumda olmalı ve kabul kriterleri manuel veya otomatik olarak doğrulanmalıdır.

### Checkpoint 0 — Kapsam ve sözleşme

Yapılacaklar:

- Bu dokümandaki kapsam dışı listesini geliştiriciyle teyit et.
- API prefix, portlar ve klasör adlarını sabitle.
- Java, Maven, Node ve PostgreSQL sürümlerini terminalde doğrula.

Kabul kriterleri:

- Ek özellik geliştirmesi başlamamış olmalı.
- Kullanılacak stabil sürümler README içinde yazmalı.

### Checkpoint 1 — Boş projeler ve bağlantı

Yapılacaklar:

- Spring Boot Maven projesini oluştur.
- Next.js App Router + TypeScript projesini oluştur.
- PostgreSQL veritabanı ve kullanıcıyı yerelde oluştur.
- Backend health amaçlı basit bir endpoint ile frontend'den bağlantıyı doğrula.
- CORS'u yalnızca `http://localhost:3000` için ayarla.

Kabul kriterleri:

- Frontend `3000`, backend `8080` portunda çalışmalı.
- Frontend backend'e ulaşabilmeli.
- Başka bir origin CORS izni almamalı.

### Checkpoint 2 — Migration ve temel veri modeli

Yapılacaklar:

- Flyway'i kur.
- Tabloları ve constraint'leri migration ile oluştur.
- JPA entity/repository'lerini ekle.
- `ddl-auto=validate` kullan.
- İlk admin initializer'ını ekle.

Kabul kriterleri:

- Boş veritabanında uygulama migration ile açılmalı.
- İkinci açılışta ikinci admin oluşmamalı.
- Entity ile migration uyuşmazsa uygulama hata vermeli.

### Checkpoint 3 — Ortak hata, rich text ve dosya altyapısı

Yapılacaklar:

- Standart API error modelini oluştur.
- `@RestControllerAdvice` ekle.
- Rich text sanitize + düz metin uzunluk kontrolünü yaz.
- UUID dosya adı, MIME/içerik/boyut/ölçü doğrulamasını yaz.
- `/uploads/**` resource mapping ekle.

Kabul kriterleri:

- Script içeren HTML temizlenmeli veya reddedilmeli.
- Sahte `.jpg` dosyası reddedilmeli.
- 5 MB üstü ve ölçü dışı görsel reddedilmeli.
- Hatalar standart JSON biçiminde dönmeli.

### Checkpoint 4 — Authentication

Yapılacaklar:

- BCrypt password encoder.
- Access ve refresh JWT encoder/decoder.
- Cookie yazma/silme servisi.
- Login, refresh, logout, logout-all, me ve şifre değiştirme.
- Refresh session hash ve rotation.
- CSRF cookie/header akışı.
- Spring Security authorization kuralları.

Kabul kriterleri:

- Token response body veya browser storage içinde görünmemeli.
- Access süresi bittiğinde refresh bir kez çalışmalı.
- Kullanılmış eski refresh token tekrar kabul edilmemeli.
- CSRF header olmadan state-changing istek `403` almalı.
- Logout sonrası refresh çalışmamalı.
- Şifre değişiminden sonra bütün oturumlar kapanmalı.

### Checkpoint 5 — Blog backend

Yapılacaklar:

- Blog DTO, Entity, Mapper, Repository, Service, Impl ve Controller.
- Multipart create/update.
- Otomatik slug ve okuma süresi.
- Public liste/detail endpoint'leri.
- Görsel değiştirme/silme yaşam döngüsü.

Kabul kriterleri:

- Aynı başlık benzersiz slug üretmeli.
- Başlık güncellenince mevcut slug değişmemeli.
- Okuma süresi backend'den gelmeli.
- Eski/deleted thumbnail diskte kalmamalı.

### Checkpoint 6 — Hakkımda, projeler ve iletişim backend

Yapılacaklar:

- Hakkımda tek kayıt GET/PUT.
- Proje CRUD + multipart image.
- Contact GET/PUT ve sosyal platform doğrulaması.
- Public endpoint'ler.

Kabul kriterleri:

- Hakkımda/contact için gereksiz liste ve delete endpoint'i olmamalı.
- GitHub dışındaki host `github_url` alanında reddedilmeli.
- Aynı sosyal platform iki kez kaydedilememeli.

### Checkpoint 7 — Public frontend

Yapılacaklar:

- Navbar ve public route'lar.
- Blog listesi ve slug detayı.
- Hakkımda, proje ve iletişim sayfaları.
- Görsel alt metinleri.
- Temel loading, empty ve error durumları.

Kabul kriterleri:

- Beş public alan backend verisiyle çalışmalı.
- HTML güvenli sözleşmeyle render edilmeli.
- Klavye ile navigation ve görünür focus sağlanmalı.
- Görseller anlamlı alt metne sahip olmalı.

### Checkpoint 8 — Admin frontend

Yapılacaklar:

- Login ve auth state.
- CSRF alma ve header ekleme.
- `401 → refresh → tek retry` akışı.
- Blog/proje multipart formları.
- TinyMCE ile blog, hakkımda ve proje rich text alanları.
- İletişim ve hesap ayarları.

Kabul kriterleri:

- Admin API çağrılarında `credentials: include` olmalı.
- Multipart `Content-Type` elle yazılmamalı.
- Tokenlar JavaScript tarafından okunamamalı.
- Yetkisiz admin sayfası login'e yönlenmeli.
- Backend field error'ları doğru form alanında görünmeli.

### Checkpoint 9 — Son doğrulama

Minimum otomatik kontroller:

- Okuma süresi hesabı
- Türkçe slug ve slug çakışması
- Rich text sanitization
- Görsel format/boyut/ölçü doğrulaması
- Refresh rotation
- Yetkisiz admin endpoint isteği
- CSRF'siz değiştiren istek
- Blog multipart create

Manuel senaryo:

1. Admin login olur.
2. Görselli blog oluşturur.
3. Public detay sayfasında içeriği görür.
4. Blog görselini değiştirir ve eski dosyanın silindiğini doğrular.
5. Hakkımda, proje ve iletişim alanlarını günceller.
6. Access token süresi sonrası otomatik refresh'i doğrular.
7. Logout olur ve admin endpoint'inin `401` verdiğini doğrular.

---

## 13. Definition of Done

Proje aşağıdakilerin tamamı sağlanınca bitmiş kabul edilir:

- Public Blog, Hakkımda, Projeler ve İletişim sayfaları backend verisiyle çalışıyor.
- Aynı Next.js uygulamasında korumalı admin paneli bulunuyor.
- Tek admin hesabı environment değerlerinden güvenli biçimde oluşturuluyor.
- Access ve refresh JWT yalnızca HttpOnly cookie ile taşınıyor.
- Refresh rotation, logout, logout-all ve şifre değiştirme çalışıyor.
- CSRF ve dar CORS yapılandırması etkin.
- Blog ve proje görselleri multipart olarak geliyor ve backend tarafından doğrulanıyor.
- Dosyalar yerel diskte UUID isimleriyle tutuluyor; eski dosyalar temizleniyor.
- Rich text backend'de sanitize ediliyor.
- Veritabanı Flyway ile kuruluyor ve JPA yalnızca validate ediyor.
- Hatalar tek JSON sözleşmesiyle dönüyor.
- Temel güvenlik, validasyon ve kritik iş kuralı kontrolleri çalışıyor.
- Kapsam dışı özelliklerden hiçbiri projeye eklenmemiş.

---

## 14. Geliştiricinin özellikle kaçınacağı hatalar

- JWT'yi `localStorage` içine yazmak
- CORS'ta credential ile birlikte `*` origin kullanmak
- Cookie auth kullanırken CSRF'yi sebepsiz kapatmak
- Entity'yi doğrudan request/response yapmak
- Frontend validasyonunu yeterli saymak
- Dosyanın yalnızca uzantısını kontrol etmek
- Kullanıcının dosya adını doğrudan diskte kullanmak
- TinyMCE çıktısını sanitize etmeden kaydetmek/render etmek
- `ddl-auto=create` veya `update` ile şemayı sessizce değiştirmek
- Multipart isteğinde frontend'den `Content-Type` boundary yazmak
- Görsel değişince eski dosyayı diskte bırakmak
- Service iş kurallarını controller'a taşımak
- Bu küçük proje için generic CRUD framework'ü kurmak

---

## 15. Resmî kaynaklar

- [Next.js v16.2.9 release](https://github.com/vercel/next.js/releases/tag/v16.2.9)
- [Next.js installation ve Node.js gereksinimi](https://nextjs.org/docs/app/getting-started/installation)
- [Spring Boot 4.1.1 duyurusu](https://spring.io/blog/2026/08/20/spring-boot-4-1-1-available-now/)
- [Spring Boot sistem gereksinimleri](https://docs.spring.io/spring-boot/system-requirements.html)
- [Spring Boot starter ve build sistemi](https://docs.spring.io/spring-boot/reference/using/build-systems.html)
- [Spring Boot multipart desteği](https://docs.spring.io/spring-boot/how-to/spring-mvc.html)
- [Spring Security CSRF rehberi](https://docs.spring.io/spring-security/reference/7.0/servlet/exploits/csrf.html)
- [Spring Security CookieCsrfTokenRepository](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/csrf/CookieCsrfTokenRepository.html)
- [Spring Security JwtEncoder](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/jwt/JwtEncoder.html)
- [TinyMCE React integration](https://www.tiny.cloud/docs/tinymce/latest/react-cloud/)
- [TinyMCE React teknik referansı](https://www.tiny.cloud/docs/tinymce/latest/react-ref/)

Bu kaynaklar özellikle sürüm yükseltirken yeniden kontrol edilmelidir.
