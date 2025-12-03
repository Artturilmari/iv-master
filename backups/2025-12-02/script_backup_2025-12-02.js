let projects = JSON.parse(localStorage.getItem('iv_projects')) || [];

let activeProjectId = null;

let editingValveIndex = null;

let returnToVisual = false;

let preSelectedDuctId = null;

let currentPhotoData = null;

let editingMachineIndex = null;

let editingDuctId = null;

let currentMode = 'home';

let signaturePad = null; // Canvas context



projects.forEach(p => {

if (!p.machines) p.machines = []; if (!p.ducts) p.ducts = []; if (!p.valves) p.valves = [];

if (!p.meta) p.meta = {};

if (!p.modes) { p.modes = { home: { machines: JSON.parse(JSON.stringify(p.machines)), valves: JSON.parse(JSON.stringify(p.valves)) }, away: { machines: [], valves: [] }, boost: { machines: [], valves: [] } }; }

});


// --- TÄYDELLINEN VENTTIILIDATA (V60: Ultimate Database) ---

// Nimeämiskäytäntö: "Valmistaja Malli Koko" (automaattinen ryhmittely)

const valveDB = {

// --- HALTON ---

'h_kso100': { name: 'Halton KSO 100', data: [[-15,0.5],[-10,1.0],[-5,1.5],[0,2.0],[5,2.5],[10,3.0]] },

'h_kso125': { name: 'Halton KSO 125', data: [[-15,0.9],[-10,1.4],[-5,2.1],[0,2.8],[5,3.5],[10,4.2]] },

'h_kso160': { name: 'Halton KSO 160', data: [[-10,2.0],[-5,2.9],[0,3.8],[5,4.8],[10,5.9]] },

'h_kso200': { name: 'Halton KSO 200', data: [[0,6.0],[5,7.3],[10,8.7],[15,10.2],[20,11.7]] },


'h_kts100': { name: 'Halton KTS 100', data: [[2,0.9],[4,1.5],[6,2.1],[8,2.7],[10,3.3],[12,3.9]] },

'h_kts125': { name: 'Halton KTS 125', data: [[2,1.0],[4,1.8],[6,2.6],[8,3.4],[10,4.2],[12,5.0]] },

'h_kts160': { name: 'Halton KTS 160', data: [[4,2.2],[6,3.2],[8,4.3],[10,5.3],[12,6.3]] },



'h_urh100': { name: 'Halton URH 100', data: [[-15,1.0],[-10,1.5],[-5,2.1],[0,2.7],[5,3.2],[10,3.7]] },

'h_urh125': { name: 'Halton URH 125', data: [[-15,1.4],[-10,2.0],[-5,2.8],[0,3.5],[5,4.3],[10,5.0]] },

'h_urh160': { name: 'Halton URH 160', data: [[-10,2.5],[-5,3.5],[0,4.5],[5,5.5],[10,6.5]] },

'h_urh200': { name: 'Halton URH 200', data: [[-5,4.0],[0,5.5],[5,6.8],[10,8.2],[15,9.6]] },



'h_ura100': { name: 'Halton URA 100', data: [[-10,1.2],[-5,1.8],[0,2.5],[5,3.1],[10,3.8]] },

'h_ura125': { name: 'Halton URA 125', data: [[-10,1.5],[-5,2.3],[0,3.1],[5,4.0],[10,4.9]] },



'h_tla100': { name: 'Halton TLA 100', data: [[2,1.0],[4,1.7],[6,2.4],[8,3.1],[10,3.8],[12,4.5]] },

'h_tla125': { name: 'Halton TLA 125', data: [[2,1.1],[4,2.0],[6,2.9],[8,3.8],[10,4.7],[12,5.6]] },

'h_tla160': { name: 'Halton TLA 160', data: [[2,1.5],[4,2.5],[6,3.5],[8,4.6],[10,5.7]] },



'h_tld100': { name: 'Halton TLD 100', data: [[2,1.0],[4,1.8],[6,2.6],[8,3.3],[10,4.1]] },

'h_tld125': { name: 'Halton TLD 125', data: [[2,1.1],[4,2.0],[6,2.9],[8,3.9],[10,4.8]] },


'h_ula100': { name: 'Halton ULA 100', data: [[-15,0.7],[-10,1.1],[-5,1.6],[0,2.1],[5,2.6],[10,3.1]] },

'h_ula125': { name: 'Halton ULA 125', data: [[-15,0.8],[-10,1.4],[-5,2.0],[0,2.6],[5,3.2],[10,3.8]] },

'h_ula160': { name: 'Halton ULA 160', data: [[-15,1.5],[-10,2.1],[-5,3.0],[0,4.0],[5,5.2]] },



'h_uko100': { name: 'Halton UKO 100', data: [[2,0.7],[4,1.3],[6,2.0],[8,2.8],[10,3.5]] },

'h_uko125': { name: 'Halton UKO 125', data: [[2,0.9],[4,1.8],[6,2.8],[8,3.9],[10,5.0]] },

'h_uko160': { name: 'Halton UKO 160', data: [[2,1.5],[4,2.5],[6,3.5],[8,4.5],[10,5.5]] },



'h_ksp100': { name: 'Halton KSP (Sauna) 100', data: [[2,0.8],[4,1.5],[6,2.3],[9,3.3]] },



// --- FLÄKT WOODS / ABB FLÄKT ---

'f_kso100': { name: 'Fläkt KSO 100', data: [[-15,0.5],[-10,1.0],[-5,1.4],[0,1.9],[5,2.3],[10,2.8]] },

'f_kso125': { name: 'Fläkt KSO 125', data: [[-10,1.5],[-5,2.1],[0,2.7],[5,3.3],[10,4.0]] },

'f_kso160': { name: 'Fläkt KSO 160', data: [[-10,2.0],[-5,2.9],[0,3.8],[5,4.7],[10,5.7]] },

'f_kso200': { name: 'Fläkt KSO 200', data: [[-5,3.5],[0,5.0],[5,6.5],[10,8.0],[15,9.5]] },



'f_kts100': { name: 'Fläkt KTS 100', data: [[2,0.7],[4,1.2],[6,1.7],[8,2.3],[10,2.8],[12,3.4]] },

'f_kts125': { name: 'Fläkt KTS 125', data: [[2,0.7],[4,1.5],[6,2.2],[8,2.9],[10,3.7],[12,4.5]] },


'f_ksos100': { name: 'Fläkt KSOS 100', data: [[-5,0.6],[0,1.0],[5,1.4],[10,1.8],[15,2.3]] },

'f_ksos125': { name: 'Fläkt KSOS 125', data: [[-5,1.1],[0,1.7],[5,2.3],[10,2.8],[15,3.4]] },



'f_kgeb100': { name: 'Fläkt KGEB 100', data: [[-10,1.0],[-5,1.5],[0,2.1],[5,2.7],[10,3.3]] },

'f_kgeb125': { name: 'Fläkt KGEB 125', data: [[-10,1.4],[-5,2.1],[0,2.9],[5,3.7],[10,4.5]] },

'f_kgeb160': { name: 'Fläkt KGEB 160', data: [[-10,2.0],[-5,3.0],[0,4.0],[5,5.2],[10,6.5]] },



'f_et100': { name: 'Fläkt E-T 100', data: [[2,0.8],[4,1.4],[6,2.0],[8,2.8]] },

'f_et125': { name: 'Fläkt E-T 125', data: [[2,1.0],[4,1.8],[6,2.6],[8,3.6]] },



'f_rk100': { name: 'Fläkt RK 100', data: [[1,0.5],[2,0.9],[3,1.3],[4,1.7],[5,2.1],[6,2.6]] },

'f_rk125': { name: 'Fläkt RK 125', data: [[1,0.7],[2,1.3],[3,2.0],[4,2.7],[5,3.4],[6,4.1]] },



// --- LINDAB ---

'l_ksu100': { name: 'Lindab KSU 100', data: [[-15,0.5],[-10,0.9],[-5,1.4],[0,1.9],[5,2.4]] },

'l_ksu125': { name: 'Lindab KSU 125', data: [[-10,1.4],[-5,2.0],[0,2.6],[5,3.2]] },

'l_ksu160': { name: 'Lindab KSU 160', data: [[-10,2.2],[-5,3.0],[0,3.8],[5,4.8],[10,6.0]] },



'l_ki100': { name: 'Lindab KI 100', data: [[2,0.6],[4,1.2],[6,1.8],[8,2.4],[10,3.0]] },

'l_ki125': { name: 'Lindab KI 125', data: [[2,0.7],[4,1.5],[6,2.3],[8,3.1],[10,3.9]] },


'l_kpf100': { name: 'Lindab KPF 100', data: [[0,1.5],[3,1.7],[6,2.0],[9,2.5]] },

'l_kpf125': { name: 'Lindab KPF 125', data: [[0,2.2],[3,2.6],[6,3.0],[9,3.5]] },



// --- CLIMECON ---

'c_rino100': { name: 'Climecon RINO 100', data: [[2,0.8],[4,1.5],[6,2.2],[8,2.9]] },

'c_rino125': { name: 'Climecon RINO 125', data: [[2,1.0],[4,1.8],[6,2.6],[8,3.5]] },


'c_dinoa': { name: 'Climecon DINO-A 125', data: [[1,0.8],[2,1.6],[3,2.5],[4,3.4],[5,4.5]] }, // Yleismalli

'c_dinot': { name: 'Climecon DINO-T 125', data: [[1,0.7],[2,1.5],[3,2.4],[4,3.5],[5,4.7]] },



'c_vip100': { name: 'Climecon VIP 100', data: [[-15,0.6],[-10,1.2],[-5,1.9],[0,2.7],[5,3.5]] },

'c_vip125': { name: 'Climecon VIP 125', data: [[-15,0.9],[-10,1.5],[-5,2.2],[0,3.0],[5,3.8]] },



'c_elo100': { name: 'Climecon ELO 100', data: [[-10,1.1],[-5,1.7],[0,2.4],[5,3.1]] },

'c_elo125': { name: 'Climecon ELO 125', data: [[-10,1.5],[-5,2.1],[0,2.8],[5,3.6]] },



'c_clik100': { name: 'Climecon CLIK 100', data: [[2,0.8],[4,1.6],[6,2.5],[8,3.4]] },

'c_clik125': { name: 'Climecon CLIK 125', data: [[2,1.0],[4,1.9],[6,2.9],[8,4.0]] },



'c_eco1': { name: 'Climecon ECO-1 125', data: [[1,0.5],[2,1.0],[3,1.6]] },



// --- EH-MUOVI ---

'eh_30_100': { name: 'EH-30 100', data: [[1,0.4],[3,1.2],[5,2.0],[10,3.8]] },

'eh_100': { name: 'EH-100 100', data: [[3,1.0],[6,2.1],[9,3.2],[12,4.3]] },

'eh_125': { name: 'EHUS 125', data: [[3,1.8],[4,2.5],[5,3.2],[10,5.0]] },

'eh_160': { name: 'EHUS 160', data: [[3,2.5],[4,3.5],[5,4.5],[10,7.5]] },



// --- FINCOIL (HISTORICAL) ---

'fin_vta100': { name: 'Fincoil VTA 100', data: [[2,0.8],[4,1.5],[6,2.3],[8,3.0]] },

'fin_vta125': { name: 'Fincoil VTA 125', data: [[2,1.0],[4,1.8],[6,2.7],[8,3.6]] },

'fin_vta160': { name: 'Fincoil VTA 160', data: [[4,2.5],[6,3.5],[8,4.6],[10,5.8]] },

'fin_vs100': { name: 'Fincoil VS 100', data: [[-10,1.2],[-5,1.8],[0,2.4],[5,3.0]] },

'fin_vs125': { name: 'Fincoil VS 125', data: [[-10,1.6],[-5,2.3],[0,3.1],[5,3.9]] },

'fin_vk100': { name: 'Fincoil VK 100', data: [[-10,1.1],[-5,1.7],[0,2.3],[5,2.9]] },

'fin_vk125': { name: 'Fincoil VK 125', data: [[-10,1.5],[-5,2.2],[0,3.0],[5,3.8]] },



// --- LAPINLEIMU (HISTORICAL) ---

'll_kilsa100': { name: 'Lapinleimu Kilsa 100', data: [[-5,0.5],[0,1.0],[5,1.5],[10,2.0]] },

'll_kilsa125': { name: 'Lapinleimu Kilsa 125', data: [[-5,0.8],[0,1.5],[5,2.2],[10,3.0]] },

'll_oso100': { name: 'Lapinleimu OSO 100', data: [[-12,0.8],[-9,1.1],[-6,1.4],[-3,1.7],[0,2.0],[6,2.6]] },

'll_oso125': { name: 'Lapinleimu OSO 125', data: [[-12,1.2],[-9,1.6],[-6,2.0],[-3,2.4],[0,2.8],[6,3.6]] },

'll_otp100': { name: 'Lapinleimu OTP 100', data: [[3,1.0],[6,1.9],[9,2.8],[12,3.7]] },

'll_otp125': { name: 'Lapinleimu OTP 125', data: [[3,1.2],[6,2.3],[9,3.4],[12,4.5]] },



// --- RCL / RC-LINJA ---

'rcl_oki100': { name: 'RCL OKI 100', data: [[2,0.8],[4,1.4],[6,2.1],[8,2.8],[10,3.6]] },

'rcl_oki125': { name: 'RCL OKI 125', data: [[2,0.9],[4,1.7],[6,2.6],[8,3.6],[10,4.6]] },

'rcl_elo100': { name: 'RCL ELO 100', data: [[-15,0.6],[-10,1.1],[-5,1.6],[0,2.2],[5,2.8]] },

'rcl_elo125': { name: 'RCL ELO 125', data: [[-15,1.0],[-10,1.6],[-5,2.3],[0,3.0],[5,3.7]] },



// --- SWEGON ---

's_colibri_w': { name: 'Swegon COLIBRI Wall 125', data: [[2,0.8],[4,1.5],[6,2.3],[8,3.1]] },

's_colibri_c': { name: 'Swegon COLIBRI Ceiling 125', data: [[2,1.1],[4,2.1],[6,3.2],[8,4.3]] },

's_eagle_w': { name: 'Swegon EAGLE Wall 125', data: [[2,0.9],[4,1.7],[6,2.6],[8,3.5]] },

's_eagle_c': { name: 'Swegon EAGLE Ceiling 125', data: [[2,1.2],[4,2.3],[6,3.5],[8,4.8]] },



// --- HEATCO ---

'heat_hti100': { name: 'Heatco HTI 100', data: [[2,0.92],[4,1.63],[6,2.34],[9,3.40],[12,4.45]] },

'heat_hti125': { name: 'Heatco HTI 125', data: [[2,1.02],[4,1.92],[6,2.81],[9,4.16],[12,5.50]] },

'heat_hpi100': { name: 'Heatco HPI 100', data: [[-12,0.90],[-6,1.60],[0,2.35],[6,3.10]] },

'heat_hpi125': { name: 'Heatco HPI 125', data: [[-12,1.10],[-6,1.85],[0,2.60],[6,3.40]] },



// --- SÄÄTÖPELLIT (IRIS & SPM & DRU) ---

'iris80': { name: 'IRIS-Pelti 80', data: [[1,6.1],[2,4.1],[3,3.2],[4,2.3],[5,1.4],[6,0.9],[7,0.6]] },

'iris100': { name: 'IRIS-Pelti 100', data: [[1,1.9],[1.5,2.4],[2,3.2],[2.5,4.0],[3,4.8],[3.5,6.1],[4,7.5],[4.5,9.2],[5,11.0],[5.5,13.3],[6,16.0],[6.5,19.5],[7,24.0],[7.5,28.0],[8,33.0]] },

'iris125': { name: 'IRIS-Pelti 125', data: [[1,2.5],[1.5,3.3],[2,4.2],[2.5,5.5],[3,7.0],[3.5,9.0],[4,11.5],[4.5,13.8],[5,16.5],[5.5,19.8],[6,23.5],[6.5,28.0],[7,33.5],[7.5,40.5],[8,49.0]] },

'iris160': { name: 'IRIS-Pelti 160', data: [[1,3.6],[1.5,4.9],[2,6.5],[2.5,8.5],[3,11.0],[3.5,14.0],[4,17.5],[4.5,21.0],[5,25.5],[5.5,30.5],[6,36.5],[6.5,43.0],[7,51.0],[7.5,62.0],[8,75.0]] },

'iris200': { name: 'IRIS-Pelti 200', data: [[1,7.3],[1.5,9.8],[2,12.5],[2.5,15.1],[3,18.0],[3.5,21.8],[4,26.0],[4.5,30.8],[5,36.5],[5.5,42.5],[6,50.0],[6.5,58.0],[7,68.0],[7.5,77.5],[8,89.0]] },

'iris250': { name: 'IRIS-Pelti 250', data: [[1,11.5],[2,20.5],[3,29.5],[4,41.5],[5,59.5],[6,84.5],[7,118.0],[8,160.0]] },

'iris315': { name: 'IRIS-Pelti 315', data: [[1,19.0],[2,33.0],[3,47.0],[4,63.5],[5,87.0],[6,116.0],[7,160.0],[8,215.0]] },

'iris400': { name: 'IRIS-Pelti 400', data: [[1,30.0],[2,52.0],[3,76.0],[4,103.0],[5,137.0],[6,182.0],[7,252.0],[8,330.0]] },

'iris500': { name: 'IRIS-Pelti 500', data: [[1,32.0],[2,63.0],[3,95.0],[4,135.0],[5,190.0],[6,260.0],[7,370.0],[8,520.0]] },

'iris630': { name: 'IRIS-Pelti 630', data: [[1,50.0],[2,95.0],[3,145.0],[4,210.0],[5,285.0],[6,385.0],[7,525.0],[8,735.0]] },

'iris800': { name: 'IRIS-Pelti 800', data: [[1,85.0],[2,150.0],[3,225.0],[4,310.0],[5,430.0],[6,590.0],[7,850.0],[8,1180.0]] },


'spm160': { name: 'SPM Mittauspelti 160', data: [[1,3.5],[2,6.1],[3,10.2],[4,16.8],[5,24.0],[6,35.0],[7,49.0],[8,72.0]] },

'spm200': { name: 'SPM Mittauspelti 200', data: [[1,7.0],[2,12.0],[3,17.5],[4,25.5],[5,36.0],[6,49.0],[7,66.0],[8,87.0]] },



'dru100': { name: 'Lindab DRU 100', data: [[1,2.0],[2,4.0],[3,7.0],[4,11.0],[5,16.0]] },

'dru125': { name: 'Lindab DRU 125', data: [[1,2.5],[2,5.0],[3,8.5],[4,13.0],[5,19.0]] },

'dru160': { name: 'Lindab DRU 160', data: [[1,3.5],[2,6.5],[3,11.0],[4,17.0],[5,26.0]] },

};



