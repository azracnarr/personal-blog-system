# Kisisel Blog Sistemi

Bu proje, teknik dokumana uygun sekilde Spring Boot backend ve Next.js frontend olarak gelistirilecek kisisel blog sistemidir.

## Kapsam

Ilk surumde yalnizca su alanlar bulunur:

- Public sayfalar: ana sayfa, blog listesi, blog detayi, hakkimda, projeler, iletisim
- Admin sayfalari: login, panel, blog yonetimi, hakkimda, proje yonetimi, iletisim, hesap
- Tek admin kullanicisi
- PostgreSQL veritabani
- Yerel `uploads/` klasorune gorsel yukleme
- JWT tabanli, HttpOnly cookie ile tasinan authentication
- CSRF ve dar CORS yapilandirmasi

Ilk surumde kategori, etiket, arama, yorum, coklu kullanici, sifremi unuttum, deployment, Docker, CDN veya bulut depolama eklenmez.

## Yerel adresler

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PostgreSQL: yerel PostgreSQL kurulumu
- Yuklenen dosyalar: backend icindeki `uploads/` klasoru

## Checkpoint 0 - Ortam kontrolu

Kontrol edilen kurulumlar:

| Arac | Durum | Not |
|---|---|---|
| Java | Duz `java -version` Java 11 gosteriyor | PATH Java 11'e gidiyor; proje icin Java 21 kullanilmali |
| JAVA_HOME | Java 21 | `C:\Program Files\Java\jdk-21` |
| Maven | 3.9.9 | Maven Java 21 runtime ile calisiyor |
| Node.js | 22.14.0 | Dokumandaki minimum Node 20.9+ sarti saglaniyor |
| npm | 10.9.2 | PowerShell `npm` script imza hatasi veriyor; `npm.cmd` calisiyor |
| PostgreSQL | 14.13 | Servis calisiyor; `psql` PATH'te degil |

Checkpoint 0 icin duzeltilmesi gereken ortam notlari:

- `java -version` komutunun Java 21 gostermesi icin PATH sirasi duzeltilmeli.
- PostgreSQL `bin` klasoru PATH'e eklenirse `psql` her terminalden calisir.
- PowerShell'de `npm` calismadigi icin kurulumlarda gecici olarak `npm.cmd` kullanilabilir.

Bu oturumda kalici Windows kullanici environment ayarlari guncellenmeye calisildi, ancak kayit defteri erisim izni reddedildi. Bu nedenle proje icinde gecici ama guvenilir bir aktivasyon dosyasi hazirlandi:

```bat
work\activate-project-env.cmd
```

Komutlar bu dosya ile baslatildiginda su araclar dogru calisir:

- Java `21.0.4`
- Maven `3.9.9`
- Node.js `22.14.0`
- npm `10.9.2`
- PostgreSQL `psql 14.13`

Ornek kullanim:

```bat
cmd /c "call work\activate-project-env.cmd && java -version"
```

## Siradaki adim

Checkpoint 1'e gecmeden once komutlar `work\activate-project-env.cmd` ile calistirilacak. Ardindan bos `backend` ve `frontend` projeleri olusturulup frontend-backend baglantisi dogrulanacak.

## Checkpoint 1 - Bos projeler ve baglanti

Olusturulan yapilar:

- `backend`: Spring Boot 4.1.1, Java 21, Maven
- `frontend`: Next.js 16.2.9, App Router, TypeScript
- Backend health endpoint'i: `GET /api/health`
- Frontend ana sayfasi: backend health endpoint'ini okuyup baglanti durumunu gosterir
- Backend CORS: yalnizca `http://localhost:3000` origin'i icin acik

Calistirma komutlari:

```bat
cd backend
cmd /c "call ..\work\activate-project-env.cmd && mvn.cmd spring-boot:run"
```

```bat
cd frontend
cmd /c "call ..\work\activate-project-env.cmd && npm.cmd run dev"
```

Dogrulanan kontroller:

- Backend `http://localhost:8080/api/health` adresinde `status=ok` donuyor.
- Frontend `http://localhost:3000` adresinde aciliyor.
- `http://localhost:3000` origin'i CORS izni aliyor.
- Farkli origin istegi CORS tarafindan reddediliyor.
- `mvn test` basarili.
- `npm run build` basarili.

Notlar:

- Maven local repository proje icindeki `work/.m2/repository` yolunu kullanir.
- npm cache proje icindeki `work/npm-cache` yolunu kullanir.
- Bu iki cache klasoru Git'e eklenmez.

Kendi bilgilerinizi siteye eklemek için [CONTENT-GUIDE.md](CONTENT-GUIDE.md)
dosyasındaki adımları izleyin. Bu belgede admin hesabı, hakkımda bilgisi,
blog yazısı, proje, görsel ve iletişim mesajı akışları örneklerle anlatılır.

## Checkpoint 2 - PostgreSQL ve blog temeli

Bu checkpoint'te:

- Backend'e Spring Data JPA ve PostgreSQL bagimliliklari eklendi.
- Veritabani ayarlari `DB_URL`, `DB_USERNAME` ve `DB_PASSWORD` ortam degiskenlerinden okunacak sekilde yapilandirildi.
- `Blog` entity'si `blogs` tablosunu temsil ediyor.
- `BlogRepository`, blog verilerine erisim sagliyor.
- `GET /api/blogs` blog listesini donduruyor.
- `POST /api/blogs` yeni blog olusturuyor.

Ornek istek govdesi:

```json
{
  "title": "Ilk yazi",
  "content": "Blog icerigi"
}
```

Bu checkpoint'te tam CRUD tamamlanmadi; guncelleme ve silme sonraki adimda ele alinacak.

## Checkpoint 3 - Blog guncelleme ve silme

Blog API'sine su endpoint'ler eklendi:

- `PUT /api/blogs/{id}` mevcut blogu gunceller.
- `DELETE /api/blogs/{id}` blogu siler ve `204 No Content` dondurur.
- Var olmayan bloglar icin `404 Not Found` dondurulur.

`BlogService`, controller ile repository arasindaki is kurallarini tasir. Controller HTTP isteklerini alir; service kaydin bulunup bulunmadigini kontrol eder; repository veritabanina erisir.

## Guncel calisan surum

Ilk checkpoint'lere ek olarak proje artik kapsamda belirtilen minimal urun
akislarini icerir: JWT HttpOnly cookie ile admin girisi, CSRF token kontrolu,
blog CRUD, hakkimda/proje/iletisim API'leri, yerel gorsel yukleme ve Next.js
public/admin sayfalari. Kurulum, dosya haritasi, endpoint tablosu ve guvenlik
notlari icin [GUIDE.md](GUIDE.md) dosyasina bakin.

Dogru ortami yukledikten sonra backend icin `mvnw.cmd test`, frontend icin
`npm.cmd run build` komutlari kullanilir. Sifre, JWT secret ve veritabani
bilgileri yalnizca ortam degiskenlerinden verilmeli; `.env.example` dosyalari
sablon olarak kullanilmalidir.
