
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
  { count: 0, role: UserRole.NOVICE, description: lang === 'id' ? "Satu film tercatat. Selamat datang di dunia sinema!" : "One film logged. The start of your cinematic journey." },
  { count: 25, role: UserRole.LEVEL_1, description: lang === 'id' ? "Nonton buat hiburan doang. Fase yang sehat." : "Watching for entertainment. A healthy, normal phase." },
  { count: 50, role: UserRole.LEVEL_2, description: lang === 'id' ? "Staf bioskop mulai hafal wajahmu." : "The local cinema staff is starting to recognize you." },
  { count: 75, role: UserRole.LEVEL_3, description: lang === 'id' ? "Mulai sering nolak ajakan main demi namatin watchlist." : "Canceling social plans to finish your watchlist." },
  { count: 100, role: UserRole.LEVEL_4, description: lang === 'id' ? "Hanya catat (tanpa ulasan). Demi data statistik." : "Everything is logged. Even bad movies count for the stats." },
  { count: 125, role: UserRole.LEVEL_5, description: lang === 'id' ? "Mulai sadar kalau rasio 4:3 itu estetik." : "Starting to argue that 4:3 aspect ratio is superior aesthetics." },
  { count: 150, role: UserRole.LEVEL_6, description: lang === 'id' ? "Gaji habis buat beli Blu-ray edisi terbatas." : "Savings drained for limited edition Blu-ray collections." },
  { count: 175, role: UserRole.LEVEL_7, description: lang === 'id' ? "Lebih sibuk analisis 'color grading' daripada nikmatin cerita." : "Analyzing color grading instead of enjoying the plot." },
  { count: 200, role: UserRole.LEVEL_8, description: lang === 'id' ? "Anti banget nonton film yang skornya di bawah 90%." : "Refusing to watch anything under 90% on Rotten Tomatoes." },
  { count: 225, role: UserRole.LEVEL_9, description: lang === 'id' ? "Punya opini super spesifik soal pemenang festival Cannes." : "You have very specific opinions about Cannes winners." },
  { count: 250, role: UserRole.LEVEL_10, description: lang === 'id' ? "Martin Scorsese mungkin bakal minta rekomendasi film ke kamu." : "Martin Scorsese might text you for recommendations." },
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

export const GET_QUICK_PICKS = (lang: Language) => lang === 'id' ? [
  "Butuh Semangat", "Plot Twist Gila", "Nangis Bombay", "Action Tanpa Mikir", 
  "Horor Mencekam", "Romantis Tipis-tipis", "Sci-Fi Klasik", "Misteri Detektif"
] : [
  "Need Motivation", "Crazy Plot Twist", "Tearjerker", "Mindless Action",
  "Terrifying Horror", "Subtle Romance", "Classic Sci-Fi", "Detective Mystery"
];