// --- NEW LOGIC FOR SPLIT SELECTION ---

let valveGroups = {}; // Stores { "Halton KSO": [{size:100, id:'kso100'}, ...] }

let valveIdToModelId = {}; // Stores { 'kso100': 'Halton KSO' }



function initValveSelectors() {

valveGroups = {};

valveIdToModelId = {};


// Group by name pattern

for (let key in valveDB) {

let name = valveDB[key].name;

// Simple regex to split Name and Size (digits at end)

let match = name.match(/^(.*?)[\s-]*(\d+)(.*)$/);


let modelName = name;

let size = "-";



if (match) {

modelName = match[1].trim(); // "Halton KSO"

size = match[2] + match[3]; // "100" or "100h"

if(modelName.endsWith("-")) modelName = modelName.slice(0,-1);

}



if (!valveGroups[modelName]) valveGroups[modelName] = [];

valveGroups[modelName].push({ id: key, size: size, sortSize: parseInt(match ? match[2] : 0) });

valveIdToModelId[key] = modelName;

}



// Populate Model Select

const modelSelect = document.getElementById('valveModelSelect');

modelSelect.innerHTML = '<option value="">-- Valitse Malli --</option>';


let sortedModels = Object.keys(valveGroups).sort();

sortedModels.forEach(model => {

modelSelect.innerHTML += `<option value="${model}">${model}</option>`;

});

}



