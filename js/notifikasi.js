import { database } from "../api/firebase_config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
  
//========= NOTIFICATION SCRIPT =========//

const notifContainer = document.getElementById("notifContainer");

// Format Tanggal
function formatTanggal(iso) {
    const date = new Date(iso);
    let jam = date.getHours().toString().padStart(2, "0");
    let menit = date.getMinutes().toString().padStart(2, "0");
    let tgl = date.getDate().toString().padStart(2, "0");
    let bln = (date.getMonth() + 1).toString().padStart(2, "0");
    let thn = date.getFullYear();
    return `${jam}.${menit} &nbsp; ${tgl}/${bln}/${thn}`;
}

// SVG ICON sesuai status
function getIconSVG(cls) {
    if (cls === "success") {
        return `
        <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>`;
    }
    if (cls === "warning") {
        return `
        <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>`;
    }
    if (cls === "error") {
        return `
        <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>`;
    }
    return `
        <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>`;
}

// Map status → class warna + title
function getStatusData(status) {
    if (status === "Sukses") return { cls: "success", label: "Akses Sukses" };
    if (status === "Gagal") return { cls: "warning", label: "Akses Gagal" };
    if (status === "Ilegal") return { cls: "error", label: "Akses Ilegal" };
    return { cls: "system", label: "Sistem" };
}

const aksesRef = ref(database, "riwayat_akses");

onValue(aksesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
        notifContainer.innerHTML = "<p>Tidak ada notifikasi.</p>";
        return;
    }

    const arrayData = Object.values(data);
    arrayData.sort((a, b) => new Date(b.iso_timestamp) - new Date(a.iso_timestamp));

    notifContainer.innerHTML = arrayData
        .map(item => {
            const { cls, label } = getStatusData(item.status_akses);
            const svgIcon = getIconSVG(cls);

            return `
            <div class="notification">
                <div class="notif-left">
                    <div class="icon-circle ${cls}">
                        ${svgIcon}
                    </div>
                    <div class="notif-text">
                        <h3>${label}</h3>
                        <p>${item.idRfid ? `ID Card : ${item.idRfid}` : "Tidak ada ID Card"}</p>
                    </div>
                </div>
                <div class="time">${formatTanggal(item.iso_timestamp)}</div>
            </div>
            `;
        })
        .join("");
});


