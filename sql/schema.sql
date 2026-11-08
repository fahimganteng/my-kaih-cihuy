-- ============================================================
-- NEXARA 7 KAIH - Skema Supabase
-- Cara pakai: Supabase > SQL Editor > New query > tempel semua > Run
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- TABEL ----------
create table if not exists public.site_texts (
    key   text primary key,
    value text not null default ''
);

create table if not exists public.habits (
    id          bigint generated always as identity primary key,
    position    int  not null,
    icon        text not null default 'fa-star',
    name        text not null,
    statements  text not null,            -- satu pernyataan per baris
    short_label text not null default '',
    description text not null default ''
);

create table if not exists public.team_members (
    id        bigint generated always as identity primary key,
    position  int  not null,
    name      text not null,
    role      text not null default '',
    photo_url text not null default ''
);

create table if not exists public.submissions (
    id         bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    nama       text not null,
    nama_key   text generated always as (lower(regexp_replace(trim(nama), '\s+', ' ', 'g'))) stored,
    absen      int  not null,
    kelas      text not null,
    tanggal    date not null,
    scores     jsonb not null,            -- [[skor habit1],[skor habit2,..],...] nilai 0-4
    constraint uq_nama_per_hari unique (nama_key, tanggal)
);

create table if not exists public.admin_config (
    id        int primary key default 1,
    pass_hash text not null,
    constraint single_row check (id = 1)
);

-- ---------- KEAMANAN (RLS) ----------
alter table public.site_texts   enable row level security;
alter table public.habits       enable row level security;
alter table public.team_members enable row level security;
alter table public.submissions  enable row level security;
alter table public.admin_config enable row level security;

-- Konten situs boleh dibaca publik; menulis hanya lewat fungsi admin (di bawah)
drop policy if exists "read site_texts"   on public.site_texts;
drop policy if exists "read habits"       on public.habits;
drop policy if exists "read team_members" on public.team_members;
create policy "read site_texts"   on public.site_texts   for select using (true);
create policy "read habits"       on public.habits       for select using (true);
create policy "read team_members" on public.team_members for select using (true);
-- submissions & admin_config: TANPA policy = tidak bisa diakses langsung oleh anon

-- ---------- PASSWORD ADMIN (di-hash) ----------
insert into public.admin_config (id, pass_hash)
values (1, extensions.crypt('SMALAHEBAT', extensions.gen_salt('bf')))
on conflict (id) do nothing;
-- Ganti password nanti:
-- update public.admin_config set pass_hash = extensions.crypt('PASSWORD_BARU', extensions.gen_salt('bf')) where id = 1;