// --- UUSI LOGIIKKA (LIVE TAULUKKO & ARVO) ---



function updateSizeSelect() {

const model = document.getElementById('valveModelSelect').value;

const sizeSelect = document.getElementById('valveSizeSelect');

sizeSelect.innerHTML = '<option value="">-- Koko --</option>';



if (model && valveGroups[model]) {

let sizes = valveGroups[model].sort((a,b) => a.sortSize - b.sortSize);

sizes.forEach(item => {

sizeSelect.innerHTML += `<option value="${item.id}">${item.size}</option>`;

});



// Valitaan automaattisesti ensimmäinen

if (sizes.length > 0) {

sizeSelect.value = sizes[0].id;

document.getElementById('valveType').value = sizes[0].id;

}



// Näytetään taulukko ja päivitetään arvo

renderValveReference(model);

updateLiveK();

} else {

document.getElementById('valveReferenceTable').style.display = 'none';

document.getElementById('liveKValue').innerText = "";

}

}



function finalizeValveSelection() {

const val = document.getElementById('valveSizeSelect').value;

document.getElementById('valveType').value = val;

updateLiveK();

}



function updateLiveK() {

const type = document.getElementById('valveType').value;

const posStr = document.getElementById('currentPos').value;

const display = document.getElementById('liveKValue');


if (!valveDB[type]) {

display.innerText = "";

return;

}



if (posStr === "") {

display.innerHTML = `<span style="color:#888; font-size:12px;">(Valittu: ${valveDB[type].name})</span>`;

return;

}



const pos = parseFloat(posStr);

const k = getK(type, pos);

display.innerHTML = `K-arvo: <span style="font-size:22px; color:#0066cc; font-weight:bold;">${k.toFixed(2)}</span>`;

}



