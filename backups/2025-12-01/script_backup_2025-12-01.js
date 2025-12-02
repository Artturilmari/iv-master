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





function finalizeValveSelection() {

const val = document.getElementById('valveSizeSelect').value;

document.getElementById('valveType').value = val;

updateLiveK();

}



// Hook into existing flow

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

function showVisual() { renderVisualDOM(); showView('view-visual'); }



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

const p = {

id: Date.now(), name: "Esimerkki (120m2)",

machines: [{ name: "Vallox 145 MV", speed: "3", supPct: 55, extPct: 60, supQ: 65, extQ: 70 }],

ducts: [{ id: 1, type: 'supply', name: 'Tulo Runko', flow: 0, size: 160 }, { id: 2, type: 'extract', name: 'Poisto Runko', flow: 0, size: 160 }],

valves: [

// TULO (6 kpl)

{ room: "Olohuone", type: "h_kts125", target: 20, flow: 12.5, pos: 2, parentDuctId: 1 },

{ room: "MH 1 (Vanhemmat)", type: "h_kts100", target: 12, flow: 18.0, pos: 5, parentDuctId: 1 },

{ room: "MH 2 (Lapset)", type: "h_kts100", target: 12, flow: 12.1, pos: 3, parentDuctId: 1 },

{ room: "Työhuone", type: "h_kts100", target: 12, flow: 8.5, pos: 2, parentDuctId: 1 },

{ room: "Eteinen", type: "h_kts100", target: 10, flow: 16.0, pos: 6, parentDuctId: 1 },

{ room: "Takkahuone", type: "h_kts100", target: 10, flow: 10.2, pos: 2.5, parentDuctId: 1 },



// POISTO (6 kpl)

{ room: "Keittiö", type: "h_kso125", target: 25, flow: 18.0, pos: 2, parentDuctId: 2 },

{ room: "KPH", type: "h_kso125", target: 20, flow: 30.0, pos: 8, parentDuctId: 2 },

{ room: "Sauna", type: "h_ksp100", target: 8, flow: 4.0, pos: 1, parentDuctId: 2 },

{ room: "WC Alakerta", type: "h_kso100", target: 15, flow: 15.2, pos: 3, parentDuctId: 2 },

{ room: "WC Yläkerta", type: "h_kso100", target: 15, flow: 22.5, pos: 6, parentDuctId: 2 },

{ room: "VH", type: "h_kso100", target: 10, flow: 9.9, pos: 2, parentDuctId: 2 }

],

meta: {}, modes: { home: {}, away: {}, boost: {} }

};

p.modes.home = { machines: JSON.parse(JSON.stringify(p.machines)), valves: JSON.parse(JSON.stringify(p.valves)) };

projects.push(p); 
saveData(); 
renderProjects(); 
openProject(p.id);
alert("Laaja Demo luotu!");

}



function duplicateValve(index, e) { e.stopPropagation(); const count = prompt("Montako kopiota luodaan?", "1"); if(count && !isNaN(count)) { const p = projects.find(x => x.id === activeProjectId); const original = p.valves[index]; for(let i=0; i<parseInt(count); i++) { const copy = JSON.parse(JSON.stringify(original)); const numMatch = copy.room.match(/\d+$/); if(numMatch) { const nextNum = parseInt(numMatch[0]) + 1 + i; copy.room = copy.room.replace(/\d+$/, nextNum); } else { copy.room += ` (kopio ${i+1})`; } p.valves.push(copy); } saveData(); renderDetailsList(); } }

function previewPhoto() { const file = document.getElementById('valvePhotoInput').files[0]; const preview = document.getElementById('valvePhotoPreview'); if (file) { const reader = new FileReader(); reader.onloadend = function() { const img = new Image(); img.src = reader.result; img.onload = function() { const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const MAX_WIDTH = 300; const scaleSize = MAX_WIDTH / img.width; canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize; ctx.drawImage(img, 0, 0, canvas.width, canvas.height); currentPhotoData = canvas.toDataURL('image/jpeg', 0.7); preview.src = currentPhotoData; preview.style.display = 'block'; } }; reader.readAsDataURL(file); } else { preview.src = ""; preview.style.display = 'none'; currentPhotoData = null; } }

function loadBackground(input) { const file = input.files[0]; if(file) { const reader = new FileReader(); reader.onload = function(e) { document.getElementById('view-visual').style.backgroundImage = `url('${e.target.result}')`; }; reader.readAsDataURL(file); } }

function calcSFP() { const p = projects.find(x => x.id === activeProjectId); let sFlow = 0, eFlow = 0; p.valves.forEach(v => { const d = p.ducts.find(d=>d.id==v.parentDuctId); if(d && d.type === 'supply') sFlow += v.flow; else eFlow += v.flow; }); const maxFlow = Math.max(sFlow, eFlow); const pow = (parseFloat(p.meta.powerSup)||0) + (parseFloat(p.meta.powerExt)||0); let sfp = "-"; if(maxFlow > 0 && pow > 0) { sfp = ( (pow/1000) / (maxFlow/1000) ).toFixed(2); } document.getElementById('sfpDisplay').innerText = `SFP: ${sfp} (Tulo: ${sFlow.toFixed(0)}, Poisto: ${eFlow.toFixed(0)})`; }