export const TRANSLATIONS = {
  id: {
    // Auth
    who_reviewing: "Siapa nih yang mau masuk?",
    add_account: "Akun Baru",
    manage_profiles: "Atur Profil",
    done: "Selesai",
    login: "Masuk",
    join_cinenote: "Gabung CineNote Yuk",
    username: "Username",
    password: "Password",
    create_account: "Bikin Akun",
    no_account: "Belum punya akun? Bikin dulu sini",
    back_login: "Balik ke halaman login",
    login_failed: "Duh, gagal masuk profil nih.",
    required: "Wajib diisi ya",
    // Navbar
    streak_tooltip: (days: number) => days > 0 ? `${days} Hari Nonstop!` : "Gas, mulai streak nonton!",
    rank_tooltip: "Cek Level Kamu",
    theme_light: "Mode Terang",
    theme_dark: "Mode Gelap",
    settings_tooltip: "Pengaturan",
    logout_tooltip: "Keluar Akun",
    rank_title: "Level",
    // Banner
    upcoming_title: "UPDATE FILM",
    status_now: "SEDANG TAYANG",
    status_coming: "SEGERA TAYANG",
    // Main
    diary_of: "Diari Film",
    loading_quote: "Tunggu bentar...",
    add_review_btn: "Tambahkan Review",
    films_logged: "Total Film",
    sort_newest: "Paling Baru",
    sort_oldest: "Paling Lama",
    empty_title: "Belum ada film yang dicatat.",
    empty_subtitle: "Yakin weekend ini gak nonton apa-apa? Masa scrolling doang.",
    // Add Review Form
    header_search: "Barusan nonton film apa?",
    header_details: "Cek dulu, bener ini filmnya?",
    header_review: "Gimana filmnya?",
    saved_title: "Sip, Kesimpen!",
    saved_msg: "Udah masuk diari kamu ya.",
    search_placeholder: "Ketik judul film...",
    searching: "Lagi nyari...",
    confirm_btn: "Yo, bener ini",
    rating_label: "Kasih Bintang",
    review_label: "Review Kamu",
    just_watched_toggle: "Cuma catat aja (skip review)",
    review_placeholder: "Gimana filmnya? Bagus? Jelek? Atau biasa aja? Ceritain di sini biar gak lupa...",
    just_watched_overlay: "Oke, dicatat 'Sudah Ditonton' aja",
    save_btn: "Simpan Catatan",
    error_imdb_id: "Waduh, detailnya gak ketemu",
    error_fetch_details: "Gagal ambil info filmnya nih.",
    error_search: "Pencarian gagal, coba lagi ya",
    // Sticky Note
    watched_label: "SUDAH DITONTON",
    read_more: "Baca Selengkapnya",
    close: "Tutup",
    share_tooltip: "Share ke sosmed",
    delete_tooltip: "Hapus catatan",
    just_watched_watermark: "Sudah Ditonton",
    share_via: "via CineNote",
    // Mood Recommender
    mood_title: "Cari Rekomendasi",
    mood_subtitle: "Bingung mau nonton apa? Sini kita bantu pilihin.",
    input_label: "Lagi pengen nonton yang gimana?",
    input_placeholder: "Contoh: Film sedih yang endingnya bahagia, atau action tahun 90an...",
    clear_btn: "Ulang",
    generate_btn: "Cariin Film",
    vibe_check_label: "Kata Kita Sih",
    // Rank Modal
    rank_modal_title: "Level Cinephile Kamu",
    rank_modal_subtitle: "Sejauh mana petualangan film kamu?",
    films_count: "Film",
    next_milestone: (count: number) => `Nonton ${count} film lagi buat naik level`,
    all_unlocked: "Gokil! Udah mentok level nih. Suhu!",
  },
  en: {
    // Auth
    who_reviewing: "Who is the Curator?",
    add_account: "Add Account",
    manage_profiles: "Manage Profiles",
    done: "Done",
    login: "Log In",
    join_cinenote: "Join CineNote",
    username: "Username",
    password: "Password",
    create_account: "Create New Account",
    no_account: "No account? Sign up now",
    back_login: "Back to login",
    login_failed: "Failed to access profile.",
    required: "Required",
    // Navbar
    streak_tooltip: (days: number) => days > 0 ? `${days} Day Streak!` : "Start your watch streak!",
    rank_tooltip: "View Progress",
    theme_light: "Light Mode",
    theme_dark: "Dark Mode",
    settings_tooltip: "Settings",
    logout_tooltip: "Log Out",
    rank_title: "Rank",
    // Banner
    upcoming_title: "MOVIE INFO",
    status_now: "NOW SHOWING",
    status_coming: "COMING SOON",
    // Main
    diary_of: "Film Diary",
    loading_quote: "Loading inspiration...",
    add_review_btn: "Add Review",
    films_logged: "Films Logged",
    sort_newest: "Newest",
    sort_oldest: "Oldest",
    empty_title: "No film entries yet.",
    empty_subtitle: "Did you spend the weekend just scrolling?",
    // Add Review Form
    header_search: "What did you watch recently?",
    header_details: "Confirm Movie Details",
    header_review: "Write your Review",
    saved_title: "Saved",
    saved_msg: "Successfully logged to diary!",
    search_placeholder: "Search for a movie...",
    searching: "Searching",
    confirm_btn: "Yes, this is it",
    rating_label: "Your Rating",
    review_label: "Review",
    just_watched_toggle: "Log as 'Watched' only (no review)",
    review_placeholder: "Cinematic masterpiece? Visual clutter? or just good vibes? Write your thoughts...",
    just_watched_overlay: "Logged as 'Watched'",
    save_btn: "Save to Diary",
    error_imdb_id: "Details missing",
    error_fetch_details: "Failed to retrieve full movie details.",
    error_search: "Search failed",
    // Sticky Note
    watched_label: "WATCHED",
    read_more: "Read More",
    close: "Close",
    share_tooltip: "Share review card",
    delete_tooltip: "Delete entry",
    just_watched_watermark: "Watched",
    share_via: "via CineNote",
    // Mood Recommender
    mood_title: "Find Recommendations",
    mood_subtitle: "Describe what you want, get a curated pick.",
    input_label: "What kind of movie do you want?",
    input_placeholder: "e.g. Sad movie with happy ending, or 90s action...",
    clear_btn: "Reset",
    generate_btn: "Find Movies",
    vibe_check_label: "Our Take",
    // Rank Modal
    rank_modal_title: "Cinephile Ranks",
    rank_modal_subtitle: "Your journey in cinema appreciation",
    films_count: "Films",
    next_milestone: (count: number) => `${count} more films to unlock the next tier`,
    all_unlocked: "You have unlocked all achievements. Outstanding.",
  }
};

export const MOVIE_QUOTES = [
  { text: "Here's looking at you, kid.", movie: "Casablanca" },
  { text: "May the Force be with you.", movie: "Star Wars" },
  { text: "I'm gonna make him an offer he can't refuse.", movie: "The Godfather" },
  { text: "You talking to me?", movie: "Taxi Driver" },
  { text: "There's no place like home.", movie: "The Wizard of Oz" },
  { text: "I am your father.", movie: "The Empire Strikes Back" },
  { text: "Why so serious?", movie: "The Dark Knight" },
  { text: "To infinity and beyond!", movie: "Toy Story" },
  { text: "Keep your friends close, but your enemies closer.", movie: "The Godfather Part II" },
  { text: "You're gonna need a bigger boat.", movie: "Jaws" },
  { text: "Life is like a box of chocolates.", movie: "Forrest Gump" },
  { text: "My precious.", movie: "The Lord of the Rings: The Two Towers" },
  { text: "I'll be back.", movie: "The Terminator" },
  { text: "Just keep swimming.", movie: "Finding Nemo" },
  { text: "Bond. James Bond.", movie: "Dr. No" }
];