function renderValveReference(model) {

const container = document.getElementById('valveReferenceTable');

if (!model || !valveGroups[model]) {

container.style.display = 'none';

return;

}



let html = `<strong>${model} - K-kertoimet</strong><br>`;

const sortedSizes = valveGroups[model].sort((a,b) => a.sortSize - b.sortSize);



sortedSizes.forEach(item => {

const dbEntry = valveDB[item.id];

if (dbEntry && dbEntry.data) {

const valString = dbEntry.data.map(d =>

`<span style="white-space:nowrap; margin-right:6px;"><b>${d[0]}</b>=${d[1]}</span>`

).join(' ');

html += `<div style="margin-top:4px; border-bottom:1px solid #e0e0aa; padding-bottom:2px;">

<span style="color:#0066cc; font-weight:bold;">Ø${item.size}:</span> ${valString}

</div>`;

}

});



container.innerHTML = html;

container.style.display = 'block';

}

// Hook into existing code

// Need to run init once

setTimeout(initValveSelectors, 500);



// --- NAVIGAATIO ---

function showView(viewId) {

document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

document.getElementById(viewId).classList.add('active');

const backBtn = document.getElementById('backBtn');

if (viewId === 'view-projects') { backBtn.style.display = 'none'; renderProjects(); }

else {

backBtn.style.display = 'block';

if (viewId === 'view-visual') backBtn.onclick = () => showView('view-details');

else if (viewId === 'view-measure' || viewId === 'view-settings' || viewId === 'view-report' || viewId === 'view-optimize' || viewId === 'view-add-duct' || viewId === 'view-balance') backBtn.onclick = () => returnToVisual ? showView('view-visual') : showView('view-details');

else backBtn.onclick = () => showView('view-projects');

}

if (viewId === 'view-details') { calcSFP(); }

if (viewId === 'view-visual') setTimeout(drawPipes, 100);

if (viewId === 'view-report') initSignaturePad();

}

function showVisual() {
    const p = projects.find(x => x.id === activeProjectId);
    if(!p) return;

    const hasRoof = (p.systemType === 'roof') || (p.machines && p.machines.some(m => m.type === 'roof_fan'));
    const btns = document.getElementById('visModeButtons');
    if (hasRoof) {
        window.activeVisMode = 'vertical';
    } else {
        window.activeVisMode = 'horizontal';
    }
    if (btns) btns.style.display = hasRoof ? 'flex' : 'none';

    renderVisualContent();
    showView('view-visual');
}


function calcVelocity(flow, size) {

if(!flow || !size) return 0;

const q = flow / 1000; const r = (size / 2) / 1000; const a = Math.PI * r * r; return (q / a).toFixed(1);

}

function getVelColor(v) { if(v < 6) return 'v-green'; if(v < 9) return 'v-yellow'; return 'v-red'; }

function calcFanLaw() { const hz = parseFloat(document.getElementById('fanHz').value); const q1 = parseFloat(document.getElementById('fanQ').value); const q2 = parseFloat(document.getElementById('fanTarg').value); if(hz && q1 && q2) { const newHz = (q2/q1) * hz; document.getElementById('fanResult').innerText = `Uusi asetus: ${newHz.toFixed(1)}`; } }


// --- TILOJEN HALLINTA & KOPIOINTI ---

function setMode(mode) {

const p = projects.find(x => x.id === activeProjectId);

p.modes[currentMode].machines = JSON.parse(JSON.stringify(p.machines));

p.modes[currentMode].valves = JSON.parse(JSON.stringify(p.valves));

currentMode = mode;

if (!p.modes[mode] || !p.modes[mode].valves.length === 0) {

const baseValves = JSON.parse(JSON.stringify(p.modes['home'].valves || []));

baseValves.forEach(v => { v.flow = 0; v.measuredP = 0; });

const baseMachines = JSON.parse(JSON.stringify(p.modes['home'].machines || []));

baseMachines.forEach(m => { m.speed = ""; m.supPct = ""; m.extPct = ""; m.supQ = ""; m.extQ = ""; });

p.modes[mode] = { machines: baseMachines, valves: baseValves };

}

p.machines = p.modes[mode].machines;

p.valves = p.modes[mode].valves;

document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));

const btnId = mode === 'home' ? 'btnModeHome' : (mode === 'away' ? 'btnModeAway' : 'btnModeBoost');

document.getElementById(btnId).classList.add('active');

saveData(); renderDetailsList();

}

function copyModeData(targetMode) {

if(targetMode === currentMode) return;

if(confirm(`Haluatko varmasti kopioida nykyiset (mitatut) arvot tilaan "${targetMode}"?`)) {

const p = projects.find(x => x.id === activeProjectId);

p.modes[targetMode].valves = JSON.parse(JSON.stringify(p.valves));

p.modes[targetMode].machines = JSON.parse(JSON.stringify(p.machines));

saveData(); alert(`Tiedot kopioitu tilaan: ${targetMode}`);

}

}


function createDemoProject() {
    console.log('createDemoProject called');
    const p = {
        id: Date.now(),
        name: "Esimerkki (120m2)",
        machines: [{ name: "Vallox 145 MV", speed: "3", supPct: 55, extPct: 60, supQ: 65, extQ: 70 }],
        ducts: [{ id: 1, type: 'supply', name: 'Tulo Runko', flow: 0, size: 160 }, { id: 2, type: 'extract', name: 'Poisto Runko', flow: 0, size: 160 }],
        valves: [
            { room: "Olohuone", apartment: "A1", type: "h_kts125", target: 20, flow: 12.5, pos: 2, parentDuctId: 1 },
            { room: "MH (Vanhemmat)", apartment: "A1", type: "h_kts100", target: 12, flow: 18.0, pos: 5, parentDuctId: 1 },
            { room: "Eteinen", apartment: "A1", type: "h_kts100", target: 10, flow: 16.0, pos: 6, parentDuctId: 1 },
            { room: "Olohuone", apartment: "B2", type: "h_kts100", target: 15, flow: 14.2, pos: 3, parentDuctId: 1 },
            { room: "MH (Lapset)", apartment: "B2", type: "h_kts100", target: 12, flow: 12.1, pos: 3, parentDuctId: 1 },
            { room: "Eteinen", apartment: "B2", type: "h_kts100", target: 10, flow: 9.8, pos: 2, parentDuctId: 1 },
            { room: "Keittiö", apartment: "A1", type: "h_kso125", target: 25, flow: 18.0, pos: 2, parentDuctId: 2 },
            { room: "WC", apartment: "A1", type: "h_kso100", target: 15, flow: 15.2, pos: 3, parentDuctId: 2 },
            { room: "Sauna", apartment: "A1", type: "h_ksp100", target: 8, flow: 4.0, pos: 1, parentDuctId: 2 },
            { room: "Keittiö", apartment: "B2", type: "h_kso125", target: 25, flow: 20.5, pos: 3, parentDuctId: 2 },
            { room: "WC", apartment: "B2", type: "h_kso100", target: 15, flow: 14.8, pos: 3, parentDuctId: 2 },
            { room: "Kodinhoitohuone", apartment: "B2", type: "h_kso100", target: 10, flow: 9.9, pos: 2, parentDuctId: 2 }
        ],
        pressures: [
            { name: "Ulko-ovi", val: -8 },
            { name: "Postiluukku", val: -5 }
        ],
        meta: {},
        modes: { home: {}, away: {}, boost: {} }
    };
    // Varmistetaan modes-rakenne
    p.modes.home = { machines: JSON.parse(JSON.stringify(p.machines)), valves: JSON.parse(JSON.stringify(p.valves)) };
    p.modes.away = { machines: [], valves: [] };
    p.modes.boost = { machines: [], valves: [] };
    projects.push(p);
    saveData();
    renderProjects();
    openProject(p.id);
    alert("Laaja Demo luotu!");
}

