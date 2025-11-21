
import { UserRole, Review, Language } from './types';
import { Tv, Ticket, Popcorn, Video, Film, Glasses, Disc, Camera, Clapperboard, Award, Crown } from 'lucide-react';

export const STICKY_COLORS = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  cyan: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',
  sky: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
};

export const COLOR_VARIANTS = Object.keys(STICKY_COLORS) as Review['colorVariant'][];

export const STICKY_ROTATIONS = [
  'rotate-1',
  '-rotate-1',
  'rotate-2',
  '-rotate-2',
  'rotate-0'
];

// Helper to get milestones text based on language
export const GET_LEVEL_MILESTONES = (lang: Language) => [
  { count: 0, role: UserRole.NOVICE, description: lang === 'id' ? "Baru nonton satu film. Imut banget." : "Just watched one movie. Adorable." },
  { count: 25, role: UserRole.LEVEL_1, description: lang === 'id' ? "Nonton film buat hiburan doang. Perilaku warga normal." : "Watching movies for fun. Normal behavior." },
  { count: 50, role: UserRole.LEVEL_2, description: lang === 'id' ? "Mbak-mbak bioskop XXI udah mulai hafal muka kamu." : "The cinema staff strictly knows your face." },
  { count: 75, role: UserRole.LEVEL_3, description: lang === 'id' ? "Mulai sering batalin janji keluar demi namatin watchlist." : "Canceling plans to finish your watchlist." },
  { count: 100, role: UserRole.LEVEL_4, description: lang === 'id' ? "Semua dicatet. Film sampah pun di-log biar statistik bagus." : "Everything is logged. Even trash movies for the stats." },
  { count: 125, role: UserRole.LEVEL_5, description: lang === 'id' ? "Kamu pikir rasio 4:3 itu sebuah kepribadian." : "You think 4:3 aspect ratio is a personality trait." },
  { count: 150, role: UserRole.LEVEL_6, description: lang === 'id' ? "Uang jajan habis buat beli Blu-ray Criterion Collection." : "Rent money gone to Criterion Collection Blu-rays." },
  { count: 175, role: UserRole.LEVEL_7, description: lang === 'id' ? "Menganalisis 'color grading' sambil nangis di pojokan." : "Analyzing color grading while crying in the corner." },
  { count: 200, role: UserRole.LEVEL_8, description: lang === 'id' ? "Ogah nonton film kalau skor Rotten Tomatoes di bawah 90%." : "Refuse to watch anything under 90% on Rotten Tomatoes." },
  { count: 225, role: UserRole.LEVEL_9, description: lang === 'id' ? "Punya opini keras soal pemenang Cannes Film Festival." : "You have strong opinions about Cannes winners." },
  { count: 250, role: UserRole.LEVEL_10, description: lang === 'id' ? "Martin Scorsese nge-chat kamu minta rekomendasi film." : "Martin Scorsese texts you for recommendations." },
];

// Configuration for 3D Sticker Styles
export const RANK_STYLES = {
    [UserRole.NOVICE]: { gradient: 'from-slate-400 to-slate-500', shadow: '#475569', icon: Tv },
    [UserRole.LEVEL_1]: { gradient: 'from-blue-400 to-blue-500', shadow: '#2563eb', icon: Ticket },
    [UserRole.LEVEL_2]: { gradient: 'from-yellow-400 to-yellow-500', shadow: '#ca8a04', icon: Popcorn },
    [UserRole.LEVEL_3]: { gradient: 'from-green-400 to-green-500', shadow: '#15803d', icon: Video },
    [UserRole.LEVEL_4]: { gradient: 'from-orange-400 to-orange-500', shadow: '#c2410c', icon: Film },
    [UserRole.LEVEL_5]: { gradient: 'from-pink-400 to-pink-500', shadow: '#be185d', icon: Glasses },
    [UserRole.LEVEL_6]: { gradient: 'from-purple-400 to-purple-500', shadow: '#7e22ce', icon: Disc },
    [UserRole.LEVEL_7]: { gradient: 'from-indigo-400 to-indigo-500', shadow: '#4338ca', icon: Camera },
    [UserRole.LEVEL_8]: { gradient: 'from-teal-400 to-teal-500', shadow: '#0f766e', icon: Clapperboard },
    [UserRole.LEVEL_9]: { gradient: 'from-rose-400 to-rose-500', shadow: '#be123c', icon: Award },
    [UserRole.LEVEL_10]: { gradient: 'from-amber-300 to-yellow-500', shadow: '#b45309', icon: Crown },
};