function updateLiveK() { const type = document.getElementById('valveType').value; const posStr = document.getElementById('currentPos').value; const display = document.getElementById('liveKValue'); if (posStr === "" || !valveDB[type]) { display.innerText = ""; return; } const pos = parseFloat(posStr); const k = getK(type, pos); display.innerText = `K-arvo: ${k.toFixed(2)}`; }


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

function saveSettings() { const p = projects.find(x => x.id === activeProjectId); p.meta.measurer = document.getElementById('setMeasurer').value; p.meta.powerSup = document.getElementById('setPowerSup').value; p.meta.powerExt = document.getElementById('setPowerExt').value; p.meta.swept = document.getElementById('chkSwept').checked; p.meta.bearSup = document.getElementById('chkBearSup').checked; p.meta.bearExt = document.getElementById('chkBearExt').checked; saveData(); showView('view-details'); }

function addDuctFromVisual(type) { const p = projects.find(x => x.id === activeProjectId); const count = p.ducts.filter(d => d.type === type).length + 1; const prefix = type === 'supply' ? 'Tulo' : 'Poisto'; p.ducts.push({ id: Date.now(), type, name: `${prefix} ${count}`, flow: 0, size: 125 }); saveData(); renderVisualDOM(); drawPipes(); }

function deleteDuctFromVisual(id) { if(confirm("Poistetaanko runko?")) { const p = projects.find(x => x.id === activeProjectId); p.ducts = p.ducts.filter(d => d.id != id); p.valves = p.valves.filter(v => v.parentDuctId != id); saveData(); renderVisualDOM(); drawPipes(); } }


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

let report = "<h3>⚡ Optimointiraportti</h3>";

if (worstValveSup) {

report += `<h4>Tuloilma (Indeksi: ${worstValveSup.room})</h4><p>Heikoin venttiili saa vain ${(worstRatioSup*100).toFixed(0)}% tavoitteesta.</p><p class="advice-text">TOIMENPIDE:</p><ul><li>Avaa <b>${worstValveSup.room}</b> venttiili täysin auki.</li><li>Mittaa uudelleen. Jos virtaama nousee, voit <b>laskea koneen tuloilmapuhallinta</b>.</li></ul>`;

} else { report += "<p>Tuloilma OK.</p>"; }

if (worstValveExt) {

report += `<h4>Poistoilma (Indeksi: ${worstValveExt.room})</h4><p>Heikoin venttiili saa vain ${(worstRatioExt*100).toFixed(0)}% tavoitteesta.</p><p class="advice-text">TOIMENPIDE:</p><ul><li>Avaa <b>${worstValveExt.room}</b> venttiili täysin auki.</li><li>Säädä muita pienemmälle, ja <b>laske poistopuhallinta</b>.</li></ul>`;

}

document.getElementById('optSteps').innerHTML = report;

showView('view-optimize');

}



// --- TASAPAINOTUS LASKENTA ---

function showBalance() {

const p = projects.find(x => x.id === activeProjectId);

// Lasketaan koneiden summa

let machineSup = 0, machineExt = 0;

p.machines.forEach(m => {

machineSup += parseFloat(m.supQ) || 0;

machineExt += parseFloat(m.extQ) || 0;

});



// Lasketaan venttiilien summa

let valveSup = 0, valveExt = 0;

p.valves.forEach(v => {

// Tunnistetaan tulo/poisto rungon perusteella

const duct = p.ducts.find(d => d.id == v.parentDuctId);

if (duct) {

if (duct.type === 'supply') valveSup += v.flow;

else valveExt += v.flow;

}

});



// Lasketaan erot

const diffSup = machineSup - valveSup;

const diffExt = machineExt - valveExt;


const pctSup = machineSup > 0 ? (diffSup / machineSup * 100).toFixed(1) : 0;

const pctExt = machineExt > 0 ? (diffExt / machineExt * 100).toFixed(1) : 0;



const getColor = (pct) => {

const abs = Math.abs(pct);

if (abs < 5) return 'bg-ok';

if (abs < 10) return 'bg-warn';

return 'bg-err';

};



let html = `<div class="balance-card">

<h4>Tuloilma</h4>

<div class="balance-row"><span>Koneet yhteensä:</span> <b>${machineSup.toFixed(1)} l/s</b></div>

<div class="balance-row"><span>Venttiilit yhteensä:</span> <b>${valveSup.toFixed(1)} l/s</b></div>

<div class="balance-alert ${getColor(pctSup)}">Vuoto: ${diffSup.toFixed(1)} l/s (${pctSup}%)</div>

</div>

<div class="balance-card">

<h4>Poistoilma</h4>

<div class="balance-row"><span>Koneet yhteensä:</span> <b>${machineExt.toFixed(1)} l/s</b></div>

<div class="balance-row"><span>Venttiilit yhteensä:</span> <b>${valveExt.toFixed(1)} l/s</b></div>

<div class="balance-alert ${getColor(pctExt)}">Vuoto: ${diffExt.toFixed(1)} l/s (${pctExt}%)</div>

</div>`;



document.getElementById('balanceContent').innerHTML = html;

showView('view-balance');

}