function confirmCreateProject() {
    console.log('confirmCreateProject called');
    const name = document.getElementById('newProjName').value;
    const type = document.getElementById('newProjType').value;
    if (!name) {
        alert("Anna projektille nimi!");
        return;
    }
    const newId = Date.now();
    const p = {
        id: newId,
        name: name,
        systemType: type,
        machines: [],
        ducts: [],
        valves: [],
        meta: {},
        modes: { home:{machines:[],valves:[]}, away:{machines:[],valves:[]}, boost:{machines:[],valves:[]} }
    };
    // Lisää rungot automaattisesti tyypin mukaan
    if(type === 'ahu') {
        p.ducts.push({ id: 2, name: "Tulo", type: "supply", size: 125 });
        p.ducts.push({ id: 3, name: "Poisto", type: "extract", size: 125 });
    }
    if(type === 'roof') {
        p.ducts.push({ id: 3, name: "Poisto", type: "extract", size: 125 });
    }
    if(type === 'hybrid') {
        p.ducts.push({ id: 2, name: "Tulo", type: "supply", size: 125 });
        p.ducts.push({ id: 3, name: "Poisto", type: "extract", size: 125 });
    }
    projects.push(p);
    saveData();
    closeModal();
    renderProjects();
    openProject(newId);
}

function renderProjects() {
    const list = document.getElementById('projectsList');
    if (!list) return;
    list.innerHTML = projects.map(p => `<div class="list-item" onclick="openProject(${p.id})"><b>${p.name}</b></div>`).join('');
    const noMsg = document.getElementById('noProjectsMsg');
    if (noMsg) noMsg.style.display = projects.length ? 'none' : 'block';
}

function openProject(id) {
    activeProjectId = id;
    const p = projects.find(x => x.id === id);
    if (!p) return;
    document.getElementById('currentProjectName').innerText = p.name;
    renderDetailsList();
    showView('view-details');
}

function renderDetailsList() {
    // Tämä funktio päivittää projektin tiedot näkymään
    const p = projects.find(x => x.id === activeProjectId);
    if (!p) return;
    document.getElementById('currentProjectName').innerText = p.name || '';
    // Päivitä koneet, kanavat, venttiilit, paine-erot jne. (voit laajentaa tätä tarpeen mukaan)
    // Esimerkki: Tyhjennä listat
    if (document.getElementById('machineList')) document.getElementById('machineList').innerHTML = '';
    if (document.getElementById('ductList')) document.getElementById('ductList').innerHTML = '';
    if (document.getElementById('valveList')) document.getElementById('valveList').innerHTML = '';
    if (document.getElementById('pressureList')) document.getElementById('pressureList').innerHTML = '';
    // Lisää haluttu renderöinti tähän
}

function duplicateValve(index, e) { e.stopPropagation(); const count = prompt("Montako kopiota luodaan?", "1"); if(count && !isNaN(count)) { const p = projects.find(x => x.id === activeProjectId); const original = p.valves[index]; for(let i=0; i<parseInt(count); i++) { const copy = JSON.parse(JSON.stringify(original)); const numMatch = copy.room.match(/\d+$/); if(numMatch) { const nextNum = parseInt(numMatch[0]) + 1 + i; copy.room = copy.room.replace(/\d+$/, nextNum); } else { copy.room += ` (kopio ${i+1})`; } p.valves.push(copy); } saveData(); renderDetailsList(); } }

function previewPhoto() { const file = document.getElementById('valvePhotoInput').files[0]; const preview = document.getElementById('valvePhotoPreview'); if (file) { const reader = new FileReader(); reader.onloadend = function() { const img = new Image(); img.src = reader.result; img.onload = function() { const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const MAX_WIDTH = 300; const scaleSize = MAX_WIDTH / img.width; canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize; ctx.drawImage(img, 0, 0, canvas.width, canvas.height); currentPhotoData = canvas.toDataURL('image/jpeg', 0.7); preview.src = currentPhotoData; preview.style.display = 'block'; } }; reader.readAsDataURL(file); } else { preview.src = ""; preview.style.display = 'none'; currentPhotoData = null; } }

function loadBackground(input) { const file = input.files[0]; if(file) { const reader = new FileReader(); reader.onload = function(e) { document.getElementById('view-visual').style.backgroundImage = `url('${e.target.result}')`; }; reader.readAsDataURL(file); } }

function calcSFP() { const p = projects.find(x => x.id === activeProjectId); let sFlow = 0, eFlow = 0; p.valves.forEach(v => { const d = p.ducts.find(d=>d.id==v.parentDuctId); if(d && d.type === 'supply') sFlow += v.flow; else eFlow += v.flow; }); const maxFlow = Math.max(sFlow, eFlow); const pow = (parseFloat(p.meta.powerSup)||0) + (parseFloat(p.meta.powerExt)||0); let sfp = "-"; if(maxFlow > 0 && pow > 0) { sfp = ( (pow/1000) / (maxFlow/1000) ).toFixed(2); } document.getElementById('sfpDisplay').innerText = `SFP: ${sfp} (Tulo: ${sFlow.toFixed(0)}, Poisto: ${eFlow.toFixed(0)})`; }

// --- LOGO HANDLING ---

function handleLogoUpload() {

const file = document.getElementById('logoUpload').files[0];

if(file) {

const reader = new FileReader();

reader.onloadend = function() {

const p = projects.find(x => x.id === activeProjectId);

p.meta.logo = reader.result;

saveData();

document.getElementById('settingsLogoPreview').src = p.meta.logo;

document.getElementById('settingsLogoPreview').style.display = 'block';

}

reader.readAsDataURL(file);

}

}


function showSettings() {

const p = projects.find(x => x.id === activeProjectId);

document.getElementById('setMeasurer').value = p.meta.measurer || '';

document.getElementById('setPowerSup').value = p.meta.powerSup || '';

document.getElementById('setPowerExt').value = p.meta.powerExt || '';

document.getElementById('chkSwept').checked = p.meta.swept || false;

document.getElementById('chkBearSup').checked = p.meta.bearSup || false;

document.getElementById('chkBearExt').checked = p.meta.bearExt || false;


if(p.meta.logo) {

document.getElementById('settingsLogoPreview').src = p.meta.logo;

document.getElementById('settingsLogoPreview').style.display = 'block';

} else {

document.getElementById('settingsLogoPreview').style.display = 'none';

}

showView('view-settings');

}

function saveSettings() {
    const p = projects.find(x => x.id === activeProjectId);
    p.meta.measurer = document.getElementById('setMeasurer').value;
    p.meta.powerSup = document.getElementById('setPowerSup').value;
    p.meta.powerExt = document.getElementById('setPowerExt').value;
    p.meta.swept = document.getElementById('chkSwept').checked;
    p.meta.bearSup = document.getElementById('chkBearSup').checked;
    p.meta.bearExt = document.getElementById('chkBearExt').checked;
    saveData();
    showView('view-details');
}