export const GET_MOODS = (lang: Language) => lang === 'id' ? [
  "Nyaman (Cozy)", "Melankolis", "Tegang", "Mind-Bending", 
  "Kacau (Chaotic)", "Romantis", "Inspiratif", "Horror/Creepy"
] : [
  "Cozy", "Melancholic", "Tense", "Mind-Bending",
  "Chaotic", "Romantic", "Inspiring", "Spooky"
];

export const GET_VIBES = (lang: Language) => lang === 'id' ? [
  "Neon Noir", "90s Grunge", "Seperti Mimpi", "Nostalgia Musim Panas", 
  "Dystopian", "Misteri Kota Kecil", "Ala Ghibli", "Dark Academia"
] : [
  "Neon Noir", "90s Grunge", "Dreamlike", "Summer Nostalgia",
  "Dystopian", "Small Town Mystery", "Ghibli-esque", "Dark Academia"
];

export const MOVIE_QUOTES = [
  { text: "Here's looking at you, kid.", movie: "Casablanca", year: "1942" },
  { text: "May the Force be with you.", movie: "Star Wars", year: "1977" },
  { text: "You're gonna need a bigger boat.", movie: "Jaws", year: "1975" },
  { text: "I see dead people.", movie: "The Sixth Sense", year: "1999" },
  { text: "Keep your friends close, but your enemies closer.", movie: "The Godfather Part II", year: "1974" },
  { text: "Say 'hello' to my little friend!", movie: "Scarface", year: "1983" },
  { text: "Why so serious?", movie: "The Dark Knight", year: "2008" },
  { text: "The first rule of Fight Club is: You do not talk about Fight Club.", movie: "Fight Club", year: "1999" },
  { text: "There's no place like home.", movie: "The Wizard of Oz", year: "1939" },
  { text: "I'm the king of the world!", movie: "Titanic", year: "1997" },
  { text: "Carpe diem. Seize the day, boys.", movie: "Dead Poets Society", year: "1989" },
  { text: "Just keep swimming.", movie: "Finding Nemo", year: "2003" },
  { text: "To infinity and beyond!", movie: "Toy Story", year: "1995" },
  { text: "It's alive! It's alive!", movie: "Frankenstein", year: "1931" },
  { text: "Houston, we have a problem.", movie: "Apollo 13", year: "1995" }
];

