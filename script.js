// ============================================================
// KONFIGURASI — ganti URL ini dengan URL Google Apps Script Anda
// ============================================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz-QiFe00noafmgurmuqGpWDivE2ulkp-uexgNyyHgf7g1QJAWVQ-m_hym6bC9tXjc/exec';

// ============================================================
// DATA SUB-MASALAH PER KATEGORI
// ============================================================
const subMasalahData = {
  'Ruang Kelas': [
    'Atap bocor', 'Dinding retak/terkelupas', 'Lantai rusak',
    'Ventilasi buruk', 'Listrik sering mati', 'Meja rusak', 'Kursi rusak'
  ],
  'Toilet / Kamar Mandi': [
    'Kotor', 'Mampet', 'Tidak ada air bersih',
    'Jumlah kurang', 'Bau menyengat', 'Keran/pintu rusak'
  ],
  'Lapangan Olahraga': [
    'Permukaan rusak/berlubang', 'Rumput tidak terawat', 'Pagar rusak',
    'Lampu lapangan mati', 'Gawang/ring rusak', 'Drainase buruk'
  ],
  'Laboratorium': [
    'Peralatan rusak', 'Bahan habis/kurang', 'Ventilasi buruk',
    'Listrik bermasalah', 'Meja/kursi rusak', 'Keamanan kurang'
  ],
  'Perpustakaan': [
    'Buku kurang/rusak', 'Rak buku rusak', 'AC/kipas tidak berfungsi',
    'Pencahayaan kurang', 'Koneksi internet lambat', 'Komputer rusak'
  ],
  'Lainnya': [
    'Kebersihan lingkungan', 'Keamanan area', 'Penerangan jalan',
    'Saluran air tersumbat', 'Tembok/pagar rusak'
  ]
};

// ============================================================
// STATE
// ============================================================
let selectedFiles = [];

// ============================================================
// DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initKategori();
  initUrgensi();
  initFotoUpload();
  initForm();
});

// ============================================================
// KATEGORI → SUB-MASALAH
// ============================================================
function initKategori() {
  const select = document.getElementById('kategori');
  select.addEventListener('change', () => {
    renderSubMasalah(select.value);
  });
}

function renderSubMasalah(kategori) {
  const container = document.getElementById('subMasalahContainer');
  const list = document.getElementById('subMasalahList');
  const lainnyaContainer = document.getElementById('lainnyaInputContainer');

  if (!kategori || !subMasalahData[kategori]) {
    container.classList.add('hidden');
    return;
  }

  const items = subMasalahData[kategori];
  list.innerHTML = '';

  items.forEach(item => {
    const id = 'sub_' + item.replace(/\s+/g, '_');
    const label = document.createElement('label');
    label.className = 'sub-checkbox-label';
    label.innerHTML = `
      <input type="checkbox" name="subMasalah" value="${item}" id="${id}" class="accent-blue-600 w-4 h-4 flex-shrink-0" />
      <span>${item}</span>
    `;
    list.appendChild(label);
  });

  // Tambah opsi "Lainnya"
  const lainnyaLabel = document.createElement('label');
  lainnyaLabel.className = 'sub-checkbox-label';
  lainnyaLabel.innerHTML = `
    <input type="checkbox" name="subMasalah" value="Lainnya" id="sub_lainnya" class="accent-blue-600 w-4 h-4 flex-shrink-0" />
    <span>Lainnya</span>
  `;
  list.appendChild(lainnyaLabel);

  // Toggle input lainnya
  document.getElementById('sub_lainnya').addEventListener('change', (e) => {
    lainnyaContainer.classList.toggle('hidden', !e.target.checked);
    if (!e.target.checked) document.getElementById('lainnyaInput').value = '';
  });

  lainnyaContainer.classList.add('hidden');
  document.getElementById('lainnyaInput').value = '';
  container.classList.remove('hidden');
}

// ============================================================
// URGENSI RADIO VISUAL
// ============================================================
function initUrgensi() {
  document.querySelectorAll('.urgensi-option input').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.urgensi-option input').forEach(r => {
        r.closest('.urgensi-option').querySelector('.urgensi-badge').style.boxShadow = '';
      });
    });
  });
}