function renderVisualDOM() {

const p = projects.find(proj => proj.id === activeProjectId);

document.getElementById('visMachineContent').innerHTML = p.machines.length ? `<b>${p.machines[0].name}</b>` : `<b>Ei konetta</b>`;

const wrapper = document.getElementById('visLanes'); wrapper.innerHTML = '';

const sorted = [...p.ducts.filter(d=>d.type==='supply'), ...p.ducts.filter(d=>d.type==='extract').reverse()];

let worstRatio = 1; let worstId = -1;

p.valves.forEach((v,i) => { if(v.target > 0) { const r = v.flow/v.target; if(r < worstRatio){ worstRatio = r; worstId = i; }}});

sorted.forEach(d => {

const lane = document.createElement('div'); lane.className = `duct-lane lane-${d.type}`; lane.id = `lane-${d.id}`;

const totalFlow = p.valves.filter(v => v.parentDuctId == d.id).reduce((sum, v) => sum + (v.flow || 0), 0);

const vel = calcVelocity(totalFlow, d.size || 125);

const velColor = getVelColor(vel);

const velBadge = `<span class="velocity-badge ${velColor}" style="margin-left:5px; padding:2px 5px; border-radius:4px; font-size:10px; color:white; background:${velColor === 'v-green' ? '#28a745' : (velColor === 'v-yellow' ? '#fd7e14' : '#dc3545')}">${vel} m/s (Ø${d.size||125})</span>`;

let valvesHtml = '';

p.valves.forEach((v, idx) => {

if (v.parentDuctId == d.id) {

const percent = v.target > 0 ? (v.flow / v.target * 100).toFixed(0) : 0;

let statusClass = '';

if (idx === worstId) statusClass = 'status-worst';

else if (Math.abs(100-percent) <= 10) statusClass = 'status-ok';

else statusClass = 'status-bad';

let advice = "";

if(v.target > 0) { const diff = v.flow - v.target; if (diff < -1) advice = `<span style="color:green; font-weight:bold;">AVAA &uarr;</span>`; else if (diff > 1) advice = `<span style="color:red; font-weight:bold;">KURISTA &darr;</span>`; else advice = `👍 OK`; }

valvesHtml += `<div class="valve-node ${statusClass}" onclick="editValve(${idx})"><b>${v.manualName || v.room}</b><br><small>${v.flow.toFixed(1)}/${v.target}</small><br><div style="font-size:10px; margin-top:2px;">${advice}</div></div>`;

}

});

lane.innerHTML = `<div class="duct-lane-pipe"></div><div class="lane-title" onclick="editDuct(${d.id})">${d.name} ${velBadge} <span class="del-lane-btn" onclick="deleteDuctFromVisual(${d.id})">x</span></div>${valvesHtml}<div class="add-valve-btn" onclick="addValveToDuct('${d.id}')">+</div>`; wrapper.appendChild(lane);

});

}

function drawPipes(){ const p=projects.find(x=>x.id===activeProjectId); const svg=document.getElementById('pipeCanvas'); svg.innerHTML=''; const machine=document.getElementById('visMachine'); const root=document.getElementById('schematicRoot'); if(!machine||!root)return; const mRect=machine.getBoundingClientRect(); const rRect=root.getBoundingClientRect(); const mx=mRect.left-rRect.left; const my=mRect.top-rRect.top; const mw=mRect.width; const mh=mRect.height; const draw=(d,sx,sy,c)=>{const l=document.getElementById(`lane-${d.id}`);if(!l)return;const lr=l.getBoundingClientRect();const tx=lr.left-rRect.left;const ty=lr.top-rRect.top+lRect.height/2;const p=document.createElementNS("http://www.w3.org/2000/svg","path");p.setAttribute("d",`M ${sx} ${sy} V ${ty} H ${tx+20}`);p.setAttribute("stroke",c);p.setAttribute("stroke-width","6");p.setAttribute("fill","none");svg.appendChild(p);}; p.ducts.filter(d=>d.type==='supply').forEach((d,i)=>{let sx=mx+mw,sy=my+mh*0.25;if(i===0){sx=mx+mw*0.2;sy=my;}else if(i===1){sx=mx+mw*0.8;sy=my;}draw(d,sx,sy,"#0066cc");}); p.ducts.filter(d=>d.type==='extract').forEach((d,i)=>{let sx=mx+mw,sy=my+mh*0.75;if(i===0){sx=mx+mw*0.2;sy=my+mh;}else if(i===1){sx=mx+mw*0.8;sy=my+mh;}draw(d,sx,sy,"#d63384");}); }

window.addEventListener('resize', () => { if(document.getElementById('view-visual').classList.contains('active')) drawPipes(); });

function addValveToDuct(ductId) { preSelectedDuctId = ductId; showAddValve(true); }


// --- MODIFIED SHOW/EDIT FUNCTIONS FOR SPLIT SELECTOR ---