-- ---------- FUNGSI ----------
create or replace function public._assert_admin(p_password text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
    if not exists (select 1 from admin_config where pass_hash = crypt(p_password, pass_hash)) then
        raise exception 'UNAUTHORIZED';
    end if;
end $$;

create or replace function public.admin_check(p_password text)
returns boolean language sql security definer set search_path = public, extensions as $$
    select exists (select 1 from admin_config where pass_hash = crypt(p_password, pass_hash));
$$;

-- Murid mengirim jawaban (validasi + 1 nama / hari)
create or replace function public.submit_entry(
    p_nama text, p_absen int, p_kelas text, p_tanggal date, p_scores jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
    if p_nama is null or length(trim(p_nama)) < 2 or length(p_nama) > 100 then
        raise exception 'INVALID_NAME'; end if;
    if p_absen is null or p_absen < 1 or p_absen > 60 then
        raise exception 'INVALID_ABSEN'; end if;
    if p_kelas !~ '^(X|XI|XII)-([1-9]|1[0-2])$' then
        raise exception 'INVALID_CLASS'; end if;
    if p_tanggal is null or p_tanggal > (now() at time zone 'Asia/Jakarta')::date then
        raise exception 'INVALID_DATE'; end if;
    if jsonb_typeof(p_scores) <> 'array'
       or jsonb_path_exists(p_scores, '$[*][*] ? (@ < 0 || @ > 4)') then
        raise exception 'INVALID_SCORES'; end if;

    begin
        insert into submissions (nama, absen, kelas, tanggal, scores)
        values (trim(p_nama), p_absen, p_kelas, p_tanggal, p_scores);
    exception when unique_violation then
        raise exception 'DUPLICATE_ENTRY';
    end;
end $$;

-- Skor TANPA nama untuk diagram publik
create or replace function public.get_public_scores()
returns jsonb language sql security definer set search_path = public as $$
    select coalesce(jsonb_agg(jsonb_build_object('scores', scores, 'tanggal', tanggal)), '[]'::jsonb)
    from submissions;
$$;

create or replace function public.admin_get_submissions(p_password text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
begin
    perform _assert_admin(p_password);
    return (select coalesce(jsonb_agg(to_jsonb(s) - 'nama_key' order by s.created_at desc), '[]'::jsonb) from submissions s);
end $$;

create or replace function public.admin_delete_submission(p_password text, p_id bigint)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
    perform _assert_admin(p_password);
    delete from submissions where id = p_id;
end $$;

create or replace function public.admin_delete_all_submissions(p_password text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
    perform _assert_admin(p_password);
    delete from submissions where true;
end $$;

create or replace function public.admin_save_habits(p_password text, p_data jsonb)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
    perform _assert_admin(p_password);
    delete from habits where true;
    insert into habits (position, icon, name, statements, short_label, description)
    select e.ord::int, x.icon, x.name, x.statements, coalesce(x.short_label, ''), coalesce(x.description, '')
    from jsonb_array_elements(p_data) with ordinality as e(val, ord),
         jsonb_to_record(e.val) as x(icon text, name text, statements text, short_label text, description text);
end $$;

create or replace function public.admin_save_team(p_password text, p_data jsonb)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
    perform _assert_admin(p_password);
    delete from team_members where true;
    insert into team_members (position, name, role, photo_url)
    select e.ord::int, x.name, coalesce(x.role, ''), coalesce(x.photo_url, '')
    from jsonb_array_elements(p_data) with ordinality as e(val, ord),
         jsonb_to_record(e.val) as x(name text, role text, photo_url text);
end $$;

create or replace function public.admin_save_texts(p_password text, p_data jsonb)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
    perform _assert_admin(p_password);
    insert into site_texts (key, value)
    select k, v from jsonb_each_text(p_data) as t(k, v)
    on conflict (key) do update set value = excluded.value;
end $$;

grant execute on function
    public.admin_check(text), public.submit_entry(text,int,text,date,jsonb), public.get_public_scores(),
    public.admin_get_submissions(text), public.admin_delete_submission(text,bigint),
    public.admin_delete_all_submissions(text), public.admin_save_habits(text,jsonb),
    public.admin_save_team(text,jsonb), public.admin_save_texts(text,jsonb)
to anon, authenticated;
revoke execute on function public._assert_admin(text) from public, anon, authenticated;

-- ---------- DATA AWAL ----------
insert into public.site_texts (key, value) values
('menu_beranda','Beranda'),('menu_diagram','Diagram'),('menu_murid','Laman Murid'),
('menu_admin','Laman Admin'),('menu_tentang','Tentang'),
('school_name','SMA Negeri 5 Semarang'),
('hero_badge','Program Karakter Kebangsaan & Prestasi SMAN 5 Semarang'),
('hero_title','NEXARA'),
('hero_text','Gerakan pembentukan karakter, kedisiplinan, dan kesiapan mental para siswa SMA Negeri 5 Semarang dalam meraih impian tinggi, menjaga kesehatan diri, serta sukses menembus Perguruan Tinggi Negeri (PTN) Impian.'),
('habits_title','Pengertian & 7 Indikator KAIH'),
('habits_intro','Struktur kebiasaan positif harian siswa SMA Negeri 5 Semarang'),
('diagram_title','Diagram 7 KAIH'),
('diagram_intro','Data terhubung dari tanggapan murid di Laman Murid dan diperbarui otomatis setiap 15 detik.'),
('murid_title','Isi 7 KAIH hari ini'),
('murid_intro','Silakan isi jurnal kebiasaan harian Anda dengan sejujur-jujurnya. Satu nama hanya dapat mengisi satu kali per hari.'),
('murid_scale_hint','Pilih angka 0–4 pada tiap pernyataan (0 = tidak pernah, 4 = setiap hari).'),
('scale_left','Tidak pernah'),('scale_right','Setiap hari'),
('admin_title','Panel admin'),
('tentang_title','Tentang pembuat'),
('tentang_intro','NEXARA 7 KAIH dibuat oleh murid dan guru SMA Negeri 5 Semarang.'),
('footer_text','Inovasi Kebiasaan Anak Indonesia Hebat (7 KAIH) - Menuju Sukses PTN & Karakter Unggul')
on conflict (key) do nothing;

insert into public.habits (position, icon, name, short_label, description, statements)
select * from (values
(1,'fa-sun','Bangun Pagi','Bangun Pagi','Disiplin waktu, bangun pagi tanpa drama kesiangan untuk mengawali hari secara optimal.',
$$Saya bangun tidur sebelum pukul 05.30 pagi setiap hari sehingga tidak terlambat sekolah$$),
(2,'fa-hands-praying','Beribadah','Ibadah','Menjaga kedekatan spiritual demi ketenangan mental dan kelancaran pencapaian cita-cita.',
$$3 hari sebelumnya saya menjalankan ibadah sesuai dengan agama/kepercayaan saya tepat waktu dan khidmat
3 hari sebelumnya saya mengawali dan mengakhiri kegiatan harian (seperti belajar dan makan) dengan berdoa.$$),
(3,'fa-person-running','Berolahraga','Olahraga','Rutin menggerakkan tubuh agar fisik tetap bugar, sehat, dan stamina tidak gampang drop.',
$$3 hari sebelumnya saya melakukan aktivitas fisik atau olahraga (misalnya berlari, senam, bersepeda) minimal 3 kali seminggu
3 hari sebelumnya saya berpartisipasi aktif dalam kegiatan olahraga di sekolah atau ekstrakurikuler.$$),
(4,'fa-apple-whole','Makan Sehat dan Bergizi','Makan Sehat','Nutrisi seimbang, bukan sekadar kenyang atau junk food, untuk menyokong performa tubuh.',
$$3 hari sebelumnya saya makan makanan sehat dan bergizi
3 hari sebelumnya saya memilih makanan/jajanan sehat yang mengandung buah, sayur, atau protein saat di sekolah dan rumah$$),
(5,'fa-book-open','Gemar Membaca','Membaca','Membaca buku dan wawasan baru di luar buku pelajaran sekolah.',
$$3 hari sebelumnya saya meluangkan waktu membaca buku (non-pelajaran/literasi) minimal 15–30 menit setiap hari.$$),
(6,'fa-hand-holding-heart','Membantu Orang Tua','Bantu Ortu','Peduli dan ringan tangan membantu pekerjaan di rumah tanpa menunggu diperintah.',
$$3 hari sebelumnya saya membantu pekerjaan rumah tangga (misalnya menyapu, mencuci piring, menjaga adik) di rumah tanpa diperintah$$),
(7,'fa-bed','Tidur Cepat (Tepat Waktu)','Tidur Cepat','Tidur malam tepat waktu agar regenerasi sel dan fokus otak tetap tajam.',
$$3 hari sebelumnya saya tidur malam tidak melebihi pukul 21.30/22.00.
3 hari sebelumnya saya mematikan atau tidak menggunakan gadget/smartphone saat mendekati jam tidur malam.$$)
) as v(position, icon, name, short_label, description, statements)
where not exists (select 1 from public.habits);

insert into public.team_members (position, name, role, photo_url)
select * from (values
(1,'Fahim Rayhan I. P','Murid SMA Negeri 5 Semarang kelas XI-8',''),
(2,'Nieki Erli A','Murid SMA Negeri 5 Semarang kelas XI-8',''),
(3,'Vina Khalimatus S','Murid SMA Negeri 5 Semarang kelas XI-8',''),
(4,'Keanu Yusuf A','Murid SMA Negeri 5 Semarang kelas XI-8',''),
(5,'M Addia Hadyan Gala','Murid SMA Negeri 5 Semarang kelas XI-8',''),
(6,'Nico Chaesario','Guru Informatika SMA Negeri 5 Semarang',''),
(7,'Rohmat Nugroho','Guru KKA SMA Negeri 5 Semarang','')
) as v(position, name, role, photo_url)
where not exists (select 1 from public.team_members);
