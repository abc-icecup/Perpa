import { database } from "../api/firebase_config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
  
const tbody = document.querySelector("tbody");
const riwayatRef = ref(database, "riwayat_akses");

let dataRiwayat = []; // global



onValue(riwayatRef, (snapshot) => {
    tbody.innerHTML = ""; // reset table

    if (!snapshot.exists()) {
        tbody.innerHTML = "<tr><td colspan='7'>Belum ada riwayat.</td></tr>";
        dataRiwayat = []; // kosongkan juga
        return;
    }

    let data = [];

    snapshot.forEach((child) => {
        let item = child.val();

        // --- Pisahkan tanggal & waktu dari iso_timestamp ---
        let tanggal = "-";
        let waktu = "-";

        if (item.iso_timestamp) {
            const dateObj = new Date(item.iso_timestamp);
            
            if (!isNaN(dateObj)) {
                tanggal = dateObj.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                });

                waktu = dateObj.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                });
            }
        }

        data.push({
            id: child.key,
            tanggal,
            waktu,
            idRfid: item.idRfid || "-",
            nama: item.nama || "-",
            kondisi_pintu: item.kondisi_pintu || "-",
            status_kunci: item.status_kunci || "-",
            status_akses: item.status_akses || "-",
            iso_timestamp: item.iso_timestamp || null
        });
    });

    // --- Urutkan berdasarkan iso_timestamp terbaru ---
    data.sort((a, b) => {
        if (!a.iso_timestamp) return 1;
        if (!b.iso_timestamp) return -1;
        return new Date(b.iso_timestamp) - new Date(a.iso_timestamp);
    });

    dataRiwayat = data;  // <--- simpan semua data untuk keperluan export

    // --- Render tabel ---
    data.forEach((item) => {
        tbody.innerHTML += `
        <tr>
            <td>${item.tanggal}</td>
            <td>${item.waktu}</td>
            <td>${item.idRfid}</td>
            <td>${item.nama}</td>
            <td><span class="badge ${classPintu(item.kondisi_pintu)}">${item.kondisi_pintu}</span></td>
            <td><span class="badge ${classKunci(item.status_kunci)}">${item.status_kunci}</span></td>
            <td><span class="status ${classAkses(item.status_akses)}">${iconAkses(item.status_akses)} ${item.status_akses}</span></td>
        </tr>
        `;
    });
});

// ------ Helper CSS Mapping ------
function classPintu(str) {
    return str === "Terbuka" ? "terbuka" : "tertutup";
}

function classKunci(str) {
    return str === "Tidak Terkunci" ? "tidak-terkunci" : "terkunci";
}

function classAkses(str) {
    if (str === "Sukses") return "sukses";
    if (str === "Gagal") return "gagal";
    if (str === "Ilegal") return "ilegal";
    return "sistem";
}

function iconAkses(str) {
    if (str === "Sukses") return "✅";
    if (str === "Gagal") return "⚠️";
    if (str === "Ilegal") return "❗";
    return "⚙️";
}

document.querySelector(".export.pdf").addEventListener("click", () => {
    const dataExport = [...dataRiwayat].reverse(); // urut: lama → baru

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Riwayat Akses Ruangan", 14, 10);

    const rows = dataExport.map(item => [
        item.tanggal,
        item.waktu,
        item.idRfid,
        item.nama,
        item.kondisi_pintu,
        item.status_kunci,
        item.status_akses
    ]);

    doc.autoTable({
        head: [["Tanggal", "Waktu", "ID RFID", "Nama", "Kondisi Pintu", "Status Kunci", "Status Akses"]],
        body: rows,
        startY: 20
    });

    doc.save("riwayat_akses.pdf");
});

document.querySelector(".export.excel").addEventListener("click", () => {
    const dataExport = [...dataRiwayat].reverse(); // urut: lama → baru

    const rows = dataExport.map(item => ({
        Tanggal: item.tanggal,
        Waktu: item.waktu,
        ID_RFID: item.idRfid,
        Nama: item.nama,
        Pintu: item.kondisi_pintu,
        Kunci: item.status_kunci,
        Akses: item.status_akses
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Akses");
    XLSX.writeFile(workbook, "riwayat_akses.xlsx");
});


