/* Data bawaan (fallback bila Supabase belum terhubung). Isi yang sama di-seed oleh sql/schema.sql */

export type Habit = {
    id?: number;
    position?: number;
    icon: string;
    name: string;
    statements: string; // satu pernyataan per baris
    short_label: string;
    description: string;
};

export type TeamMember = {
    id?: number;
    position?: number;
    name: string;
    role: string;
    photo_url: string;
};

export type Texts = Record<string, string>;

export type Cms = { texts: Texts; habits: Habit[]; team: TeamMember[] };

/* scores[habitIndex][statementIndex] = 0..4 */
export type ScoreRow = { scores: (number | null)[][]; tanggal: string };

export type AdminRow = ScoreRow & {
    id: number | string;
    created_at: string;
    nama: string;
    absen: number;
    kelas: string;
};

export const DEFAULT_TEXTS: Texts = {
    menu_beranda: 'Beranda',
    menu_diagram: 'Diagram',
    menu_murid: 'Laman Murid',
    menu_admin: 'Laman Admin',
    menu_tentang: 'Tentang',
    school_name: 'SMA Negeri 5 Semarang',
    hero_badge: 'Program Karakter Kebangsaan & Prestasi SMAN 5 Semarang',
    hero_title: 'NEXARA',
    hero_text: 'Gerakan pembentukan karakter, kedisiplinan, dan kesiapan mental para siswa SMA Negeri 5 Semarang dalam meraih impian tinggi, menjaga kesehatan diri, serta sukses menembus Perguruan Tinggi Negeri (PTN) Impian.',
    habits_title: 'Pengertian & 7 Indikator KAIH',
    habits_intro: 'Struktur kebiasaan positif harian siswa SMA Negeri 5 Semarang',
    diagram_title: 'Diagram 7 KAIH',
    diagram_intro: 'Data terhubung dari tanggapan murid di Laman Murid dan diperbarui otomatis setiap 15 detik.',
    murid_title: 'Isi 7 KAIH hari ini',
    murid_intro: 'Silakan isi jurnal kebiasaan harian Anda dengan sejujur-jujurnya. Satu nama hanya dapat mengisi satu kali per hari.',
    murid_scale_hint: 'Pilih angka 0–4 pada tiap pernyataan (0 = tidak pernah, 4 = setiap hari).',
    scale_left: 'Tidak pernah',
    scale_right: 'Setiap hari',
    admin_title: 'Panel admin',
    tentang_title: 'Tentang pembuat',
    tentang_intro: 'NEXARA 7 KAIH dibuat oleh murid dan guru SMA Negeri 5 Semarang.',
    footer_text: 'Inovasi Kebiasaan Anak Indonesia Hebat (7 KAIH) - Menuju Sukses PTN & Karakter Unggul'
};

/* Daftar teks yang tampil di tab "Teks halaman" (admin). section = kolom "Bagian" */
export const TEXT_META: { key: string; section: string; label: string; multiline?: boolean }[] = [
    { key: 'menu_beranda', section: 'Menu', label: 'Menu: Beranda' },
    { key: 'menu_diagram', section: 'Menu', label: 'Menu: Diagram' },
    { key: 'menu_murid', section: 'Menu', label: 'Menu: Laman Murid' },
    { key: 'menu_admin', section: 'Menu', label: 'Menu: Laman Admin' },
    { key: 'menu_tentang', section: 'Menu', label: 'Menu: Tentang' },
    { key: 'school_name', section: 'Nama sekolah', label: 'Nama sekolah' },
    { key: 'hero_badge', section: 'Beranda', label: 'Beranda: teks kecil' },
    { key: 'hero_title', section: 'Beranda', label: 'Beranda: judul besar' },
    { key: 'hero_text', section: 'Beranda', label: 'Beranda: paragraf', multiline: true },
    { key: 'habits_title', section: 'Beranda', label: 'Beranda: judul daftar kebiasaan' },
    { key: 'habits_intro', section: 'Beranda', label: 'Beranda: pengantar daftar kebiasaan' },
    { key: 'diagram_title', section: 'Diagram', label: 'Diagram: judul' },
    { key: 'diagram_intro', section: 'Diagram', label: 'Diagram: pengantar', multiline: true },
    { key: 'murid_title', section: 'Laman Murid', label: 'Laman Murid: judul' },
    { key: 'murid_intro', section: 'Laman Murid', label: 'Laman Murid: pengantar', multiline: true },
    { key: 'murid_scale_hint', section: 'Laman Murid', label: 'Laman Murid: petunjuk skala 0–4', multiline: true },
    { key: 'scale_left', section: 'Skala', label: 'Label skala paling kiri (nilai 0)' },
    { key: 'scale_right', section: 'Skala', label: 'Label skala paling kanan (nilai 4)' },
    { key: 'admin_title', section: 'Laman Admin', label: 'Laman Admin: judul' },
    { key: 'tentang_title', section: 'Tentang', label: 'Tentang: judul' },
    { key: 'tentang_intro', section: 'Tentang', label: 'Tentang: pengantar', multiline: true },
    { key: 'footer_text', section: 'Footer', label: 'Teks footer', multiline: true }
];