function showAddValve(fromVisual = false) {

    if (!activeProjectId) {
        alert('Avaa tai luo projekti ensin ennen mittauksen lisäämistä.');
        return;
    }

    returnToVisual = fromVisual;

editingValveIndex = null;

currentPhotoData = null;

document.getElementById('measureTitle').innerText="Uusi mittaus";

document.getElementById('btnCalcSave').innerText="Laske & Tallenna";

document.getElementById('btnDeleteValve').style.display='none';

document.getElementById('roomName').value='';

document.getElementById('targetQ').value='';

document.getElementById('measuredP').value='';

document.getElementById('currentPos').value='';

document.getElementById('liveKValue').innerText='';

document.getElementById('calcResult').style.display='none';

document.getElementById('valvePhotoPreview').style.display='none';

document.getElementById('valvePhotoInput').value='';


// Reset selectors

document.getElementById('valveModelSelect').value = "";

document.getElementById('valveSizeSelect').innerHTML = "";

document.getElementById('valveType').value = "";



populateDuctSelect();

if(preSelectedDuctId) { document.getElementById('parentDuctId').value = preSelectedDuctId; preSelectedDuctId = null; }

showView('view-measure');

}



function editValveFromVisual() {

returnToVisual = true;

const p = projects.find(x => x.id === activeProjectId);

if (p.machines.length > 0) {

editMachine(0);

} else {

showAddMachine(true);

}

}



function editValve(index) {

if (!returnToVisual) returnToVisual = document.getElementById('view-visual').classList.contains('active');

editingValveIndex = index;

const p=projects.find(x=>x.id===activeProjectId);

const v=p.valves[index];

currentPhotoData = v.photo || null;

document.getElementById('measureTitle').innerText="Muokkaa venttiiliä";

document.getElementById('btnCalcSave').innerText="Päivitä";

document.getElementById('btnDeleteValve').style.display='block';

populateDuctSelect();

document.getElementById('roomName').value=v.room;


// SET SPLIT SELECTORS

const model = valveIdToModelId[v.type];

if(model) {

document.getElementById('valveModelSelect').value = model;

updateSizeSelect(); // Populate sizes

document.getElementById('valveSizeSelect').value = v.type; // Set size

document.getElementById('valveType').value = v.type;

} else {

document.getElementById('valveModelSelect').value = "";

document.getElementById('valveSizeSelect').innerHTML = "";

document.getElementById('valveType').value = v.type;

}



document.getElementById('targetQ').value=v.target;

if(v.parentDuctId) document.getElementById('parentDuctId').value=v.parentDuctId;

document.getElementById('calcResult').style.display='block';

document.getElementById('calcResult').innerHTML=`Nykyinen: ${v.flow}`;

if(v.photo) { document.getElementById('valvePhotoPreview').src = v.photo; document.getElementById('valvePhotoPreview').style.display = 'block'; } else { document.getElementById('valvePhotoPreview').style.display = 'none'; }

showView('view-measure');

}



function populateDuctSelect() { const p=projects.find(x=>x.id===activeProjectId); const s=document.getElementById('parentDuctId'); s.innerHTML='<option value="">-- Ei valittu --</option>'; p.ducts.forEach(d=>{s.innerHTML+=`<option value="${d.id}">${d.name}</option>`}); }

// --- UUSI CALCULATE & SAVE (ASUNTO MUKANA) ---
        function calculateAndSave(saveAndNext = false) { 
            const apt = document.getElementById('apartmentName').value || "-"; // UUSI: Asunto
            const room = document.getElementById('roomName').value || "Nimetön"; 
            const type = document.getElementById('valveType').value; 
            const ductId = document.getElementById('parentDuctId').value; 
            const target = parseFloat(document.getElementById('targetQ').value); 
            const press = parseFloat(document.getElementById('measuredP').value); 
            const pos = parseFloat(document.getElementById('currentPos').value); 
            const manualName = document.getElementById('manualName').value; 
            const manualK = parseFloat(document.getElementById('manualK').value); 
            const temp = parseFloat(document.getElementById('airTemp').value) || 20; 
            
            if (!target) return alert("Aseta tavoitevirtaama!"); 
            
            let flow = 0; 
            
            if (press) { 
                const k = manualK ? manualK : getK(type, pos || 0); 
                const rawFlow = k * Math.sqrt(press); 
                // Lämpötilakorjaus
                const densityFactor = Math.sqrt(293 / (273 + temp));
                flow = rawFlow * densityFactor; 
            } else if (editingValveIndex !== null) { 
                // Jos ei painetta, pidetään vanha virtaama
                flow = projects.find(x => x.id === activeProjectId).valves[editingValveIndex].flow; 
            } else {
                return alert("Syötä paine!"); 
            }

            // Luodaan tallennettava data
            const vData = {
                apartment: apt,   // <--- TÄMÄ ON SE UUSI TIETO
                room: room,
                type: type,
                target: target,
                flow: parseFloat(flow.toFixed(1)),
                pos: pos,
                manualName: manualName,
                manualK: manualK,
                parentDuctId: ductId,
                date: new Date().toISOString()
            };

            const p = projects.find(x => x.id === activeProjectId);
            if (!p) {
                alert('Avaa tai luo projekti ensin ennen mittauksen tallentamista.');
                return;
            }
            
            if (editingValveIndex !== null) {
                p.valves[editingValveIndex] = vData;
            } else {
                p.valves.push(vData);
            }
            
            saveData(); 
            
            if (saveAndNext) { 
                // Tyhjennetään vain huone, EI asuntoa (koska mittaaja jatkaa samassa asunnossa)
                document.getElementById('roomName').value = ""; 
                document.getElementById('measuredP').value = "";
                // Ilmoitus käyttäjälle
                // alert(`Tallennettu: ${vData.flow} l/s. Jatka seuraavaan.`); 
            } else { 
                showView('view-details'); 
                renderDetailsList(); 
            } 
        }