// ============================================================
// FOTO UPLOAD & PREVIEW
// ============================================================
function initFotoUpload() {
  const dropzone = document.getElementById('dropzone');
  const input = document.getElementById('fotoInput');

  dropzone.addEventListener('click', () => input.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('bg-blue-50'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('bg-blue-50'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('bg-blue-50');
    addFiles(Array.from(e.dataTransfer.files));
  });
  input.addEventListener('change', () => { addFiles(Array.from(input.files)); input.value = ''; });
}

function addFiles(files) {
  files.filter(f => f.type.startsWith('image/')).slice(0, 5 - selectedFiles.length).forEach(file => {
    if (file.size > 5 * 1024 * 1024) { alert(`"${file.name}" melebihi batas 5MB.`); return; }
    selectedFiles.push(file);
  });
  renderPreviews();
}

function renderPreviews() {
  const container = document.getElementById('fotoPreview');
  container.innerHTML = '';
  selectedFiles.forEach((file, idx) => {
    const div = document.createElement('div');
    div.className = 'foto-thumb';
    div.innerHTML = `
      <img src="${URL.createObjectURL(file)}" alt="Foto ${idx + 1}" />
      <button type="button" class="remove-btn" data-idx="${idx}">✕</button>
    `;
    container.appendChild(div);
  });
  container.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => { selectedFiles.splice(parseInt(btn.dataset.idx), 1); renderPreviews(); });
  });
}

// ============================================================
// FORM VALIDATION & SUBMIT
// ============================================================
function initForm() {
  document.getElementById('pengaduanForm').addEventListener('submit', handleSubmit);
}

function validateForm() {
  let valid = true;

  const fields = [
    { id: 'namaKelas', errId: 'err-namaKelas' },
    { id: 'kategori', errId: 'err-kategori' },
    { id: 'lokasi', errId: 'err-lokasi' },
    { id: 'deskripsi', errId: 'err-deskripsi' },
  ];

  fields.forEach(({ id, errId }) => {
    const el = document.getElementById(id);
    const err = document.getElementById(errId);
    if (!el.value.trim()) {
      el.classList.add('error');
      err.classList.remove('hidden');
      valid = false;
    } else {
      el.classList.remove('error');
      err.classList.add('hidden');
    }
  });

  // Urgensi
  const urgensi = document.querySelector('input[name="urgensi"]:checked');
  const errUrgensi = document.getElementById('err-urgensi');
  if (!urgensi) {
    errUrgensi.classList.remove('hidden');
    valid = false;
  } else {
    errUrgensi.classList.add('hidden');
  }

  return valid;
}

async function handleSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    const firstError = document.querySelector('.error, .error-msg:not(.hidden)');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const subChecked = Array.from(document.querySelectorAll('input[name="subMasalah"]:checked'))
    .map(cb => cb.value);
  const lainnyaText = document.getElementById('lainnyaInput')?.value?.trim();
  if (subChecked.includes('Lainnya') && lainnyaText) {
    subChecked[subChecked.indexOf('Lainnya')] = `Lainnya: ${lainnyaText}`;
  }

  const namaPengadu = document.getElementById('namaPengadu').value.trim() || 'Anonim';
  const nomorPengaduan = generateNomor();

  showLoading(true);

  const data = {
    ticket: nomorPengaduan,
    nama: namaPengadu,
    sekolah: 'MAN 2 Kediri — ' + document.getElementById('namaKelas').value.trim(),
    kategori: document.getElementById('kategori').value,
    subMasalah: subChecked.join(', ') || '-',
    urgensi: document.querySelector('input[name="urgensi"]:checked').value,
    lokasi: document.getElementById('lokasi').value.trim(),
    deskripsi: document.getElementById('deskripsi').value.trim(),
    photoCount: selectedFiles.length,
    status: 'Belum Ditangani',
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'submit', data: JSON.stringify(data) }).toString(),
    });
  } catch (err) {
    console.warn('Fetch data error:', err);
  }

  showLoading(false);
  showSuccess(nomorPengaduan);
  resetForm();
}

// ============================================================
// HELPERS
// ============================================================
function generateNomor() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MAN2-${date}-${rand}`;
}

function showLoading(show) {
  document.getElementById('loadingOverlay').classList.toggle('hidden', !show);
  document.getElementById('submitBtn').disabled = show;
}

function showSuccess(nomor) {
  document.getElementById('nomorPengaduan').textContent = nomor;
  document.getElementById('successModal').classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => {
    document.getElementById('successModal').classList.add('hidden');
  };
}

function resetForm() {
  document.getElementById('pengaduanForm').reset();
  document.getElementById('subMasalahContainer').classList.add('hidden');
  document.getElementById('subMasalahList').innerHTML = '';
  selectedFiles = [];
  renderPreviews();
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.error-msg').forEach(el => el.classList.add('hidden'));
}
