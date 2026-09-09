# BLOG - Kendi Bilgilerini Yükleme Rehberi

Bu belge, projeyi teknik olarak bilmeyen birinin siteyi kendi bilgileriyle
doldurabilmesi için hazırlanmıştır.

## 1. Siteyi çalıştırma

İki terminal açın.

### Terminal 1 - Backend

```bat
cd backend
call ..\work\activate-project-env.cmd
.\mvnw.cmd spring-boot:run
```

Backend şu adreste çalışır:

<http://localhost:8080>

### Terminal 2 - Frontend

```bat
cd frontend
call ..\work\activate-project-env.cmd
npm.cmd run dev
```

Site şu adreste çalışır:

<http://localhost:3000>

İlk kez çalıştırmadan önce PostgreSQL'de `blog` adında bir veritabanı
oluşturulmalıdır. Kullanıcı adı ve parolayı
`backend\.env.example` içindeki değerlerle eşleştirin.

## 2. Admin hesabını değiştirme

`backend\.env.example` dosyasını `.env` adıyla kopyalayın. Daha sonra şu
değerleri kendinize göre değiştirin:

```text
ADMIN_USERNAME=kendi-kullanici-adin
ADMIN_PASSWORD=cok-guclu-bir-parola
DB_USERNAME=postgres
DB_PASSWORD=postgres-parolan
JWT_SECRET=uzun-ve-tahmin-edilemez-bir-gizli-anahtar
```

`.env` dosyasını Git'e eklemeyin. Bu dosya parolanızı içerir.

Backend'i yeniden başlattığınızda `/admin/login` sayfasında bu hesapla giriş
yapabilirsiniz:

<http://localhost:3000/admin/login>

## 3. Hakkımda bilgisi ekleme

1. Admin hesabıyla giriş yapın.
2. <http://localhost:3000/admin> adresine gidin.
3. **Hakkımda** bölümünde adınızı yazın.
4. Biyografinizi yazın.
5. **Kaydet** düğmesine basın.

Bu bilgi `/about` sayfasında görünür. Backend tarafında kayıt
`PUT /api/about` endpoint'ine gönderilir.

Örnek veri:

```json
{
  "name": "Ad Soyad",
  "bio": "Yazılım geliştirici ve teknoloji meraklısı.",
  "avatarUrl": "/uploads/profil.jpg"
}
```

## 4. Blog yazısı ekleme

1. Admin panelinde **Yeni yazı** bölümünü bulun.
2. Başlık alanına yazı başlığını girin.
3. İçerik alanına yazınızı girin.
4. **Yayınla** düğmesine basın.

Yazı ana sayfada ve `/blog` sayfasında görünür. Yazıya tıklayınca detay
sayfası açılır.

Backend endpoint'i:

```text
POST /api/blogs
```

Gönderilen veri:

```json
{
  "title": "İlk yazım",
  "content": "Bu benim ilk blog yazım.",
  "excerpt": "Yazının kısa özeti",
  "slug": "ilk-yazim",
  "published": true
}
```

Admin panelinden silinen yazı veritabanından kaldırılır.

## 5. Proje ekleme

1. Admin panelinde **Proje ekle** bölümünü bulun.
2. Proje adını girin.
3. Proje açıklamasını yazın.
4. Varsa proje adresini girin.
5. **Proje ekle** düğmesine basın.

Projeler `/projects` sayfasında görünür.

Örnek:

```text
Proje adı: BLOG
Açıklama: Kişisel yazılarımı yönettiğim blog sistemi.
Adres: https://github.com/kullanici/blog
```

## 6. Profil veya proje görseli yükleme

Görsel yükleme endpoint'i yalnızca admin tarafından kullanılabilir:

```text
POST /api/uploads
```

Kurallar:

- PNG, JPG, GIF veya WebP olabilir.
- En fazla 5 MB olabilir.
- Yüklenen dosyalar backend içindeki `uploads\` klasörüne kaydedilir.
- Başarılı cevapta `/uploads/...` biçiminde bir adres döner.

Bu adresi `avatarUrl` veya ilgili görsel alanında kullanabilirsiniz.

## 7. İletişim mesajları

Ziyaretçi `/contact` sayfasındaki formu doldurur. Mesaj:

```text
POST /api/contact
```

ile kaydedilir. Admin panelindeki **Gelen mesajlar** bölümünden okunabilir.

## 8. Bilgilerin veritabanında tutulması

Uygulama ilk açıldığında JPA aşağıdaki tabloları oluşturur:

- `blogs`: blog yazıları
- `about`: hakkımda bilgisi
- `projects`: projeler
- `contact_messages`: iletişim mesajları

Kod tarafında tabloyu temsil eden sınıfa **entity** denir. Örneğin
`Blog.java`, `blogs` tablosunun Java karşılığıdır.

## 9. İçerik görünmüyorsa kontrol listesi

1. Backend terminalinde hata var mı?
2. PostgreSQL servisi çalışıyor mu?
3. `DB_URL`, `DB_USERNAME` ve `DB_PASSWORD` doğru mu?
4. Backend `http://localhost:8080/api/health` adresine cevap veriyor mu?
5. Admin panelinde giriş yapılmış mı?
6. Blog yazısında `published` değeri `true` mu?
7. Tarayıcıyı yenileyin.

## 10. Değişiklik yaptıktan sonra

Frontend kontrolü:

```bat
cd frontend
npm.cmd run build
```

Backend kontrolü:

```bat
cd backend
.\mvnw.cmd test
```

Bu iki komut başarılıysa kod derleniyor demektir.

## 11. Önerilen içerik ekleme sırası

1. Admin parolasını değiştirin.
2. Hakkımda bilgisini girin.
3. Profil görselini yükleyin.
4. Projelerinizi ekleyin.
5. İlk blog yazınızı yayınlayın.
6. Siteyi ziyaretçi gözüyle kontrol edin.
7. İletişim formuna deneme mesajı gönderin.
8. Admin panelinden mesajın göründüğünü kontrol edin.
