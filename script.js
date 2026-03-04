/* ============================================= */
/*  SISTEM AKADEMIK MINI - JAVASCRIPT            */
/*  Pure JS with OOP (Class-based)               */
/* ============================================= */

// ============================================= //
//  CLASS DEFINITIONS (OOP)                      //
// ============================================= //

/**
 * Class MataKuliah
 * Merepresentasikan satu mata kuliah beserta nilai
 */
class MataKuliah {
    constructor(nama, sks, semester, nilaiTugas, nilaiUTS, nilaiUAS, bobotTugas, bobotUTS, bobotUAS) {
        this.nama = nama;
        this.sks = parseInt(sks);
        this.semester = parseInt(semester);

        // Komponen nilai
        this.nilaiTugas = parseFloat(nilaiTugas) || 0;
        this.nilaiUTS = parseFloat(nilaiUTS) || 0;
        this.nilaiUAS = parseFloat(nilaiUAS) || 0;

        // Bobot dalam persen
        this.bobotTugas = parseFloat(bobotTugas) || 35;
        this.bobotUTS = parseFloat(bobotUTS) || 30;
        this.bobotUAS = parseFloat(bobotUAS) || 35;

        // Hitung nilai akhir dari komponen
        this.nilaiAngka = this.hitungNilaiAkhir();
    }

    /**
     * Menghitung Nilai Akhir berdasarkan bobot
     * Nilai Akhir = (Tugas * BobotTugas/100) + (UTS * BobotUTS/100) + (UAS * BobotUAS/100)
     * @returns {number}
     */
    hitungNilaiAkhir() {
        return (this.nilaiTugas * this.bobotTugas / 100) +
               (this.nilaiUTS * this.bobotUTS / 100) +
               (this.nilaiUAS * this.bobotUAS / 100);
    }

    /**
     * Konversi nilai akhir ke grade huruf
     * @returns {string} Grade (A, B, C, D, E)
     */
    getGrade() {
        const na = Math.round(this.nilaiAngka);
        if (na >= 80) return 'A';
        if (na >= 70) return 'B';
        if (na >= 60) return 'C';
        if (na >= 50) return 'D';
        return 'E';
    }

    /**
     * Konversi grade ke bobot angka
     * @returns {number} Bobot (A=4, B=3, C=2, D=1, E=0)
     */
    getBobot() {
        const gradeMap = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'E': 0 };
        return gradeMap[this.getGrade()];
    }

    /**
     * Menghitung nilai mutu = SKS x Bobot
     * @returns {number}
     */
    getNilaiMutu() {
        return this.sks * this.getBobot();
    }
}


/**
 * Class Mahasiswa
 * Merepresentasikan seorang mahasiswa beserta daftar mata kuliah
 */
class Mahasiswa {
    constructor(nama, nim, semester) {
        this.nama = nama;
        this.nim = nim;
        this.semester = parseInt(semester);
        this.mataKuliah = [];
    }

    /**
     * Menambahkan mata kuliah ke mahasiswa
     * @param {MataKuliah} mk 
     */
    tambahMataKuliah(mk) {
        this.mataKuliah.push(mk);
    }

    /**
     * Menghapus mata kuliah berdasarkan index
     * @param {number} index 
     */
    hapusMataKuliah(index) {
        this.mataKuliah.splice(index, 1);
    }

    /**
     * Mengedit mata kuliah berdasarkan index
     * @param {number} index 
     * @param {MataKuliah} mkBaru
     */
    editMataKuliah(index, mkBaru) {
        this.mataKuliah[index] = mkBaru;
    }

    /**
     * Menghitung IPS (Indeks Prestasi Semester) untuk semester tertentu
     * IPS = Total Nilai Mutu (semester) / Total SKS (semester)
     * @param {number} semester
     * @returns {number}
     */
    hitungIPS(semester) {
        const mkSemester = this.mataKuliah.filter(mk => mk.semester === semester);
        if (mkSemester.length === 0) return 0;

        let totalNilaiMutu = 0;
        let totalSKS = 0;

        mkSemester.forEach(mk => {
            totalNilaiMutu += mk.getNilaiMutu();
            totalSKS += mk.sks;
        });

        return totalSKS > 0 ? (totalNilaiMutu / totalSKS) : 0;
    }

    /**
     * Menghitung IPK (Indeks Prestasi Kumulatif) dari seluruh mata kuliah
     * IPK = Total Seluruh Nilai Mutu / Total Seluruh SKS
     * @returns {number}
     */
    hitungIPK() {
        if (this.mataKuliah.length === 0) return 0;

        let totalNilaiMutu = 0;
        let totalSKS = 0;

        this.mataKuliah.forEach(mk => {
            totalNilaiMutu += mk.getNilaiMutu();
            totalSKS += mk.sks;
        });

        return totalSKS > 0 ? (totalNilaiMutu / totalSKS) : 0;
    }

    /**
     * Total SKS seluruh mata kuliah
     * @returns {number}
     */
    getTotalSKS() {
        return this.mataKuliah.reduce((sum, mk) => sum + mk.sks, 0);
    }

    /**
     * Mendapatkan daftar semester unik dari mata kuliah
     * @returns {number[]}
     */
    getSemesters() {
        const semesters = [...new Set(this.mataKuliah.map(mk => mk.semester))];
        return semesters.sort((a, b) => a - b);
    }
}