function addDuctFromVisual(type) { const p = projects.find(x => x.id === activeProjectId); const count = p.ducts.filter(d => d.type === type).length + 1; const prefix = type === 'supply' ? 'Tulo' : 'Poisto'; p.ducts.push({ id: Date.now(), type, name: `${prefix} ${count}`, flow: 0, size: 125 }); saveData(); renderVisualDOM(); drawPipes(); }

function deleteDuctFromVisual(id, e) { if(e) e.stopPropagation(); if(confirm("Poistetaanko runko?")) { const p = projects.find(x => x.id === activeProjectId); p.ducts = p.ducts.filter(d => d.id != id); p.valves = p.valves.filter(v => v.parentDuctId != id); saveData(); renderVisualContent(); } }
// --- PAINE-ERO LOGIIKKA ---
function showPressureMeasure() {
    document.getElementById('pressureName').value = "";
    document.getElementById('pressureValue').value = "";
    showView('view-pressure');
}

function savePressureDiff() {
    const p = projects.find(x => x.id === activeProjectId);
    const name = document.getElementById('pressureName').value || "Paine-ero";
    const val = document.getElementById('pressureValue').value;
    
    if (!val) return alert("Syötä arvo!");

    // Varmistetaan että lista on olemassa
    if (!p.pressures) p.pressures = [];

    p.pressures.push({
        name: name,
        val: parseFloat(val)
    });

    saveData();
    showView('view-details');
    renderDetailsList();
}

function deletePressure(i) {
    if(confirm("Poista?")) {
        const p = projects.find(x => x.id === activeProjectId);
        p.pressures.splice(i, 1);
        saveData();
        renderDetailsList();
    }
}

function optimizeEnergy() {

const p = projects.find(x => x.id === activeProjectId);

if(!p.valves.length) return alert("Ei venttiileitä optimoitavaksi!");

let worstRatioSup = 2, worstValveSup = null;

let worstRatioExt = 2, worstValveExt = null;

p.valves.forEach(v => {

if(v.target > 0) {

const duct = p.ducts.find(d => d.id == v.parentDuctId);

const ratio = v.flow / v.target;

if (duct && duct.type === 'supply') { if (ratio < worstRatioSup) { worstRatioSup = ratio; worstValveSup = v; } }

else if (duct && duct.type === 'extract') { if (ratio < worstRatioExt) { worstRatioExt = ratio; worstValveExt = v; } }

}

});

if(worstValveSup) alert(`Huonoin SFP (Tulo): ${worstValveSup.room} (Suhde: ${(worstRatioSup*100).toFixed(0)}%)`);

if(worstValveExt) alert(`Huonoin SFP (Poisto): ${worstValveExt.room} (Suhde: ${(worstRatioExt*100).toFixed(0)}%)`);

}

// --- KORJATTU RUNKOKANAVAN LISÄYS ---
function showAddDuct() { 
    editingDuctId = null; 
    document.getElementById('ductName').value = ""; 
    showView('view-add-duct'); 
}

function saveDuct() { 
    const p = projects.find(x => x.id === activeProjectId);
    if (!p) return;
    if (!p.ducts) p.ducts = [];
    const nameVal = document.getElementById('ductName').value;
    const typeVal = document.getElementById('ductType').value;
    const sizeVal = document.getElementById('ductSize').value;
    if (!nameVal) {
        alert("Anna rungolle nimi!");
        return;
    }
    const newDuct = { 
         id: Date.now(), 
         name: nameVal, 
         type: typeVal, 
         size: sizeVal 
    };
    p.ducts.push(newDuct);
    saveData(); 
    showView('view-details'); 
    renderDetailsList(); 
}

// --- MODAL HANDLING FOR PROJECT CREATION ---
function showNewProjectModal() {
    document.getElementById('newProjectModal').style.display = 'flex';
}
function closeModal() {
    document.getElementById('newProjectModal').style.display = 'none';
    // Tyhjennä kentät
    document.getElementById('newProjName').value = '';
    document.getElementById('newProjType').value = 'ahu';
}

function saveData() {
    localStorage.setItem('iv_projects', JSON.stringify(projects));
}

function renderVisualContent() {
    // Etsitään piirtoalue (tuki V62 ja V80 ID:lle)
    let container = document.getElementById('visContent');
    if (!container) {
        container = document.getElementById('schematicRoot');
        if (!container) return;
        container.innerHTML = '<div id="visContent"></div>';
        container = document.getElementById('visContent');
    }
    container.innerHTML = "";
    container.style.padding = "50px";

    const p = projects.find(x => x.id === activeProjectId);
    if (!p) return;

    const mode = window.activeVisMode || 'vertical';
    if (mode === 'vertical') {
        // Use the new CSS-based renderer
        return renderVerticalStackInto(container, p);
    } else {
        // New AHU schematic horizontal map
        renderHorizontalMap(container);
    }
}