function commitValve(room, type, target, flow, ductId, pos, manualName, manualK, saveAndNext) { const p=projects.find(x=>x.id===activeProjectId); const d={room,type,target,flow,parentDuctId:ductId, pos, manualName, manualK, date:new Date().toISOString(), photo: currentPhotoData}; if(editingValveIndex!==null) p.valves[editingValveIndex]=d; else p.valves.push(d); saveData(); if(saveAndNext) { document.getElementById('roomName').value = ""; document.getElementById('targetQ').value = ""; document.getElementById('measuredP').value = ""; document.getElementById('currentPos').value = ""; editingValveIndex = null; document.getElementById('measureTitle').innerText = "Uusi mittaus"; alert("Tallennettu! Syötä seuraava."); } else { if(returnToVisual) showVisual(); else { showView('view-details'); renderDetailsList(); } } }

function deleteValve() { if(confirm("Poista?")){projects.find(x=>x.id===activeProjectId).valves.splice(editingValveIndex,1); saveData(); if(returnToVisual) showVisual(); else { showView('view-details'); renderDetailsList(); }} }

function getK(k,p){if(!valveDB[k])return 1;let d=valveDB[k].data;for(let i=0;i<d.length-1;i++){if((p>=d[i][0]&&p<=d[i+1][0])||(p<=d[i][0]&&p>=d[i+1][0])){let r=(p-d[i][0])/(d[i+1][0]-d[i][0]);return d[i][1]+r*(d[i+1][1]-d[i][1]);}}return d[d.length-1][1];}

function saveData() { localStorage.setItem('iv_projects', JSON.stringify(projects)); calcSFP(); }

// --- PROJEKTIN LUONTI (MODAL LOGIIKKA) ---

        // 1. Avaa ikkuna
        function showNewProjectModal() {
            // Tyhjennetään kentät
            document.getElementById('newProjName').value = "";
            document.getElementById('newProjType').value = "ahu"; // Oletus: IV-Kone
            // Näytetään ikkuna
            document.getElementById('newProjectModal').style.display = "flex";
        }
        
        // Vanha createProject voi kutsua tätä, jos nappi on vielä vanhalla nimellä
        function createProject() {
            showNewProjectModal();
        }

        // 2. Sulje ikkuna
        function closeModal() {
            document.getElementById('newProjectModal').style.display = "none";
        }

        // 3. TÄMÄ ON SE "LUO KOHDE" -NAPIN TOIMINTO
        function confirmCreateProject() {
            const name = document.getElementById('newProjName').value;
            const type = document.getElementById('newProjType').value;

            if (!name) {
                alert("Anna projektille nimi!");
                return;
            }

            const newId = Date.now();
            
            // Luodaan uusi projekti valitulla tyypillä
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

            // Automaatio: Lisätään laitteet tyypin mukaan
            if (type === 'roof' || type === 'hybrid') {
                p.machines.push({ name: "Huippuimuri", type: "roof_fan", supQ: 0, extQ: 0 });
                p.ducts.push({ id: 1, name: "Poisto (Nousu)", type: "extract", size: 160 });
            }
            
            if (type === 'ahu' || type === 'hybrid') {
                 // Jos hybridi tai pelkkä kone, lisätään IV-kone
                 p.machines.push({ name: "IV-Kone", type: "ahu", supQ: 0, extQ: 0 });
                 // Jos pelkkä kone, lisätään perusrungot
                 if(type === 'ahu') {
                     p.ducts.push({ id: 2, name: "Tulo", type: "supply", size: 125 });
                     p.ducts.push({ id: 3, name: "Poisto", type: "extract", size: 125 });
                 }
            }

            // Tallennus ja avaus
            projects.push(p);
            saveData();
            closeModal();
            openProject(newId);
        }

