# Kişisel Blog Sistemi — Başlangıç Rehberi

Bu belge, projeyi ilk kez çalıştıran birinin sistemi anlayıp yerelinde
deneyebilmesi için yazıldı. Uygulama iki parçadan oluşur:

Kendi bilgilerinizi siteye girme adımları için ayrıca
[CONTENT-GUIDE.md](CONTENT-GUIDE.md) dosyasını okuyun. Bu belge, admin hesabını
değiştirmeden blog yazısı ve proje eklemeye kadar uygulamalı anlatım içerir.

* **backend/**: Java 21 ve Spring Boot ile HTTP API. PostgreSQL, JPA ile
  kullanılır.
* **frontend/**: Next.js App Router ile ziyaretçi sayfaları ve yönetim paneli.

## 1. Kurulum

Java 21, Maven, Node.js 20+ ve PostgreSQL kurulu olmalıdır. PostgreSQL içinde
`blog` adlı bir veritabanı oluşturun. Windows'ta `work\activate-project-env.cmd`
dosyası, bu depodaki Java/Maven/Node araçlarını PATH'e almak için kullanılabilir.

Backend ortam değişkenlerini `backend\.env.example` dosyasını temel alarak
ayarlayın. Frontend için `frontend\.env.example` dosyasını
`frontend\.env.local` adıyla kopyalayın. `.env` dosyalarını Git'e eklemeyin.

```bat
cd backend
call ..\work\activate-project-env.cmd
mvnw.cmd test
mvnw.cmd spring-boot:run
```

Başka bir terminalde:

```bat
cd frontend
call ..\work\activate-project-env.cmd
npm.cmd ci
npm.cmd run dev
```

Tarayıcı adresleri: <http://localhost:3000> ve API için
<http://localhost:8080>. `ADMIN_USERNAME` ve `ADMIN_PASSWORD`, yönetim
girişinde kullanılacak tek admin hesabıdır. Varsayılanlar yalnızca yerel
geliştirme içindir; gerçek ortamda mutlaka değiştirin.

## 2. Mimari ve dosyalar

Backend'de her özellik kendi paketindedir:

* `blog/`: `Blog` entity, repository, servis ve CRUD controller.
* `content/`: tekil `/api/about` kaydı ve proje CRUD işlemleri.
* `contact/`: herkese açık iletişim formu ve admin mesaj listesi.
* `auth/`: JWT üretimi/doğrulaması, login/logout/me endpoint'leri.
* `upload/`: yalnızca admin'in yükleyebildiği, `uploads/` altında yerel görseller.
* `config/WebConfig`: yalnızca yerel frontend origin'lerine CORS ve statik
  görsel sunumu.

`spring.jpa.hibernate.ddl-auto=update`, ilk yerel çalıştırmada tabloları
oluşturur. Üretimde bunun yerine migration aracı ve `ddl-auto=validate`
kullanılması önerilir.

Frontend'de `src/app` altındaki route'lar sırasıyla ana sayfa, blog listesi ve
detayı, hakkımda, projeler, iletişim, `/admin/login` ve `/admin` panelidir.
`src/lib/api.ts`, tüm isteklerde cookie gönderilmesini sağlar.

## 3. API özeti

| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/health` | Sağlık kontrolü |
| GET | `/api/blogs` | Yayındaki yazılar |
| GET | `/api/blogs/{id}` veya `/api/blogs/slug/{slug}` | Yazı detayı |
| POST/PUT/DELETE | `/api/blogs[/{id}]` | Admin blog CRUD |
| GET/PUT | `/api/about` | Hakkımda bilgisini okuma/güncelleme |
| GET | `/api/projects` | Yayındaki projeler |
| POST/PUT/DELETE | `/api/projects[/{id}]` | Admin proje CRUD |
| POST | `/api/contact` | Ziyaretçi mesajı |
| GET/PUT | `/api/contact[/{id}/read]` | Admin mesaj yönetimi |
| POST | `/api/auth/login` | JWT cookie ile giriş |
| POST | `/api/auth/logout` | Oturumu kapatma |
| POST | `/api/uploads` | Admin görsel yükleme (en fazla 5 MB) |

## 4. Authentication ve güvenlik

Başarılı login iki cookie verir: `blog_auth` HttpOnly JWT, `blog_csrf` ise
JavaScript'in okuyabildiği çift-submit CSRF token'ıdır. Yönetim paneli, POST,
PUT ve DELETE isteklerinde `X-CSRF-TOKEN` header'ını gönderir. JWT cookie
HttpOnly olduğu için frontend JavaScript'i token'ı okuyamaz.

Yerelde `COOKIE_SECURE=false` ve `SameSite=Lax` kullanılır; HTTPS ortamında
`COOKIE_SECURE=true` yapılmalıdır. CORS sadece `localhost:3000` ve
`127.0.0.1:3000` için credential'lı olarak açıktır. Yeni origin eklemek
gerekirse `WebConfig` bilinçli biçimde güncellenmelidir.

## 5. Deneme ve doğrulama

1. Backend için `cd backend && mvnw.cmd test` çalıştırın.
2. Frontend için `cd frontend && npm.cmd run build` çalıştırın.
3. PostgreSQL ve backend açıkken ana sayfayı ziyaret edin.
4. `/admin/login` ile giriş yapıp bir yazı yayınlayın; yazı ana sayfada görünür.
5. `/contact` formundan mesaj gönderip admin API'si ile listeleyin.

Veritabanı bağlantısı yoksa frontend boş listeleri gösterir; gerçek CRUD
denemesi için PostgreSQL servisinin açık olması gerekir.