// Dedicated vertical renderer using CSS classes
function renderVerticalStackInto(container, p) {
    const ducts = p.ducts || [];
    const valves = p.valves || [];
    const shafts = ducts.filter(d => d.type === 'extract');
    if (shafts.length === 0) {
        container.innerHTML = "<div style='color:#666; font-size:14px;'>Ei poistokanavia.<br>Luo 'Runkokanava' (esim. A-Rappu Poisto) nähdäksesi tornin.</div>";
        container.style.display = 'block';
        return;
    }

    // Varmistetaan pääalueen asettelu
    container.style.display = 'flex';
    container.innerHTML = '';

    const APTS_PER_FLOOR = 3;

    shafts.forEach(shaft => {
        // Torni
        const tower = document.createElement('div');
        tower.className = 'vis-tower';

        // Huippuimuri katolle
        const roofUnit = document.createElement('div');
        roofUnit.className = 'vis-roof-unit';
        roofUnit.innerHTML = `<div style="font-size:20px;">⚙️</div><b>${shaft.name}</b>`;
        tower.appendChild(roofUnit);

        // Pystyhormi
        const pipe = document.createElement('div');
        pipe.className = 'vis-shaft-line';
        tower.appendChild(pipe);

        // Kerrossäiliö alhaalta ylös (CSS column-reverse)
        const floorsContainer = document.createElement('div');
        floorsContainer.className = 'vis-floors-container';

        // Haetaan ja ryhmitellään asunnot
        const shaftValves = valves.filter(v => v.parentDuctId == shaft.id);
        if (shaftValves.length > 0) {
            const aptGroups = {};
            shaftValves.forEach(v => {
                const apt = v.apartment || 'Muu';
                if (!aptGroups[apt]) aptGroups[apt] = { totalQ: 0, targetQ: 0 };
                aptGroups[apt].totalQ += (parseFloat(v.flow) || 0);
                aptGroups[apt].targetQ += (parseFloat(v.target) || 0);
            });
            // Järjestys: A1, A2, ... (numeric localeCompare)
            const sortedApts = Object.keys(aptGroups).sort((a,b)=>a.localeCompare(b, undefined, { numeric:true, sensitivity:'base' }));
            // Jaetaan kerroksiin
            for (let i=0; i<sortedApts.length; i+=APTS_PER_FLOOR) {
                const floorDiv = document.createElement('div');
                floorDiv.className = 'vis-floor';
                const chunk = sortedApts.slice(i, i+APTS_PER_FLOOR);
                chunk.forEach(apt => {
                    const data = aptGroups[apt];
                    const diff = Math.abs(data.totalQ - data.targetQ);
                    const ok = (data.targetQ > 0 && diff < data.targetQ * 0.15);
                    const box = document.createElement('div');
                    box.className = `vis-apt ${ok ? 'vis-status-ok' : 'vis-status-err'}`;
                    box.innerHTML = `<b>${apt}</b><br>${data.totalQ.toFixed(1)} / ${data.targetQ.toFixed(1)}`;
                    box.onclick = () => { if (typeof openAptModal === 'function') openAptModal(apt); };
                    floorDiv.appendChild(box);
                });
                floorsContainer.appendChild(floorDiv);
            }
        }
        tower.appendChild(floorsContainer);
        container.appendChild(tower);
    });
}

                // --- UUSI VAAKANÄKYMÄ (Hieno IV-Kaavio) ---
                function renderHorizontalMap(container) {
                    const p = projects.find(x => x.id === activeProjectId);
                    if (!p) { container.innerHTML = ''; return; }
                    const ahu = (p.machines || []).find(m => m.type === 'ahu') || {name: (p.machines && p.machines[0]?.name) || 'IV-Kone', supPct: (p.machines && p.machines[0]?.supPct) };
                    const supplies = (p.ducts || []).filter(d => d.type === 'supply');
                    const extracts = (p.ducts || []).filter(d => d.type === 'extract');

                    let html = `<div class="ahu-layout">`;
                    html += `<div class="ahu-unit" onclick="editMachine(0)">
                                <div style="font-size:20px;">⚙️</div>
                                <b>${ahu.name || 'IV-Kone'}</b>
                                <div style="font-size:10px; margin-top:5px;">Tulo: ${ahu.supPct || 0}%</div>
                             </div>`;
                          html += `<div class="ahu-manifold">`;
                          // Order toggle bar (global for both areas)
                          html += `<div class="ahu-orderbar">
                                          <button class="btn-order" onclick="toggleValveOrder()">Järjestys: ${getValveOrderLabel()}</button>
                                      </div>`;
                    html += `<div class="ahu-area">
                                <div class="ahu-area-title">Tulo</div>
                                <div class="ahu-header supply">
                                    <div class="line"></div>
                                    <span class="flow-arrow flow-blue flow-right" style="top:9px; left:20px;"></span>
                                    <span class="flow-arrow flow-blue flow-right" style="top:9px; left:90px;"></span>
                                    <span class="flow-arrow flow-blue flow-right" style="top:9px; left:160px;"></span>
                                </div>
                                <div class="ahu-vertical up"></div>
                                <div class="ahu-branch-wrap">${supplies.map(d => createBranchHTML(p, d, 'blue')).join('')}
                                ${supplies.length === 0 ? '<div style="padding:10px; color:#999; font-size:11px;">Ei tulokanavia</div>' : ''}
                                </div>
                             </div>`;
                    html += `<div class="ahu-area">
                                <div class="ahu-area-title">Poisto</div>
                                <div class="ahu-header extract">
                                    <div class="line"></div>
                                    <span class="flow-arrow flow-red flow-left" style="top:9px; left:200px;"></span>
                                    <span class="flow-arrow flow-red flow-left" style="top:9px; left:130px;"></span>
                                    <span class="flow-arrow flow-red flow-left" style="top:9px; left:60px;"></span>
                                </div>
                                <div class="ahu-vertical down"></div>
                                <div class="ahu-branch-wrap">${extracts.map(d => createBranchHTML(p, d, 'red')).join('')}
                                ${extracts.length === 0 ? '<div style="padding:10px; color:#999; font-size:11px;">Ei poistokanavia</div>' : ''}
                                </div>
                             </div>`;
                    html += `</div>`; // manifold
                    html += `</div>`; // layout

                    container.innerHTML = html;
                }

                // Apufunktio haaran piirtämiseen
                function createBranchHTML(p, duct, colorName) {
                    let valves = (p.valves || []).filter(v => v.parentDuctId == duct.id);
                    // Sort valves by current mode
                    const mode = window._valveSortKey || 'apt';
                    valves = valves.slice().sort((a,b)=>{
                        if (mode === 'apt') {
                            const ax = (a.apartment||''); const bx = (b.apartment||'');
                            const an = parseInt(ax.replace(/[^0-9]/g,''),10)||0; const bn = parseInt(bx.replace(/[^0-9]/g,''),10)||0;
                            const al = (ax.match(/^[A-Za-z]+/)||[''])[0]; const bl = (bx.match(/^[A-Za-z]+/)||[''])[0];
                            return al.localeCompare(bl) || an - bn;
                        } else if (mode === 'room') {
                            return (a.room||'').localeCompare(b.room||'');
                        } else if (mode === 'flow') {
                            return (parseFloat(a.flow)||0) - (parseFloat(b.flow)||0);
                        } else if (mode === 'pos') {
                            return (parseFloat(a.pos)||0) - (parseFloat(b.pos)||0);
                        }
                        return 0;
                    });
                    const colorHex = colorName === 'blue' ? '#2196F3' : '#e91e63';
                    const grad = colorName === 'blue' ? 'linear-gradient(90deg, #2196F3, #64b5f6)' : 'linear-gradient(90deg, #e91e63, #f48fb1)';

                    const sumFlow = valves.reduce((acc, v) => acc + (parseFloat(v.flow)||0), 0).toFixed(1);
                    const paValues = valves.map(v => parseFloat(v.measuredP)).filter(x => !isNaN(x));
                    const paMin = paValues.length ? Math.min(...paValues).toFixed(1) : '-';
                    const paMax = paValues.length ? Math.max(...paValues).toFixed(1) : '-';

                    const valvesHTML = valves.map(v => {
                        const idx = p.valves.indexOf(v);
                        const flow = parseFloat(v.flow)||0;
                        const pos = (v.pos !== undefined && v.pos !== null) ? v.pos : '-';
                        const pa = (v.measuredP !== undefined && v.measuredP !== null) ? v.measuredP : '-';
                        const apt = v.apartment ? '['+v.apartment+'] ' : '';
                        const room = v.room || 'Huone';
                        const target = (parseFloat(v.target)||0);
                        return `<div class="valve-chip" onclick="editValve(${idx})">
                                    <span class="room">${apt}${room}</span>
                                    <span class="meta">Avaus ${pos}% • ${flow.toFixed(1)} l/s • ${pa} Pa${target?` • Tavoite ${target}`:''}</span>
                                </div>`;
                    }).join('');

                    return `
                        <div class="ahu-branch" style="border-left: 4px solid ${colorHex};">
                            <span class="branch-connector" style="background:${grad};"></span>
                            <h4 style="color:${colorHex}">${duct.name} <span style="font-weight:normal; color:#888;">(${duct.size})</span></h4>
                            <div class="branch-summary">Σ l/s: ${sumFlow} • Pa: ${paMin}…${paMax} • Venttiilejä: ${valves.length}</div>
                            <div class="branch-pipe" style="background:${grad};"></div>
                            <div class="ahu-valves">${valvesHTML || '<span style="font-size:10px; color:#ccc;">Tyhjä</span>'}</div>
                        </div>`;
                }

                function getValveOrderLabel(){
                    const m = window._valveSortKey || 'apt';
                    return m==='apt'?'Asunto':m==='room'?'Huone':m==='flow'?'Virtaus':m==='pos'?'Avaus':'Asunto';
                }
                function toggleValveOrder(){
                    const seq = ['apt','room','flow','pos'];
                    const cur = window._valveSortKey || 'apt';
                    const idx = seq.indexOf(cur);
                    window._valveSortKey = seq[(idx+1)%seq.length];
                    renderVisualContent();
                }

                // Klikkiapufunktiot
                function editValve(idx) {
                    const p = projects.find(x => x.id === activeProjectId);
                    if (!p || idx < 0 || idx >= p.valves.length) return;
                    showEditValve(p.valves[idx]);
                }
                function editMachine(index) {
                    showAddMachine();
                }