function renderDetailsList() {
    const p = projects.find(x => x.id === activeProjectId);
    if(!p) return;

    // 1. Koneet
    document.getElementById('machineList').innerHTML = p.machines.map((m,i)=>
        `<div class="list-item machine" onclick="editMachine(${i})"><b>${m.name}</b> <button class="list-delete-btn" onclick="deleteMachine(${i})">🗑️</button></div>`
    ).join('');

    // 2. Runkokanavat
    document.getElementById('ductList').innerHTML = p.ducts.map(d =>
        `<div class="list-item">
            <b>${d.name}</b> (${d.size}mm)
            <div>
                <button class="btn btn-secondary" style="font-size:11px; padding:2px 6px; margin-right:5px;" onclick="showBatch(${d.id}, event)">📝 Sarjasyöttö</button>
                <button class="list-action-btn list-delete-btn" onclick="deleteDuctFromVisual(${d.id})">🗑️</button>
            </div>
        </div>`
    ).join('');

    // 3. Venttiilit
    document.getElementById('valveList').innerHTML = p.valves.map((v,i) => {
        const duct = v.parentDuctId ? p.ducts.find(d=>d.id==v.parentDuctId) : null;
        const dName = duct ? `(${duct.name})` : '';
        const percent = v.target > 0 ? (v.flow / v.target * 100).toFixed(0) : 0;
        const color = (percent >= 90 && percent <= 110) ? 'green' : 'red';

        return `<div class="list-item" onclick="editValve(${i})">
            <div style="flex-grow:1">
                <b>${v.room}</b> ${dName}<br>
                <small>${v.flow.toFixed(1)} / ${v.target}</small>
                <span style="color:${color}; font-size:11px; font-weight:bold; margin-left:5px;">${percent}%</span>
            </div>
            <button class="list-action-btn list-copy-btn" onclick="duplicateValve(${i}, event)">⧉</button>
            <button class="list-action-btn list-delete-btn" onclick="deleteValveDirect(${i}, event)">🗑️</button>
        </div>`;
    }).join('');
}



function deleteValveDirect(i, e){ e.stopPropagation(); if(confirm("Poista?")){ projects.find(x=>x.id===activeProjectId).valves.splice(i,1); saveData(); renderDetailsList(); } }


// KORJATTU: SAVE MACHINE (Bug Fix)

function showAddMachine(fromVisual = false){

returnToVisual = fromVisual;

editingMachineIndex = null;

document.getElementById('machineTitle').innerText = "Uusi IV-Kone";

document.getElementById('machineName').value = "";

document.getElementById('machineSpeed').value = "";

document.getElementById('machineSupPct').value = "";

document.getElementById('machineExtPct').value = "";

document.getElementById('machineSupplyQ').value = "";

document.getElementById('machineExtractQ').value = "";

showView('view-add-machine');

}



function editMachineFromVisual() {

returnToVisual = true;

const p = projects.find(x => x.id === activeProjectId);

if (p.machines.length > 0) {

editMachine(0);

} else {

showAddMachine(true);

}

}



function editMachine(index) {

if (!returnToVisual) returnToVisual = document.getElementById('view-visual').classList.contains('active');

editingMachineIndex = index;

const p = projects.find(x => x.id === activeProjectId);

const m = p.machines[index];

document.getElementById('machineTitle').innerText = "Muokkaa";

document.getElementById('machineName').value = m.name;

document.getElementById('machineSpeed').value = m.speed || "";

document.getElementById('machineSupPct').value = m.supPct || "";

document.getElementById('machineExtPct').value = m.extPct || "";

document.getElementById('machineSupplyQ').value = m.supQ || "";

document.getElementById('machineExtractQ').value = m.extQ || "";

showView('view-add-machine');

}

function saveMachine() {

const p = projects.find(x => x.id === activeProjectId);

const data = {

name: document.getElementById('machineName').value || "Kone",

speed: document.getElementById('machineSpeed').value,

supPct: document.getElementById('machineSupPct').value,

extPct: document.getElementById('machineExtPct').value,

supQ: document.getElementById('machineSupplyQ').value,

extQ: document.getElementById('machineExtractQ').value

};

if (editingMachineIndex !== null) p.machines[editingMachineIndex] = data;

else p.machines.push(data);


saveData();

if (returnToVisual) showVisual();

else {

showView('view-details');

renderDetailsList();

}

}


function deleteMachine(i){if(confirm("Poista?")){projects.find(x=>x.id===activeProjectId).machines.splice(i,1);saveData();renderDetailsList();}}


function showAddDuct(){
    if (!activeProjectId) {
        alert('Avaa tai luo projekti ensin ennen rungon lisäämistä.');
        return;
    }
    editingDuctId = null;
    document.getElementById('ductName').value = "";
    document.getElementById('ductFlow').value = "";
    showView('view-add-duct');
}

function editDuct(id) {

editingDuctId = id;

const p = projects.find(x => x.id === activeProjectId);

const d = p.ducts.find(d => d.id == id);

document.getElementById('ductType').value = d.type;

document.getElementById('ductName').value = d.name;

document.getElementById('ductSize').value = d.size || 100;

document.getElementById('ductFlow').value = d.flow || 0;

showView('view-add-duct');

}

function saveDuct(){

const p = projects.find(x => x.id === activeProjectId);
if (!p) { alert('Avaa tai luo projekti ensin ennen rungon tallentamista.'); return; }

const dData = {

id: editingDuctId ? editingDuctId : Date.now(),

type:document.getElementById('ductType').value,

name:document.getElementById('ductName').value,

flow:0,

size:document.getElementById('ductSize').value

};

if (editingDuctId) {

const idx = p.ducts.findIndex(d => d.id == editingDuctId);

p.ducts[idx] = dData;

} else {

p.ducts.push(dData);

}

saveData(); showView('view-details'); renderDetailsList();

}


// --- SIGNATURE PAD LOGIC ---