/* statements = satu pernyataan per baris */
export const DEFAULT_HABITS: Habit[] = [
    { position: 1, icon: 'fa-sun', name: 'Bangun Pagi', short_label: 'Bangun Pagi',
      description: 'Disiplin waktu, bangun pagi tanpa drama kesiangan untuk mengawali hari secara optimal.',
      statements: 'Saya bangun tidur sebelum pukul 05.30 pagi setiap hari sehingga tidak terlambat sekolah' },
    { position: 2, icon: 'fa-hands-praying', name: 'Beribadah', short_label: 'Ibadah',
      description: 'Menjaga kedekatan spiritual demi ketenangan mental dan kelancaran pencapaian cita-cita.',
      statements: '3 hari sebelumnya saya menjalankan ibadah sesuai dengan agama/kepercayaan saya tepat waktu dan khidmat\n3 hari sebelumnya saya mengawali dan mengakhiri kegiatan harian (seperti belajar dan makan) dengan berdoa.' },
    { position: 3, icon: 'fa-person-running', name: 'Berolahraga', short_label: 'Olahraga',
      description: 'Rutin menggerakkan tubuh agar fisik tetap bugar, sehat, dan stamina tidak gampang drop.',
      statements: '3 hari sebelumnya saya melakukan aktivitas fisik atau olahraga (misalnya berlari, senam, bersepeda) minimal 3 kali seminggu\n3 hari sebelumnya saya berpartisipasi aktif dalam kegiatan olahraga di sekolah atau ekstrakurikuler.' },
    { position: 4, icon: 'fa-apple-whole', name: 'Makan Sehat dan Bergizi', short_label: 'Makan Sehat',
      description: 'Nutrisi seimbang, bukan sekadar kenyang atau junk food, untuk menyokong performa tubuh.',
      statements: '3 hari sebelumnya saya makan makanan sehat dan bergizi\n3 hari sebelumnya saya memilih makanan/jajanan sehat yang mengandung buah, sayur, atau protein saat di sekolah dan rumah' },
    { position: 5, icon: 'fa-book-open', name: 'Gemar Membaca', short_label: 'Membaca',
      description: 'Membaca buku dan wawasan baru di luar buku pelajaran sekolah.',
      statements: '3 hari sebelumnya saya meluangkan waktu membaca buku (non-pelajaran/literasi) minimal 15–30 menit setiap hari.' },
    { position: 6, icon: 'fa-hand-holding-heart', name: 'Membantu Orang Tua', short_label: 'Bantu Ortu',
      description: 'Peduli dan ringan tangan membantu pekerjaan di rumah tanpa menunggu diperintah.',
      statements: '3 hari sebelumnya saya membantu pekerjaan rumah tangga (misalnya menyapu, mencuci piring, menjaga adik) di rumah tanpa diperintah' },
    { position: 7, icon: 'fa-bed', name: 'Tidur Cepat (Tepat Waktu)', short_label: 'Tidur Cepat',
      description: 'Tidur malam tepat waktu agar regenerasi sel dan fokus otak tetap tajam.',
      statements: '3 hari sebelumnya saya tidur malam tidak melebihi pukul 21.30/22.00.\n3 hari sebelumnya saya mematikan atau tidak menggunakan gadget/smartphone saat mendekati jam tidur malam.' }
];

export const DEFAULT_TEAM: TeamMember[] = [
    { position: 1, name: 'Fahim Rayhan I. P', role: 'Murid SMA Negeri 5 Semarang kelas XI-8', photo_url: '' },
    { position: 2, name: 'Nieki Erli A', role: 'Murid SMA Negeri 5 Semarang kelas XI-8', photo_url: '' },
    { position: 3, name: 'Vina Khalimatus S', role: 'Murid SMA Negeri 5 Semarang kelas XI-8', photo_url: '' },
    { position: 4, name: 'Keanu Yusuf A', role: 'Murid SMA Negeri 5 Semarang kelas XI-8', photo_url: '' },
    { position: 5, name: 'M Addia Hadyan Gala', role: 'Murid SMA Negeri 5 Semarang kelas XI-8', photo_url: '' },
    { position: 6, name: 'Nico Chaesario', role: 'Guru Informatika SMA Negeri 5 Semarang', photo_url: '' },
    { position: 7, name: 'Rohmat Nugroho', role: 'Guru KKA SMA Negeri 5 Semarang', photo_url: '' }
];