/**
 * Class AkademikApp
 * Controller utama aplikasi, mengelola seluruh state dan interaksi UI
 */
class AkademikApp {
    constructor() {
        // Kredensial Admin (hardcoded)
        this.ADMIN_USERNAME = 'admin';
        this.ADMIN_PASSWORD = 'admin123';

        // State
        this.mahasiswaList = [];
        this.selectedMhsIndex = -1;

        // Callback untuk modal konfirmasi
        this.modalCallback = null;

        // Inisialisasi
        this.init();
    }

    // ========================================= //
    //  INISIALISASI                              //
    // ========================================= //

    init() {
        // Load data dari localStorage
        this.loadData();

        // Deteksi halaman saat ini
        const isLoginPage = document.getElementById('loginForm');
        const isDashboardPage = document.getElementById('sidebar');

        if (isLoginPage) {
            this.initLoginPage();
        }

        if (isDashboardPage) {
            this.checkAuth();
            this.initDashboardPage();
        }
    }

    // ========================================= //
    //  LOCAL STORAGE                             //
    // ========================================= //

    /**
     * Menyimpan seluruh data mahasiswa ke localStorage
     */
    saveData() {
        const data = this.mahasiswaList.map(mhs => ({
            nama: mhs.nama,
            nim: mhs.nim,
            semester: mhs.semester,
            mataKuliah: mhs.mataKuliah.map(mk => ({
                nama: mk.nama,
                sks: mk.sks,
                semester: mk.semester,
                nilaiTugas: mk.nilaiTugas,
                nilaiUTS: mk.nilaiUTS,
                nilaiUAS: mk.nilaiUAS,
                bobotTugas: mk.bobotTugas,
                bobotUTS: mk.bobotUTS,
                bobotUAS: mk.bobotUAS
            }))
        }));
        localStorage.setItem('akademik_mahasiswa', JSON.stringify(data));
    }

    /**
     * Memuat data dari localStorage dan me-reconstruct objek Class
     */
    loadData() {
        const raw = localStorage.getItem('akademik_mahasiswa');
        if (raw) {
            try {
                const data = JSON.parse(raw);
                this.mahasiswaList = data.map(item => {
                    const mhs = new Mahasiswa(item.nama, item.nim, item.semester);
                    if (item.mataKuliah && Array.isArray(item.mataKuliah)) {
                        mhs.mataKuliah = item.mataKuliah.map(mkItem => {
                            // Backward compatibility: jika data lama hanya punya nilaiAngka
                            if (mkItem.nilaiTugas !== undefined) {
                                return new MataKuliah(
                                    mkItem.nama, mkItem.sks, mkItem.semester,
                                    mkItem.nilaiTugas, mkItem.nilaiUTS, mkItem.nilaiUAS,
                                    mkItem.bobotTugas, mkItem.bobotUTS, mkItem.bobotUAS
                                );
                            } else {
                                // Data lama: gunakan nilaiAngka sebagai semua komponen
                                return new MataKuliah(
                                    mkItem.nama, mkItem.sks, mkItem.semester,
                                    mkItem.nilaiAngka, mkItem.nilaiAngka, mkItem.nilaiAngka,
                                    35, 30, 35
                                );
                            }
                        });
                    }
                    return mhs;
                });
            } catch (e) {
                console.error('Error loading data:', e);
                this.mahasiswaList = [];
            }
        }
    }

    /**
     * Menyimpan status login ke localStorage
     */
    setLoginStatus(loggedIn) {
        localStorage.setItem('akademik_loggedIn', loggedIn ? 'true' : 'false');
    }

    /**
     * Mengecek status login
     * @returns {boolean}
     */
    isLoggedIn() {
        return localStorage.getItem('akademik_loggedIn') === 'true';
    }

    // ========================================= //
    //  LOGIN PAGE                                //
    // ========================================= //