function initSignaturePad() {

const canvas = document.getElementById('signaturePad');

const ctx = canvas.getContext('2d');

let drawing = false;



// Fix resolution

const rect = canvas.getBoundingClientRect();

canvas.width = rect.width;

canvas.height = rect.height;

ctx.lineWidth = 2;

ctx.lineCap = 'round';

ctx.strokeStyle = '#000';



const getPos = (e) => {

const rect = canvas.getBoundingClientRect();

const clientX = e.touches ? e.touches[0].clientX : e.clientX;

const clientY = e.touches ? e.touches[0].clientY : e.clientY;

return { x: clientX - rect.left, y: clientY - rect.top };

};



const startDraw = (e) => { drawing = true; const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); e.preventDefault(); };

const moveDraw = (e) => { if(!drawing) return; const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); e.preventDefault(); };

const endDraw = () => { drawing = false; ctx.beginPath(); };



canvas.addEventListener('mousedown', startDraw);

canvas.addEventListener('mousemove', moveDraw);

canvas.addEventListener('mouseup', endDraw);

canvas.addEventListener('touchstart', startDraw);

canvas.addEventListener('touchmove', moveDraw);

canvas.addEventListener('touchend', endDraw);


signaturePad = canvas;

}



function clearSignature() {

const ctx = signaturePad.getContext('2d');

ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);

}



// --- RAPORTTI ---

function exportReport() {

const p=projects.find(x=>x.id===activeProjectId);


// LOGO

if(p.meta.logo) {

document.getElementById('reportLogoImg').src = p.meta.logo;

document.getElementById('reportLogoImg').style.display = 'block';

} else {

document.getElementById('reportLogoImg').style.display = 'none';

}



let h=`<h2>${p.name} (${currentMode})</h2><p>Mittaaja: ${p.meta.measurer||'-'}</p>`;


['home', 'away', 'boost'].forEach(mode => {

const mData = p.modes[mode];

if (mData && mData.valves && mData.valves.length > 0) {

const mInfo = mData.machines[0] || {};

h += `<h3>${mode.toUpperCase()} (Kone: ${mInfo.speed||'-'}, Tulo ${mInfo.supPct}% / Poisto ${mInfo.extPct}%)</h3>`;

h+=`<table class="report-table"><tr><th>Huone</th><th>Venttiili</th><th>Av</th><th>K</th><th>Paine</th><th>Tavoite</th><th>Mitattu</th><th>%</th></tr>`;

mData.valves.forEach(v=>{

const kVal = v.manualK || (v.pos ? getK(v.type, v.pos).toFixed(2) : '-');

const press = (v.flow && parseFloat(kVal) > 0) ? Math.pow(v.flow / parseFloat(kVal), 2).toFixed(0) : '-';

const perc = v.target>0 ? (v.flow/v.target*100).toFixed(0)+'%' : '-';

const vName = v.manualName || (valveDB[v.type] ? valveDB[v.type].name : v.type);

h+=`<tr><td>${v.room}</td><td>${vName}</td><td>${v.pos||'-'}</td><td>${kVal}</td><td>${press}</td><td>${v.target}</td><td>${v.flow.toFixed(1)}</td><td>${perc}</td></tr>`;

});

h+='</table><br>';

}

});


document.getElementById('reportContent').innerHTML=h;

showView('view-report');

}



function printReport() {

// Replace canvas with image before printing to ensure it shows

const canvas = document.getElementById('signaturePad');

const dataUrl = canvas.toDataURL();

const img = document.createElement('img');

img.src = dataUrl;

img.style.border = "1px solid #ccc";

img.style.height = "100px";


const wrapper = document.querySelector('.signature-wrapper');

wrapper.style.display = 'none'; // Hide canvas wrapper

wrapper.parentNode.appendChild(img); // Add img for print



window.print();



// Restore after print (timeout to ensure print dialog opened)

setTimeout(() => {

wrapper.style.display = 'block';

img.remove();

}, 1000);

}

// --- SARJASYÖTTÖ LOGIIKKA ALKAA ---

let batchValveIndices = [];

let editingBatchDuctId = null;


function showBatch(ductId, e) {

if(e) e.stopPropagation();

editingBatchDuctId = ductId;


const p = projects.find(x => x.id === activeProjectId);

const duct = p.ducts.find(d => d.id == ductId);


document.getElementById('batchDuctName').innerText = `Runko: ${duct.name} (${duct.type})`;


// Täytä mallivalikko

const modelSel = document.getElementById('batchNewModel');

modelSel.innerHTML = '<option value="">-- Valitse malli --</option>';

Object.keys(valveGroups).sort().forEach(m => {

modelSel.innerHTML += `<option value="${m}">${m}</option>`;

});

document.getElementById('batchNewSize').innerHTML = '';

document.getElementById('batchNewCount').value = '';



renderBatchTable();

showView('view-batch');

}



function updateBatchSizeSelect() {

const model = document.getElementById('batchNewModel').value;

const sizeSel = document.getElementById('batchNewSize');

sizeSel.innerHTML = '';

if (model && valveGroups[model]) {

let sizes = valveGroups[model].sort((a,b) => a.sortSize - b.sortSize);

sizes.forEach(item => {

sizeSel.innerHTML += `<option value="${item.id}">${item.size}</option>`;

});

}

}



