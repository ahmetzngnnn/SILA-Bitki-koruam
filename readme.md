🔑 Google OAuth Credentials Almak
ADIM 1: Google Cloud Console aç
https://console.cloud.google.com/

ADIM 2: Yeni Proje Oluştur

Sağ üstteki proje dropdown'a tıkla
"YENİ PROJE" → "ABİS" yaz → Oluştur
ADIM 3: API Aktif Et

Sol menüde "APIs ve Hizmetler" → "Kütüphane"
"Google Sheets API" ara → Aktif Et
"Google Drive API" ara → Aktif Et
ADIM 4: OAuth Credentials Oluştur

Sol menüde "Kimlik Doğrulama" → "Kimlik Bilgileri"
"+ KİMLİK BİLGİSİ OLUŞTUR" → OAuth 2.0 İstemci Kimliği
"Web Uygulaması" seç
Ad: ABİS App
Yetkili JavaScript kaynakları ekle:
http://localhost:3000  Yetkili Yönlendirme URİ'leri ekle:
http://localhost:3000/api/auth/callback/google  Oluştur → İstemci Kimliği ve Gizli Dizi kopyala
ADIM 5: .env.local'e Yapıştır

Şöyle güncelle (gerçek değerlerle):

1035160308962-ntq1lnlbvaj7eks9l32fg1bbdtrijimn.apps.googleusercontent.com  
İsim
ABİS App
OAuth 2.0 istemcinizin adı. Bu ad yalnızca konsolda istemciyi tanımlamak için kullanılır ve son kullanıcılara gösterilmez.
Aşağıya eklediğiniz URI'lerin alan adları, yetkilendirilmiş alan adları olarak OAuth onay ekranınıza otomatik olarak eklenecektir. .

Yetkilendirilmiş JavaScript kaynakları
Tarayıcıdan gelen isteklerle kullanım için.
URI'ler 1 
http://localhost:3000

Yetkilendirilmiş yönlendirme URI'leri
Web sunucusundan gelen isteklerle kullanım içindir.
URI'ler 1 
http://localhost:3000/api/auth/callback/google
Not: Ayarların geçerli olması 5 dakika ile birkaç saat arasında sürebilir.
1035160308962-ntq1lnlbvaj7eks9l32fg1bbdtrijimn.apps.googleusercontent.com