    initLoginPage() {
        // Jika sudah login, redirect ke dashboard
        if (this.isLoggedIn()) {
            window.location.href = 'dashboard.html';
            return;
        }

        // Generate particles
        this.generateParticles();

        // Event listener form login
        const form = document.getElementById('loginForm');
        const errorMsg = document.getElementById('loginError');

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
                // Login berhasil
                this.setLoginStatus(true);
                window.location.href = 'dashboard.html';
            } else {
                // Login gagal
                errorMsg.classList.remove('hidden');
                // Shake animation restart
                errorMsg.style.animation = 'none';
                errorMsg.offsetHeight; // trigger reflow
                errorMsg.style.animation = '';
            }
        });
    }

    /**
     * Membuat animasi partikel di background halaman login
     */
    generateParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        const count = 30;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = Math.random() * 4 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 10 + 8) + 's';
            particle.style.animationDelay = (Math.random() * 10) + 's';

            // Random color from accent palette
            const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#22c55e'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];

            container.appendChild(particle);
        }
    }

    // ========================================= //
    //  AUTH CHECK                                //
    // ========================================= //

    checkAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    }

    // ========================================= //
    //  DASHBOARD PAGE                            //
    // ========================================= //

    initDashboardPage() {
        // Navigasi sidebar
        this.initNavigation();

        // Mobile sidebar
        this.initMobileSidebar();

        // Logout
        this.initLogout();

        // Form Mahasiswa
        this.initFormMahasiswa();

        // Form Mata Kuliah
        this.initFormMataKuliah();

        // Select Mahasiswa (pilih di halaman MK)
        this.initSelectMahasiswa();

        // Search
        this.initSearch();

        // Modal
        this.initModal();

        // Export
        this.initExport();

        // Render semua data
        this.renderAll();
    }

    // ========================================= //
    //  NAVIGATION                                //
    // ========================================= //

    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-page]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pageName = item.getAttribute('data-page');
                this.navigateTo(pageName);
            });
        });
    }

    /**
     * Navigasi ke halaman (page section) tertentu
     * @param {string} pageName - Nama page (dashboard, mahasiswa, matakuliah, export)
     */
    navigateTo(pageName) {
        // Update nav items
        document.querySelectorAll('.nav-item[data-page]').forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);
        if (activeNav) activeNav.classList.add('active');

        // Show page
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const pageId = 'page' + pageName.charAt(0).toUpperCase() + pageName.slice(1);

        // Handle mapping for pageMataKuliah
        let targetPage;
        if (pageName === 'matakuliah') {
            targetPage = document.getElementById('pageMataKuliah');
        } else if (pageName === 'dashboard') {
            targetPage = document.getElementById('pageDashboard');
        } else if (pageName === 'mahasiswa') {
            targetPage = document.getElementById('pageMahasiswa');
        } else if (pageName === 'export') {
            targetPage = document.getElementById('pageExport');
        }

        if (targetPage) {
            targetPage.classList.add('active');
            // Re-trigger animation
            targetPage.style.animation = 'none';
            targetPage.offsetHeight;
            targetPage.style.animation = '';
        }

        // Close mobile sidebar
        this.closeMobileSidebar();

        // Refresh data
        this.renderAll();
    }

    // ========================================= //
    //  MOBILE SIDEBAR                            //
    // ========================================= //

    initMobileSidebar() {
        const hamburger = document.getElementById('hamburgerBtn');
        const overlay = document.getElementById('sidebarOverlay');
        const sidebar = document.getElementById('sidebar');

        if (hamburger) {
            hamburger.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('show');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }
    }

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
    }

    // ========================================= //
    //  LOGOUT                                    //
    // ========================================= //

    initLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.setLoginStatus(false);
                window.location.href = 'login.html';
            });
        }
    }

    // ========================================= //
    //  FORM MAHASISWA (CRUD)                     //
    // ========================================= //

    initFormMahasiswa() {
        const form = document.getElementById('formMahasiswa');
        const btnBatal = document.getElementById('btnBatalMhs');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.simpanMahasiswa();
            });
        }

        if (btnBatal) {
            btnBatal.addEventListener('click', () => {
                this.resetFormMahasiswa();
            });
        }
    }

    /**
     * Menyimpan mahasiswa baru atau meng-update yang sudah ada
     */
    simpanMahasiswa() {
        const nama = document.getElementById('inputNama').value.trim();
        const nim = document.getElementById('inputNIM').value.trim();
        const semester = document.getElementById('inputSemester').value;
        const editIndex = parseInt(document.getElementById('editMhsIndex').value);

        if (!nama || !nim || !semester) {
            this.showToast('Semua field wajib diisi!', 'error');
            return;
        }

        // Cek NIM duplikat
        const nimExists = this.mahasiswaList.some((mhs, i) => mhs.nim === nim && i !== editIndex);
        if (nimExists) {
            this.showToast('NIM sudah terdaftar!', 'error');
            return;
        }

        if (editIndex >= 0) {
            // Edit mode
            this.mahasiswaList[editIndex].nama = nama;
            this.mahasiswaList[editIndex].nim = nim;
            this.mahasiswaList[editIndex].semester = parseInt(semester);
            this.showToast('Data mahasiswa berhasil diperbarui!');
        } else {
            // Tambah baru
            const mhs = new Mahasiswa(nama, nim, semester);
            this.mahasiswaList.push(mhs);
            this.showToast('Mahasiswa berhasil ditambahkan!');
        }

        this.saveData();
        this.resetFormMahasiswa();
        this.renderAll();
    }

    /**
     * Mode edit mahasiswa - isi form dengan data mahasiswa yang dipilih
     * @param {number} index 
     */
    editMahasiswa(index) {
        const mhs = this.mahasiswaList[index];
        if (!mhs) return;

        document.getElementById('inputNama').value = mhs.nama;
        document.getElementById('inputNIM').value = mhs.nim;
        document.getElementById('inputSemester').value = mhs.semester;
        document.getElementById('editMhsIndex').value = index;

        document.getElementById('formMhsTitle').textContent = 'Edit Mahasiswa';
        document.getElementById('btnBatalMhs').style.display = 'inline-flex';

        // Scroll ke form
        document.getElementById('formMahasiswa').scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Hapus mahasiswa berdasarkan index (dengan konfirmasi modal)
     * @param {number} index 
     */
    hapusMahasiswa(index) {
        const mhs = this.mahasiswaList[index];
        if (!mhs) return;

        this.showModal(
            'Hapus Mahasiswa',
            `Apakah Anda yakin ingin menghapus <strong>${mhs.nama}</strong> (${mhs.nim})?`,
            () => {
                this.mahasiswaList.splice(index, 1);
                this.saveData();
                this.renderAll();
                this.showToast('Mahasiswa berhasil dihapus!');

                // Reset selected jika yang terpilih dihapus
                if (this.selectedMhsIndex === index) {
                    this.selectedMhsIndex = -1;
                    this.updateSelectMahasiswa();
                }
            }
        );
    }

    /**
     * Reset form mahasiswa ke mode tambah
     */
    resetFormMahasiswa() {
        document.getElementById('formMahasiswa').reset();
        document.getElementById('editMhsIndex').value = '-1';
        document.getElementById('formMhsTitle').textContent = 'Tambah Mahasiswa';
        document.getElementById('btnBatalMhs').style.display = 'none';
    }

    // ========================================= //
    //  FORM MATA KULIAH                          //
    // ========================================= //

    initFormMataKuliah() {
        const form = document.getElementById('formMataKuliah');
        const btnBatal = document.getElementById('btnBatalMK');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.simpanMataKuliah();
            });
        }

        if (btnBatal) {
            btnBatal.addEventListener('click', () => {
                this.resetFormMataKuliah();
            });
        }

        // Live preview Nilai Akhir
        this.initNilaiAkhirPreview();
    }

    /**
     * Setup live preview untuk Nilai Akhir
     * Menghitung otomatis saat user ketik nilai atau bobot
     */
    initNilaiAkhirPreview() {
        const ids = ['inputNilaiTugas', 'inputNilaiUTS', 'inputNilaiUAS',
                     'inputBobotTugas', 'inputBobotUTS', 'inputBobotUAS'];

        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.updateNilaiAkhirPreview());
            }
        });
    }

    /**
     * Update preview Nilai Akhir secara real-time
     */
    updateNilaiAkhirPreview() {
        const nilaiTugas = parseFloat(document.getElementById('inputNilaiTugas').value) || 0;
        const nilaiUTS = parseFloat(document.getElementById('inputNilaiUTS').value) || 0;
        const nilaiUAS = parseFloat(document.getElementById('inputNilaiUAS').value) || 0;
        const bobotTugas = parseFloat(document.getElementById('inputBobotTugas').value) || 0;
        const bobotUTS = parseFloat(document.getElementById('inputBobotUTS').value) || 0;
        const bobotUAS = parseFloat(document.getElementById('inputBobotUAS').value) || 0;

        const nilaiAkhir = (nilaiTugas * bobotTugas / 100) +
                           (nilaiUTS * bobotUTS / 100) +
                           (nilaiUAS * bobotUAS / 100);

        const totalBobot = bobotTugas + bobotUTS + bobotUAS;

        const naEl = document.getElementById('previewNilaiAkhir');
        const tbEl = document.getElementById('previewTotalBobot');

        if (naEl) naEl.textContent = nilaiAkhir.toFixed(2);
        if (tbEl) {
            tbEl.textContent = totalBobot;
            // Warnai merah jika total bobot != 100
            tbEl.parentElement.style.color = (totalBobot !== 100)
                ? 'var(--accent-red)' : 'var(--text-muted)';
        }
    }

    /**
     * Menyimpan mata kuliah baru atau meng-update yang sudah ada
     */
    simpanMataKuliah() {
        if (this.selectedMhsIndex < 0) {
            this.showToast('Pilih mahasiswa terlebih dahulu!', 'error');
            return;
        }

        const namaMK = document.getElementById('inputMK').value.trim();
        const sks = document.getElementById('inputSKS').value;
        const semesterMK = document.getElementById('inputSemesterMK').value;
        const nilaiTugas = document.getElementById('inputNilaiTugas').value;
        const nilaiUTS = document.getElementById('inputNilaiUTS').value;
        const nilaiUAS = document.getElementById('inputNilaiUAS').value;
        const bobotTugas = document.getElementById('inputBobotTugas').value;
        const bobotUTS = document.getElementById('inputBobotUTS').value;
        const bobotUAS = document.getElementById('inputBobotUAS').value;
        const editIndex = parseInt(document.getElementById('editMkIndex').value);

        if (!namaMK || !sks || nilaiTugas === '' || nilaiUTS === '' || nilaiUAS === '' || !semesterMK) {
            this.showToast('Semua field wajib diisi!', 'error');
            return;
        }

        // Validasi nilai 0-100
        const nilaiArr = [parseFloat(nilaiTugas), parseFloat(nilaiUTS), parseFloat(nilaiUAS)];
        if (nilaiArr.some(n => n < 0 || n > 100)) {
            this.showToast('Nilai harus antara 0 - 100!', 'error');
            return;
        }

        // Validasi total bobot harus 100
        const totalBobot = parseFloat(bobotTugas) + parseFloat(bobotUTS) + parseFloat(bobotUAS);
        if (totalBobot !== 100) {
            this.showToast(`Total bobot harus 100%! Saat ini: ${totalBobot}%`, 'error');
            return;
        }

        const mk = new MataKuliah(namaMK, sks, semesterMK,
            nilaiTugas, nilaiUTS, nilaiUAS,
            bobotTugas, bobotUTS, bobotUAS);
        const mhs = this.mahasiswaList[this.selectedMhsIndex];

        if (editIndex >= 0) {
            mhs.editMataKuliah(editIndex, mk);
            this.showToast('Mata kuliah berhasil diperbarui!');
        } else {
            mhs.tambahMataKuliah(mk);
            this.showToast('Mata kuliah berhasil ditambahkan!');
        }

        this.saveData();
        this.resetFormMataKuliah();
        this.renderMataKuliah();
        this.renderDashboardStats();
    }

    /**
     * Mode edit mata kuliah
     * @param {number} index 
     */
    editMataKuliahItem(index) {
        if (this.selectedMhsIndex < 0) return;
        const mhs = this.mahasiswaList[this.selectedMhsIndex];
        const mk = mhs.mataKuliah[index];
        if (!mk) return;

        document.getElementById('inputMK').value = mk.nama;
        document.getElementById('inputSKS').value = mk.sks;
        document.getElementById('inputSemesterMK').value = mk.semester;
        document.getElementById('inputNilaiTugas').value = mk.nilaiTugas;
        document.getElementById('inputNilaiUTS').value = mk.nilaiUTS;
        document.getElementById('inputNilaiUAS').value = mk.nilaiUAS;
        document.getElementById('inputBobotTugas').value = mk.bobotTugas;
        document.getElementById('inputBobotUTS').value = mk.bobotUTS;
        document.getElementById('inputBobotUAS').value = mk.bobotUAS;
        document.getElementById('editMkIndex').value = index;

        // Update preview
        this.updateNilaiAkhirPreview();

        document.getElementById('formMkTitle').textContent = 'Edit Mata Kuliah';
        document.getElementById('btnBatalMK').style.display = 'inline-flex';

        document.getElementById('formMataKuliah').scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Hapus mata kuliah (dengan konfirmasi)
     * @param {number} index 
     */
    hapusMataKuliahItem(index) {
        if (this.selectedMhsIndex < 0) return;
        const mhs = this.mahasiswaList[this.selectedMhsIndex];
        const mk = mhs.mataKuliah[index];
        if (!mk) return;

        this.showModal(
            'Hapus Mata Kuliah',
            `Hapus <strong>${mk.nama}</strong> dari ${mhs.nama}?`,
            () => {
                mhs.hapusMataKuliah(index);
                this.saveData();
                this.renderMataKuliah();
                this.renderDashboardStats();
                this.showToast('Mata kuliah berhasil dihapus!');
            }
        );
    }

    /**
     * Reset form mata kuliah
     */
    resetFormMataKuliah() {
        const form = document.getElementById('formMataKuliah');
        if (form) form.reset();
        document.getElementById('editMkIndex').value = '-1';
        document.getElementById('formMkTitle').textContent = 'Tambah Mata Kuliah';
        document.getElementById('btnBatalMK').style.display = 'none';
        // Reset bobot ke default
        const bobotTugas = document.getElementById('inputBobotTugas');
        const bobotUTS = document.getElementById('inputBobotUTS');
        const bobotUAS = document.getElementById('inputBobotUAS');
        if (bobotTugas) bobotTugas.value = 35;
        if (bobotUTS) bobotUTS.value = 30;
        if (bobotUAS) bobotUAS.value = 35;
        // Reset preview
        this.setTextContent('previewNilaiAkhir', '0.00');
        this.setTextContent('previewTotalBobot', '100');
        const tbEl = document.getElementById('previewTotalBobot');
        if (tbEl) tbEl.parentElement.style.color = 'var(--text-muted)';
    }

    // ========================================= //
    //  SELECT MAHASISWA (halaman MK)             //
    // ========================================= //

    initSelectMahasiswa() {
        const select = document.getElementById('selectMahasiswa');
        if (select) {
            select.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === '') {
                    this.selectedMhsIndex = -1;
                    document.getElementById('mkSection').style.display = 'none';
                } else {
                    this.selectedMhsIndex = parseInt(val);
                    document.getElementById('mkSection').style.display = 'block';
                    this.renderMataKuliah();
                }
            });
        }
    }

    /**
     * Update <select> mahasiswa
     */
    updateSelectMahasiswa() {
        const select = document.getElementById('selectMahasiswa');
        if (!select) return;

        const currentVal = select.value;
        select.innerHTML = '<option value="">-- Pilih Mahasiswa --</option>';

        this.mahasiswaList.forEach((mhs, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${mhs.nama} (${mhs.nim})`;
            select.appendChild(opt);
        });

        // Restore selection
        if (currentVal !== '' && this.selectedMhsIndex >= 0 && this.selectedMhsIndex < this.mahasiswaList.length) {
            select.value = this.selectedMhsIndex;
        } else {
            this.selectedMhsIndex = -1;
            document.getElementById('mkSection').style.display = 'none';
        }
    }

    // ========================================= //
    //  SEARCH                                    //
    // ========================================= //

    initSearch() {
        const searchInput = document.getElementById('searchMhs');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderMahasiswaTable(searchInput.value.trim().toLowerCase());
            });
        }
    }

    // ========================================= //
    //  RENDERING                                 //
    // ========================================= //

    /**
     * Render semua komponen UI
     */
    renderAll() {
        this.renderDashboardStats();
        this.renderDashboardTable();
        this.renderMahasiswaTable();
        this.updateSelectMahasiswa();

        if (this.selectedMhsIndex >= 0) {
            this.renderMataKuliah();
        }
    }

    /**
     * Render stat cards di dashboard
     */
    renderDashboardStats() {
        const totalMhs = this.mahasiswaList.length;
        let totalMK = 0;
        let totalIPK = 0;
        let totalSKS = 0;

        this.mahasiswaList.forEach(mhs => {
            totalMK += mhs.mataKuliah.length;
            totalIPK += mhs.hitungIPK();
            totalSKS += mhs.getTotalSKS();
        });

        const rataIPK = totalMhs > 0 ? (totalIPK / totalMhs) : 0;

        this.setTextContent('statMahasiswa', totalMhs);
        this.setTextContent('statMataKuliah', totalMK);
        this.setTextContent('statRataIPK', rataIPK.toFixed(2));
        this.setTextContent('statTotalSKS', totalSKS);
    }

    /**
     * Render tabel mahasiswa terbaru di dashboard (max 5)
     */
    renderDashboardTable() {
        const tbody = document.getElementById('dashboardTableBody');
        if (!tbody) return;

        if (this.mahasiswaList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Belum ada data mahasiswa</td></tr>';
            return;
        }

        // Ambil 5 terakhir
        const recent = this.mahasiswaList.slice(-5).reverse();
        tbody.innerHTML = '';

        recent.forEach((mhs, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${i + 1}</td>
                <td>${this.escapeHTML(mhs.nama)}</td>
                <td>${this.escapeHTML(mhs.nim)}</td>
                <td>${mhs.semester}</td>
                <td><strong>${mhs.hitungIPK().toFixed(2)}</strong></td>
            `;
            tbody.appendChild(tr);
        });
    }

    /**
     * Render tabel mahasiswa di halaman manajemen
     * @param {string} searchTerm - filter pencarian
     */
    renderMahasiswaTable(searchTerm = '') {
        const tbody = document.getElementById('mahasiswaTableBody');
        if (!tbody) return;

        let filtered = this.mahasiswaList;
        if (searchTerm) {
            filtered = this.mahasiswaList.filter(mhs =>
                mhs.nama.toLowerCase().includes(searchTerm) ||
                mhs.nim.toLowerCase().includes(searchTerm)
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-state">${searchTerm ? 'Tidak ditemukan' : 'Belum ada data mahasiswa'}</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        filtered.forEach((mhs, filteredIdx) => {
            // Cari index asli di mahasiswaList
            const realIndex = this.mahasiswaList.indexOf(mhs);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${filteredIdx + 1}</td>
                <td>${this.escapeHTML(mhs.nama)}</td>
                <td>${this.escapeHTML(mhs.nim)}</td>
                <td>${mhs.semester}</td>
                <td>${mhs.mataKuliah.length}</td>
                <td><strong>${mhs.hitungIPK().toFixed(2)}</strong></td>
                <td>
                    <div class="action-group">
                        <button class="btn-icon edit" title="Edit" data-action="edit-mhs" data-index="${realIndex}">
                            <iconify-icon icon="lucide:edit" width="16" height="16"></iconify-icon>
                        </button>
                        <button class="btn-icon delete" title="Hapus" data-action="delete-mhs" data-index="${realIndex}">
                            <iconify-icon icon="lucide:trash-2" width="16" height="16"></iconify-icon>
                        </button>
                    </div>
                </td>
            `;

            // Event delegation for action buttons
            tr.querySelector('[data-action="edit-mhs"]').addEventListener('click', () => {
                this.editMahasiswa(realIndex);
            });
            tr.querySelector('[data-action="delete-mhs"]').addEventListener('click', () => {
                this.hapusMahasiswa(realIndex);
            });

            tbody.appendChild(tr);
        });
    }

    /**
     * Render halaman mata kuliah (info banner + tabel MK)
     */
    renderMataKuliah() {
        if (this.selectedMhsIndex < 0 || this.selectedMhsIndex >= this.mahasiswaList.length) return;

        const mhs = this.mahasiswaList[this.selectedMhsIndex];

        // Info Banner
        this.setTextContent('infoNama', mhs.nama);
        this.setTextContent('infoNIM', `NIM: ${mhs.nim}`);
        this.setTextContent('infoSemester', `Semester ${mhs.semester}`);

        // Avatar initial
        const avatar = document.getElementById('infoAvatar');
        if (avatar) avatar.textContent = mhs.nama.charAt(0).toUpperCase();

        // IPS (berdasarkan semester mahasiswa saat ini)
        const ips = mhs.hitungIPS(mhs.semester);
        this.setTextContent('infoIPS', ips.toFixed(2));

        // IPK
        const ipk = mhs.hitungIPK();
        this.setTextContent('infoIPK', ipk.toFixed(2));

        // Total SKS
        this.setTextContent('infoTotalSKS', mhs.getTotalSKS());

        // Tabel Mata Kuliah
        const tbody = document.getElementById('mkTableBody');
        if (!tbody) return;

        if (mhs.mataKuliah.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" class="empty-state">Belum ada mata kuliah</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        mhs.mataKuliah.forEach((mk, i) => {
            const grade = mk.getGrade();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${i + 1}</td>
                <td>${this.escapeHTML(mk.nama)}</td>
                <td>${mk.sks}</td>
                <td>${mk.semester}</td>
                <td>${mk.nilaiTugas}</td>
                <td>${mk.nilaiUTS}</td>
                <td>${mk.nilaiUAS}</td>
                <td><strong>${mk.nilaiAngka.toFixed(1)}</strong></td>
                <td><span class="grade-badge grade-${grade}">${grade}</span></td>
                <td>${mk.getBobot()}</td>
                <td>${mk.getNilaiMutu()}</td>
                <td>
                    <div class="action-group">
                        <button class="btn-icon edit" title="Edit" data-action="edit-mk" data-index="${i}">
                            <iconify-icon icon="lucide:edit" width="16" height="16"></iconify-icon>
                        </button>
                        <button class="btn-icon delete" title="Hapus" data-action="delete-mk" data-index="${i}">
                            <iconify-icon icon="lucide:trash-2" width="16" height="16"></iconify-icon>
                        </button>
                    </div>
                </td>
            `;

            tr.querySelector('[data-action="edit-mk"]').addEventListener('click', () => {
                this.editMataKuliahItem(i);
            });
            tr.querySelector('[data-action="delete-mk"]').addEventListener('click', () => {
                this.hapusMataKuliahItem(i);
            });

            tbody.appendChild(tr);
        });
    }

    // ========================================= //
    //  MODAL KONFIRMASI                          //
    // ========================================= //

    initModal() {
        const overlay = document.getElementById('modalOverlay');
        const cancelBtn = document.getElementById('modalCancel');
        const confirmBtn = document.getElementById('modalConfirm');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal());
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (this.modalCallback) {
                    this.modalCallback();
                }
                this.hideModal();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.hideModal();
            });
        }
    }

    /**
     * Menampilkan modal konfirmasi
     * @param {string} title 
     * @param {string} message (bisa HTML)
     * @param {Function} callback - dipanggil saat konfirmasi
     */
    showModal(title, message, callback) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').innerHTML = message;
        document.getElementById('modalOverlay').classList.add('show');
        this.modalCallback = callback;
    }

    hideModal() {
        document.getElementById('modalOverlay').classList.remove('show');
        this.modalCallback = null;
    }

    // ========================================= //
    //  TOAST NOTIFICATION                        //
    // ========================================= //

    /**
     * Menampilkan toast notification
     * @param {string} message 
     * @param {string} type - 'success' | 'error' | 'info'
     */
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'info' ? 'toast-info' : ''}`;

        let iconHTML = '';
        if (type === 'success') {
            iconHTML = '<iconify-icon icon="lucide:check-circle" width="18" height="18" style="color:#22c55e"></iconify-icon>';
        } else if (type === 'error') {
            iconHTML = '<iconify-icon icon="lucide:x-circle" width="18" height="18" style="color:#ef4444"></iconify-icon>';
        } else {
            iconHTML = '<iconify-icon icon="lucide:info" width="18" height="18" style="color:#6366f1"></iconify-icon>';
        }

        toast.innerHTML = `
            <span class="toast-icon">${iconHTML}</span>
            <span class="toast-msg">${message}</span>
            <button class="toast-close">
                <iconify-icon icon="lucide:x" width="14" height="14"></iconify-icon>
            </button>
        `;

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        });

        container.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('removing');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    // ========================================= //
    //  EXPORT                                    //
    // ========================================= //

    initExport() {
        const pdfBtn = document.getElementById('btnExportPDF');
        const excelBtn = document.getElementById('btnExportExcel');

        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => this.exportPDF());
        }

        if (excelBtn) {
            excelBtn.addEventListener('click', () => this.exportExcel());
        }
    }

    /**
     * Export data mahasiswa ke PDF menggunakan jsPDF + AutoTable
     */
    exportPDF() {
        if (this.mahasiswaList.length === 0) {
            this.showToast('Tidak ada data untuk di-export!', 'error');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Title
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('Laporan Data Mahasiswa', 14, 20);

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text('Sistem Akademik Mini', 14, 28);
            doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 34);

            let yPos = 42;

            this.mahasiswaList.forEach((mhs, index) => {
                // Cek jika perlu halaman baru
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                // Header Mahasiswa
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text(`${index + 1}. ${mhs.nama}`, 14, yPos);
                yPos += 6;

                doc.setFontSize(9);
                doc.setFont(undefined, 'normal');
                doc.text(`NIM: ${mhs.nim}  |  Semester: ${mhs.semester}  |  IPK: ${mhs.hitungIPK().toFixed(2)}`, 14, yPos);
                yPos += 4;

                if (mhs.mataKuliah.length > 0) {
                    // Tabel Mata Kuliah
                    const mkData = mhs.mataKuliah.map((mk, i) => [
                        i + 1,
                        mk.nama,
                        mk.sks,
                        mk.semester,
                        mk.nilaiTugas,
                        mk.nilaiUTS,
                        mk.nilaiUAS,
                        mk.nilaiAngka.toFixed(1),
                        mk.getGrade(),
                        mk.getBobot(),
                        mk.getNilaiMutu()
                    ]);

                    doc.autoTable({
                        startY: yPos + 2,
                        head: [['No', 'Mata Kuliah', 'SKS', 'Smt', 'Tugas', 'UTS', 'UAS', 'N.Akhir', 'Grade', 'Bobot', 'N.Mutu']],
                        body: mkData,
                        theme: 'grid',
                        headStyles: {
                            fillColor: [99, 102, 241],
                            fontSize: 8,
                            halign: 'center'
                        },
                        bodyStyles: {
                            fontSize: 8,
                            halign: 'center'
                        },
                        columnStyles: {
                            1: { halign: 'left' }
                        },
                        margin: { left: 14, right: 14 }
                    });

                    yPos = doc.lastAutoTable.finalY + 8;

                    // IPS per semester
                    const semesters = mhs.getSemesters();
                    if (semesters.length > 0) {
                        doc.setFontSize(8);
                        const ipsTexts = semesters.map(s => `IPS Smt ${s}: ${mhs.hitungIPS(s).toFixed(2)}`);
                        doc.text(ipsTexts.join('  |  '), 14, yPos);
                        yPos += 8;
                    }
                } else {
                    doc.setFontSize(8);
                    doc.text('Belum ada mata kuliah.', 14, yPos + 4);
                    yPos += 12;
                }
            });

            doc.save('data_mahasiswa.pdf');
            this.showToast('PDF berhasil di-download!');
        } catch (e) {
            console.error('PDF Export Error:', e);
            this.showToast('Gagal membuat PDF. Pastikan library jsPDF tersedia.', 'error');
        }
    }

    /**
     * Export data mahasiswa ke Excel menggunakan SheetJS
     */
    exportExcel() {
        if (this.mahasiswaList.length === 0) {
            this.showToast('Tidak ada data untuk di-export!', 'error');
            return;
        }

        try {
            const wb = XLSX.utils.book_new();

            // Sheet 1: Data Mahasiswa
            const mhsData = this.mahasiswaList.map((mhs, i) => ({
                'No': i + 1,
                'Nama': mhs.nama,
                'NIM': mhs.nim,
                'Semester': mhs.semester,
                'Jumlah MK': mhs.mataKuliah.length,
                'Total SKS': mhs.getTotalSKS(),
                'IPK': parseFloat(mhs.hitungIPK().toFixed(2))
            }));

            const ws1 = XLSX.utils.json_to_sheet(mhsData);
            // Auto-width columns
            ws1['!cols'] = [
                { wch: 5 },
                { wch: 25 },
                { wch: 15 },
                { wch: 10 },
                { wch: 12 },
                { wch: 10 },
                { wch: 8 }
            ];
            XLSX.utils.book_append_sheet(wb, ws1, 'Data Mahasiswa');

            // Sheet 2: Detail Nilai
            const nilaiData = [];
            this.mahasiswaList.forEach(mhs => {
                mhs.mataKuliah.forEach(mk => {
                    nilaiData.push({
                        'Nama Mahasiswa': mhs.nama,
                        'NIM': mhs.nim,
                        'Mata Kuliah': mk.nama,
                        'SKS': mk.sks,
                        'Semester MK': mk.semester,
                        'Nilai Tugas': mk.nilaiTugas,
                        'Bobot Tugas (%)': mk.bobotTugas,
                        'Nilai UTS': mk.nilaiUTS,
                        'Bobot UTS (%)': mk.bobotUTS,
                        'Nilai UAS': mk.nilaiUAS,
                        'Bobot UAS (%)': mk.bobotUAS,
                        'Nilai Akhir': parseFloat(mk.nilaiAngka.toFixed(2)),
                        'Grade': mk.getGrade(),
                        'Bobot Grade': mk.getBobot(),
                        'Nilai Mutu': mk.getNilaiMutu()
                    });
                });
            });

            if (nilaiData.length > 0) {
                const ws2 = XLSX.utils.json_to_sheet(nilaiData);
                ws2['!cols'] = [
                    { wch: 25 },
                    { wch: 15 },
                    { wch: 25 },
                    { wch: 5 },
                    { wch: 12 },
                    { wch: 12 },
                    { wch: 14 },
                    { wch: 10 },
                    { wch: 14 },
                    { wch: 10 },
                    { wch: 14 },
                    { wch: 10 },
                    { wch: 12 },
                    { wch: 8 },
                    { wch: 12 },
                    { wch: 12 }
                ];
                XLSX.utils.book_append_sheet(wb, ws2, 'Detail Nilai');
            }

            XLSX.writeFile(wb, 'data_mahasiswa.xlsx');
            this.showToast('Excel berhasil di-download!');
        } catch (e) {
            console.error('Excel Export Error:', e);
            this.showToast('Gagal membuat Excel. Pastikan library SheetJS tersedia.', 'error');
        }
    }

    // ========================================= //
    //  UTILITY                                   //
    // ========================================= //

    /**
     * Set textContent of element by ID
     * @param {string} id 
     * @param {*} text 
     */
    setTextContent(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} str 
     * @returns {string}
     */
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}


// ============================================= //
//  INISIALISASI APLIKASI                        //
// ============================================= //

// Tunggu DOM loaded, lalu instantiate app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AkademikApp();
});