function addBatchValves() {

const p = projects.find(x => x.id === activeProjectId);

const type = document.getElementById('batchNewSize').value;

const count = parseInt(document.getElementById('batchNewCount').value);


if (!type || !count || count < 1) return alert("Valitse malli ja määrä!");



for (let i = 0; i < count; i++) {

const existingCount = p.valves.filter(v => v.parentDuctId == editingBatchDuctId).length;

p.valves.push({

room: `Venttiili ${existingCount + 1 + i}`,

type: type,

target: 0,

flow: 0,

pos: 0,

parentDuctId: editingBatchDuctId

});

}

saveData();

renderBatchTable();

}



function renderBatchTable() {

const p = projects.find(x => x.id === activeProjectId);

batchValveIndices = [];

p.valves.forEach((v, index) => {

if (v.parentDuctId == editingBatchDuctId) batchValveIndices.push(index);

});



let html = `<table class="batch-table">

<tr><th style="width:35%">Nimi</th><th style="width:25%">Malli</th><th style="width:20%">Pa</th><th style="width:20%">l/s</th></tr>`;


if (batchValveIndices.length === 0) html += `<tr><td colspan="4" style="text-align:center; padding:15px; color:#999;">Ei venttiileitä. Lisää ylhäältä.</td></tr>`;



batchValveIndices.forEach(idx => {

const v = p.valves[idx];

const vName = valveDB[v.type] ? valveDB[v.type].name : v.type;

const shortName = vName.split(' ').slice(1).join(' ');

const kVal = v.manualK || getK(v.type, v.pos || 0);


let initialP = "";

if (v.flow > 0 && kVal > 0) {

initialP = Math.pow(v.flow / kVal, 2).toFixed(0);

}



html += `<tr id="row-${idx}">

<td><input type="text" value="${v.room}" style="width:100%; border:none; border-bottom:1px solid #eee;" onchange="updateBatchName(${idx}, this.value)"></td>

<td style="font-size:10px;">${shortName}<br>k=${kVal.toFixed(1)}</td>

<td><input type="number" class="batch-input" id="bp_${idx}" value="${initialP}" oninput="calcBatchRow(${idx})"></td>

<td id="br_${idx}" class="batch-flow-res">${v.flow.toFixed(1)}</td>

</tr>`;

});

html += `</table>`;

document.getElementById('batchList').innerHTML = html;

}



function updateBatchName(idx, val) {

const p = projects.find(x => x.id === activeProjectId);

p.valves[idx].room = val;

saveData();

}



function calcBatchRow(i) {

const pVal = document.getElementById('bp_'+i).value;

const v = projects.find(x => x.id === activeProjectId).valves[i];

const temp = parseFloat(document.getElementById('batchTemp').value) || 20;


if(pVal) {

const k = v.manualK || getK(v.type, v.pos || 0);

const rawFlow = k * Math.sqrt(pVal);

const densityFactor = Math.sqrt(293 / (273 + temp));

const finalFlow = rawFlow * densityFactor;


document.getElementById('br_'+i).innerText = finalFlow.toFixed(1);

document.getElementById('row-'+i).classList.add('batch-row-active');

v.flow = parseFloat(finalFlow.toFixed(1));

} else {

document.getElementById('br_'+i).innerText = "0.0";

document.getElementById('row-'+i).classList.remove('batch-row-active');

v.flow = 0;

}

}



function recalcAllBatch() {

batchValveIndices.forEach(idx => calcBatchRow(idx));

}



function saveBatch() {

saveData();

showView('view-details');

renderDetailsList();

}

// --- SARJASYÖTTÖ LOGIIKKA LOPPUU ---

// --- MISSING PROJECT FUNCTIONS ---

function renderProjects() {
    document.getElementById('projectsList').innerHTML = projects.map(p => 
        `<div class="list-item" onclick="openProject(${p.id})"><b>${p.name}</b></div>`
    ).join('');
    document.getElementById('noProjectsMsg').style.display = projects.length ? 'none' : 'block';
}

function openProject(id) {
    activeProjectId = id;
    const p = projects.find(x => x.id === id);
    if (!p) {
        console.error("Project not found:", id);
        return;
    }
    
    // Ensure modes exist
    if (!p.modes) p.modes = { home: {}, away: {}, boost: {} };
    if (!p.modes.home) p.modes.home = {};
    if (!p.modes.away) p.modes.away = {};
    if (!p.modes.boost) p.modes.boost = {};
    
    // Initialize machines and valves if not present
    if (!p.machines) p.machines = [];
    if (!p.ducts) p.ducts = [];
    if (!p.valves) p.valves = [];
    if (!p.meta) p.meta = {};
    
    // Set current mode to home if not set
    currentMode = 'home';
    
    // Display project name
    document.getElementById('currentProjectName').innerText = p.name;
    
    // Render the details
    renderDetailsList();
    
    // Show the details view
    showView('view-details');
}

function deleteCurrentProject() {
    if (confirm("Poista projekti?")) {
        projects = projects.filter(p => p.id !== activeProjectId);
        saveData();
        showView('view-projects');
    }
}

renderProjects();