// --- KERROSTALO GENERAATTORI ---
function showGenerator() {
    document.getElementById('genModal').style.display = 'flex';
}
function closeGenerator() {
    document.getElementById('genModal').style.display = 'none';
}
function runGenerator() {
    const p = projects.find(x => x.id === activeProjectId);
    if (!p) return;
    const floors = parseInt(document.getElementById('genFloors').value);
    const aptsPerFloor = parseInt(document.getElementById('genApts').value);
    let aptNum = parseInt(document.getElementById('genStart').value);
    const prefix = document.getElementById('genPrefix').value;
    // Etsitään joku poistokanava ja tulo/korvausilmakanava, johon venttiilit liitetään
    let extDuct = p.ducts.find(d => d.type === 'extract')?.id || "";
    let supDuct = p.ducts.find(d => d.type === 'supply')?.id || "";
    // Varoitus jos kanavia ei ole
    if (!extDuct) {
        if(!confirm("Huom: Projektissa ei ole poistokanavaa. Venttiilit luodaan ilman runkoa. Jatketaanko?")) return;
    }
    let count = 0;
    // SILMUKKA: Kerrokset
    for (let f = 1; f <= floors; f++) {
        // SILMUKKA: Asunnot tässä kerroksessa
        for (let a = 1; a <= aptsPerFloor; a++) {
            const aptName = `${prefix}${aptNum}`; // Esim. A1
            // Lisätään venttiilit valintojen mukaan
            if (document.getElementById('chkK').checked) addGenValve(p, aptName, "Keittiö", "h_kso125", extDuct);
            if (document.getElementById('chkKPH').checked) addGenValve(p, aptName, "KPH", "h_kso100", extDuct);
            if (document.getElementById('chkVH').checked) addGenValve(p, aptName, "VH", "h_kso100", extDuct);
            if (document.getElementById('chkFresh').checked) addGenValve(p, aptName, "Korvausilma", "fresh100", supDuct);
            aptNum++;
            count++;
        }
    }
    saveData();
    closeGenerator();
    showView('view-details');
    renderDetailsList();
    alert(`Luotu ${count} asuntoa ja venttiilit!`);
}
function addGenValve(p, apt, room, type, ductId) {
    p.valves.push({
        apartment: apt,
        room: room,
        type: type,
        target: 0,
        flow: 0,
        pos: 0,
        parentDuctId: ductId
    });
}

function setVisualMode(mode) {
    window.activeVisMode = mode;
    // Throttle to next frame for smoother updates
    if (!window._visRenderScheduled) {
        window._visRenderScheduled = true;
        requestAnimationFrame(() => {
            window._visRenderScheduled = false;
            renderVisualContent();
        });
    }
}

// --- LISÄÄ VENTTIILI ---
function showAddValve() {
    document.getElementById('roomName').value = "";
    document.getElementById('measuredP').value = "";
    document.getElementById('currentPos').value = "";
    const live = document.getElementById('liveKValue'); if(live) live.innerText = "";
    const res = document.getElementById('calcResult'); if(res) res.style.display = 'none';
    const table = document.getElementById('valveReferenceTable'); if(table) table.style.display = 'none';
    editingValveIndex = null;
    populateDuctSelect();
    showView('view-measure');
}

// Muokkaa venttiiliä: esitäytä mittauslomake ja mene mittausnäkymään
function showEditValve(v) {
    const p = projects.find(x => x.id === activeProjectId);
    if (!p) return;
    const idx = p.valves.indexOf(v);
    editingValveIndex = idx >= 0 ? idx : null;
    // Kentät
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
    set('roomName', v.room || '');
    set('apartmentName', v.apartment || '');
    set('currentPos', v.pos);
    set('measuredP', v.measuredP);
    set('targetFlow', v.target);
    set('measuredFlow', v.flow);
    populateDuctSelect();
    const ductSel = document.getElementById('parentDuctId'); if (ductSel && v.parentDuctId) ductSel.value = v.parentDuctId;
    // Malli/koko valinta
    const modelSel = document.getElementById('valveModelSelect');
    const sizeSel = document.getElementById('valveSizeSelect');
    const typeHidden = document.getElementById('valveType');
    if (typeHidden) typeHidden.value = v.type || '';
    if (modelSel && sizeSel && v.type) {
        // Päivitä mallitaulukko
        const modelName = valveIdToModelId[v.type];
        if (modelName) {
            modelSel.value = modelName;
            updateSizeSelect();
            sizeSel.value = v.type;
        }
        updateLiveK();
    }
    // Näytetään mittausnäkymä ja palataan visuaaliin tallennuksen jälkeen
    returnToVisual = true;
    showView('view-measure');
}

// --- LISÄÄ KONE ---
function saveMachine() {
    const p = projects.find(x => x.id === activeProjectId);
    if (!p) return;
    if (!p.machines) p.machines = [];
    const typeEl = document.getElementById('machineType');
    const type = typeEl ? typeEl.value : '';
    p.machines.push({
        name: document.getElementById('machineName').value || "IV-Kone",
        type: type,
        supQ: document.getElementById('machineSupplyQ').value,
        extQ: document.getElementById('machineExtractQ').value,
        speed: document.getElementById('machineSpeed').value || "-"
    });
    if (type === 'roof_fan') {
        if (!p.ducts) p.ducts = [];
        const hasFresh = p.ducts.find(d => (d.name||'').includes("Korvausilma"));
        if (!hasFresh) {
            p.ducts.push({ id: Date.now(), name: "Korvausilma", type: "supply", size: 0 });
        }
    }
    saveData();
    showView('view-details');
    renderDetailsList();
}

function showAddMachine() {
    const title = document.getElementById('machineTitle'); if (title) title.innerText = 'Uusi IV-Kone';
    const f = id => { const el = document.getElementById(id); if (el) el.value = ''; };
    f('machineName'); f('machineSpeed'); f('machineSupPct'); f('machineExtPct'); f('machineSupplyQ'); f('machineExtractQ');
    showView('view-add-machine');
}

// Täyttää mittausnäkymän runkovalinnan
function populateDuctSelect() {
    const p = projects.find(x => x.id === activeProjectId);
    const sel = document.getElementById('parentDuctId');
    if (!sel) return;
    sel.innerHTML = '';
    if (!p || !p.ducts || p.ducts.length === 0) {
        sel.innerHTML = '<option value="">(Ei runkoja)</option>';
        return;
    }
    p.ducts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${d.name} (${d.type === 'supply' ? 'Tulo' : 'Poisto'})`;
        sel.appendChild(opt);
    });
}

// Turvallinen stub asuntomodaalille pystynäkymässä
function openAptModal(aptId){
    try {
        if (window.showAptModal) return window.showAptModal(aptId);
    } catch(e) {}
    alert(`Asunto ${aptId}`);
}