export const TRANSLATIONS = {
  id: {
    // Auth
    who_reviewing: "Siapa kurator hari ini?",
    add_account: "Tambah Akun",
    manage_profiles: "Atur Profil",
    done: "Selesai",
    login: "Masuk",
    join_cinenote: "Gabung CineNote",
    username: "Username",
    password: "Password",
    create_account: "Buat Akun",
    no_account: "Belum punya akun? Daftar",
    back_login: "Kembali ke login",
    login_failed: "Gagal login ke profil.",
    required: "Wajib diisi",
    // Navbar
    streak_tooltip: (days: number) => days > 0 ? `${days} Hari Streak!` : "Mulai streak hari ini!",
    rank_tooltip: "Lihat Progres",
    theme_light: "Mode Terang",
    theme_dark: "Mode Gelap",
    settings_tooltip: "Pengaturan API",
    logout_tooltip: "Keluar",
    rank_title: "Peringkat",
    // Main
    diary_of: "Diari Film",
    loading_quote: "Memuat kata-kata mutiara...",
    add_review_btn: "Tambahkan Review",
    films_logged: "Film Tercatat",
    sort_newest: "Terbaru",
    sort_oldest: "Terlama",
    empty_title: "Belum ada film.",
    empty_subtitle: "Yakin akhir pekan ini cuma nyentuh rumput?",
    // Add Review Form
    header_search: "Nonton apa hari ini?",
    header_details: "Bener ini filmnya?",
    header_review: "Kasih paham!",
    saved_title: "Tersimpan",
    saved_msg: "Sudah dicatat!",
    search_placeholder: "Cari film di IMDb...",
    searching: "Mencari",
    confirm_btn: "Ya, ini filmnya",
    rating_label: "Rating Kamu",
    review_label: "Review",
    just_watched_toggle: "Cuma nonton (tanpa review)",
    review_placeholder: "Karya agung? Sampah visual? Atau cuma menang di lighting?",
    just_watched_overlay: "Dicatat sebagai 'Sudah Ditonton'",
    save_btn: "Simpan ke Diari",
    error_imdb_id: "Tidak bisa mengambil detail: ID IMDb hilang",
    error_fetch_details: "Gagal mengambil detail film.",
    error_search: "Gagal mencari film",
    // Sticky Note
    watched_label: "DITONTON",
    read_more: "Selengkapnya",
    close: "Tutup",
    share_tooltip: "Bagikan gambar",
    delete_tooltip: "Hapus review",
    just_watched_watermark: "Sudah Nonton",
    share_via: "via CineNote",
    // Mood Recommender
    mood_title: "Lagi Mood Apa?",
    mood_subtitle: "Deskripsikan isi kepalamu, dapatkan rekomendasi film.",
    mood_label: "Aku merasa...",
    mood_placeholder: "contoh: Nostalgia, lagi kacau, males...",
    vibe_label: "Pengen nonton yang...",
    vibe_placeholder: "contoh: 80s sci-fi, alur lambat, hujan...",
    clear_btn: "Bersihkan",
    generate_btn: "Carikan Film",
    vibe_check_label: "Vibe Check",
    // Rank Modal
    rank_modal_title: "Peringkat Cinephile",
    rank_modal_subtitle: "Perjalananmu menjadi sok tahu film",
    films_count: "Film",
    next_milestone: (count: number) => `${count} film lagi buat buka stiker selanjutnya`,
    all_unlocked: "Kamu sudah koleksi semua stiker. Sana sentuh rumput.",
    // API Modal
    api_modal_title: "Perlu API Key OMDb",
    api_modal_desc: "Untuk mencari film dan mengambil poster, aplikasi ini butuh API Key dari OMDb (The Open Movie Database).",
    api_placeholder: "Masukkan OMDb API Key kamu",
    save_key_btn: "Simpan Key",
    get_key_link: "Dapatkan API key gratis di sini",
  },
  en: {
    // Auth
    who_reviewing: "Who is reviewing?",
    add_account: "Add Account",
    manage_profiles: "Manage Profiles",
    done: "Done",
    login: "Login",
    join_cinenote: "Join CineNote",
    username: "Username",
    password: "Password",
    create_account: "Create Account",
    no_account: "No account? Sign up",
    back_login: "Back to login",
    login_failed: "Failed to login to profile.",
    required: "Required",
    // Navbar
    streak_tooltip: (days: number) => days > 0 ? `${days} Day Streak!` : "Start your streak today!",
    rank_tooltip: "View Progress",
    theme_light: "Light Mode",
    theme_dark: "Dark Mode",
    settings_tooltip: "API Settings",
    logout_tooltip: "Logout",
    rank_title: "Rank",
    // Main
    diary_of: "Film Diary",
    loading_quote: "Loading wisdom...",
    add_review_btn: "Add Review",
    films_logged: "Films Logged",
    sort_newest: "Newest",
    sort_oldest: "Oldest",
    empty_title: "No films yet.",
    empty_subtitle: "Did you really just touch grass this weekend?",
    // Add Review Form
    header_search: "What did you watch?",
    header_details: "Is this the one?",
    header_review: "Spill the tea!",
    saved_title: "Saved",
    saved_msg: "Logged successfully!",
    search_placeholder: "Search movie on IMDb...",
    searching: "Searching",
    confirm_btn: "Yes, this is it",
    rating_label: "Your Rating",
    review_label: "Review",
    just_watched_toggle: "Just watched (no review)",
    review_placeholder: "Masterpiece? Visual trash? Or just good lighting?",
    just_watched_overlay: "Logged as 'Watched'",
    save_btn: "Save to Diary",
    error_imdb_id: "Cannot fetch details: Missing IMDb ID",
    error_fetch_details: "Failed to fetch full movie details.",
    error_search: "Failed to search movies",
    // Sticky Note
    watched_label: "WATCHED",
    read_more: "Read More",
    close: "Close",
    share_tooltip: "Share image",
    delete_tooltip: "Delete review",
    just_watched_watermark: "Just Watched",
    share_via: "via CineNote",
    // Mood Recommender
    mood_title: "What's the Mood?",
    mood_subtitle: "Describe your headspace, get a movie rec.",
    mood_label: "I'm feeling...",
    mood_placeholder: "e.g., Nostalgic, chaotic, lazy...",
    vibe_label: "I want a...",
    vibe_placeholder: "e.g., 80s sci-fi, slow burn, rainy...",
    clear_btn: "Clear",
    generate_btn: "Find Movies",
    vibe_check_label: "Vibe Check",
    // Rank Modal
    rank_modal_title: "Cinephile Ranks",
    rank_modal_subtitle: "Your journey to becoming a film snob",
    films_count: "Films",
    next_milestone: (count: number) => `${count} more films to unlock next sticker`,
    all_unlocked: "You collected all stickers. Go touch grass.",
    // API Modal
    api_modal_title: "OMDb API Key Needed",
    api_modal_desc: "To search movies and fetch posters, this app requires an API Key from OMDb (The Open Movie Database).",
    api_placeholder: "Enter your OMDb API Key",
    save_key_btn: "Save Key",
    get_key_link: "Get a free API key here",
  }
};
