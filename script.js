document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    let appState = {
        mode: 'manual', // 'manual' or 'database'
        currentSelection: {
            uniId: null,
            facId: null,
            specId: null,
            year: null,
            semester: null
        },
        db: null
    };

    // Load DB from localStorage or use default from data.js
    function loadDB() {
        // Bump version to v5 to force refresh of data
        const saved = localStorage.getItem('gpa_app_db_v5');
        if (saved) {
            try {
                appState.db = JSON.parse(saved);
                // Basic validation
                if (!appState.db.universities) throw new Error("Invalid DB");
            } catch (e) {
                console.log("DB invalid, using default");
                appState.db = UNIVERSITY_DATA; // From data.js
                saveDB();
            }
        } else {
            // Check if UNIVERSITY_DATA is defined (from data.js)
            if (typeof UNIVERSITY_DATA !== 'undefined') {
                appState.db = UNIVERSITY_DATA;
            } else {
                console.error("UNIVERSITY_DATA not found in data.js");
                appState.db = { universities: [] };
            }
            saveDB();
        }
    }

    function saveDB() {
        localStorage.setItem('gpa_app_db_v5', JSON.stringify(appState.db));
    }

    function resetDB() {
        if (confirm("Ești sigur că vrei să resetezi baza de date?")) {
            if (typeof UNIVERSITY_DATA !== 'undefined') {
                appState.db = UNIVERSITY_DATA;
                saveDB();
                location.reload();
            } else {
                alert("Datele implicite nu sunt disponibile.");
            }
        }
    }

    loadDB();

    // --- DOM Elements ---
    const subjectsContainer = document.getElementById('subjects-container');
    const addSubjectBtn = document.getElementById('add-subject-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultDisplay = document.getElementById('result-display');
    const resultValue = resultDisplay.querySelector('.result-value');
    const resultMessage = resultDisplay.querySelector('.result-message');

    // Mode UI
    const modeManualBtn = document.getElementById('mode-manual');
    const modeDbBtn = document.getElementById('mode-database');
    const dbControls = document.getElementById('database-controls');

    // Selects
    const selUni = document.getElementById('select-university');
    const selFac = document.getElementById('select-faculty');
    const selSpec = document.getElementById('select-specialization');
    const selYear = document.getElementById('select-year');
    const selSem = document.getElementById('select-semester');

    // Admin UI
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminPanelModal = document.getElementById('admin-panel-modal');
    const adminPasswordInput = document.getElementById('admin-password');
    const btnLoginSubmit = document.getElementById('btn-login-submit');
    const btnLoginCancel = document.getElementById('btn-login-cancel');
    const adminClose = document.getElementById('admin-close');
    const adminResetDb = document.getElementById('admin-reset-db');
    const adminViewContainer = document.getElementById('admin-view-container');
    const adminFormInputs = document.getElementById('admin-form-inputs');
    const adminSaveBtn = document.getElementById('admin-save-btn');
    const adminTabs = document.querySelectorAll('.tab-btn');

    let currentAdminTab = 'universities';

    // --- UI Logic: Mode Switching ---
    function setMode(mode) {
        appState.mode = mode;
        if (mode === 'manual') {
            modeManualBtn.classList.add('active');
            modeDbBtn.classList.remove('active');
            dbControls.classList.add('hidden');
            addSubjectBtn.style.display = 'flex'; // Show add button
            subjectsContainer.innerHTML = ''; // Clear
            addEmptyRow(); // Add one empty row
        } else {
            modeManualBtn.classList.remove('active');
            modeDbBtn.classList.add('active');
            dbControls.classList.remove('hidden');
            addSubjectBtn.style.display = 'none'; // Hide add button in DB mode
            populateUniversities();
        }
    }

    modeManualBtn.addEventListener('click', () => setMode('manual'));
    modeDbBtn.addEventListener('click', () => setMode('database'));

    // --- UI Logic: Manual List ---
    function addEmptyRow() {
        const row = createRow('', '', '');
        subjectsContainer.appendChild(row);
        animateRow(row);
    }

    function createRow(subject = '', credits = '', grade = '', isReadOnly = false) {
        const row = document.createElement('div');
        row.className = 'subject-row';

        const removeBtnHTML = isReadOnly ? '' : `
            <button class="btn-remove" title="Șterge materia">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>`;

        row.innerHTML = `
            <input type="text" placeholder="Materie" class="input-subject" value="${subject}" ${isReadOnly ? 'readonly' : ''}>
            <input type="number" placeholder="Credite" class="input-credits" min="1" max="30" value="${credits}" ${isReadOnly ? 'readonly' : ''}>
            <input type="number" placeholder="Nota" class="input-grade" min="1" max="10" value="${grade}">
            ${removeBtnHTML}
        `;

        if (!isReadOnly) {
            row.querySelector('.btn-remove').addEventListener('click', () => {
                if (subjectsContainer.children.length > 1) {
                    row.remove();
                } else {
                    row.querySelectorAll('input').forEach(input => input.value = '');
                }
            });
        }

        return row;
    }

    function animateRow(row) {
        row.style.opacity = '0';
        row.style.transform = 'translateY(10px)';
        row.offsetHeight;
        row.style.opacity = '1';
        row.style.transform = 'translateY(0)';
    }

    addSubjectBtn.addEventListener('click', addEmptyRow);
    addEmptyRow();

    // --- UI Logic: Dropbox Population ---
    function populateUniversities() {
        selUni.innerHTML = '<option value="">Alege Universitatea</option>';
        appState.db.universities.forEach(uni => {
            const opt = document.createElement('option');
            opt.value = uni.id;
            opt.textContent = uni.name;
            selUni.appendChild(opt);
        });
        resetSelects(['faculty', 'specialization', 'year', 'semester']);
    }

    function resetSelects(types) {
        if (types.includes('faculty')) { selFac.innerHTML = '<option value="">Alege Facultatea</option>'; selFac.disabled = true; }
        if (types.includes('specialization')) { selSpec.innerHTML = '<option value="">Alege Specializarea</option>'; selSpec.disabled = true; }
        if (types.includes('year')) { selYear.innerHTML = '<option value="">Alege Anul</option>'; selYear.disabled = true; }
        if (types.includes('semester')) { selSem.innerHTML = '<option value="">Alege Semestrul</option>'; selSem.disabled = true; }
    }

    selUni.addEventListener('change', (e) => {
        const uniId = e.target.value;
        appState.currentSelection.uniId = uniId;
        resetSelects(['faculty', 'specialization', 'year', 'semester']);
        if (!uniId) return;

        const uni = appState.db.universities.find(u => u.id === uniId);
        if (uni && uni.faculties) {
            uni.faculties.forEach(fac => {
                const opt = document.createElement('option');
                opt.value = fac.id;
                opt.textContent = fac.name;
                selFac.appendChild(opt);
            });
            selFac.disabled = false;
        }
    });

    selFac.addEventListener('change', (e) => {
        const facId = e.target.value;
        appState.currentSelection.facId = facId;
        resetSelects(['specialization', 'year', 'semester']);
        if (!facId) return;

        const uni = appState.db.universities.find(u => u.id === appState.currentSelection.uniId);
        const fac = uni.faculties.find(f => f.id === facId);
        if (fac && fac.specializations) {
            fac.specializations.forEach(spec => {
                const opt = document.createElement('option');
                opt.value = spec.id;
                opt.textContent = spec.name;
                selSpec.appendChild(opt);
            });
            selSpec.disabled = false;
        }
    });

    selSpec.addEventListener('change', (e) => {
        const specId = e.target.value;
        appState.currentSelection.specId = specId;
        resetSelects(['year', 'semester']);
        if (!specId) return;

        const uni = appState.db.universities.find(u => u.id === appState.currentSelection.uniId);
        const fac = uni.faculties.find(f => f.id === appState.currentSelection.facId);
        const spec = fac.specializations.find(s => s.id === specId);
        if (spec && spec.years) {
            Object.keys(spec.years).forEach(year => {
                const opt = document.createElement('option');
                opt.value = year;
                opt.textContent = `Anul ${year}`;
                selYear.appendChild(opt);
            });
            selYear.disabled = false;
        }
    });

    selYear.addEventListener('change', (e) => {
        const year = e.target.value;
        appState.currentSelection.year = year;
        resetSelects(['semester']);
        if (!year) return;

        // Show Sem 1 and Sem 2
        [1, 2].forEach(sem => {
            const opt = document.createElement('option');
            opt.value = sem;
            opt.textContent = `Semestrul ${sem}`;
            selSem.appendChild(opt);
        });
        selSem.disabled = false;
    });

    selSem.addEventListener('change', (e) => {
        const sem = e.target.value;
        appState.currentSelection.semester = sem;
        if (!sem) return;

        const uni = appState.db.universities.find(u => u.id === appState.currentSelection.uniId);
        const fac = uni.faculties.find(f => f.id === appState.currentSelection.facId);
        const spec = fac.specializations.find(s => s.id === appState.currentSelection.specId);

        // Structure is spec.years[year][semester] -> Array of subjects
        const subjects = spec.years[appState.currentSelection.year]?.[sem];

        subjectsContainer.innerHTML = '';
        if (subjects && Array.isArray(subjects)) {
            subjects.forEach(subj => {
                const row = createRow(subj.name, subj.credits, '', true);
                subjectsContainer.appendChild(row);
                animateRow(row);
            });
        }
    });

    // --- Calculation Logic ---
    calculateBtn.addEventListener('click', () => {
        const rows = document.querySelectorAll('.subject-row');
        let totalCredits = 0;
        let weightedSum = 0;
        let hasError = false;

        rows.forEach(row => {
            const creditsInput = row.querySelector('.input-credits');
            const gradeInput = row.querySelector('.input-grade');
            const credits = parseFloat(creditsInput.value);
            const grade = parseFloat(gradeInput.value);

            if (isNaN(credits) || isNaN(grade)) return;
            if (credits <= 0 || grade < 1 || grade > 10) {
                hasError = true;
                gradeInput.style.borderColor = 'var(--danger-color)';
            } else {
                gradeInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                weightedSum += credits * grade;
                totalCredits += credits;
            }
        });

        if (totalCredits === 0) {
            alert('Te rog completează notele pentru a calcula media.');
            return;
        }

        const gpa = weightedSum / totalCredits;
        resultValue.textContent = gpa.toFixed(2);

        if (gpa >= 9.50) {
            resultMessage.textContent = "Excepțional! Bursă de performanță?";
            resultValue.style.color = "var(--success-color)";
        } else if (gpa >= 8.50) {
            resultMessage.textContent = "Foarte bine! Continuă tot așa.";
            resultValue.style.color = "var(--primary-color)";
        } else if (gpa >= 5.00) {
            resultMessage.textContent = "Ai trecut cu bine.";
            resultValue.style.color = "#fbbf24";
        } else {
            resultMessage.textContent = "Atenție la restanțe!";
            resultValue.style.color = "var(--danger-color)";
        }

        resultDisplay.classList.remove('hidden');
        resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // --- Admin Logic ---
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            adminLoginModal.classList.add('visible');
        });
    }

    if (btnLoginCancel) {
        btnLoginCancel.addEventListener('click', () => {
            adminLoginModal.classList.remove('visible');
            adminPasswordInput.value = '';
        });
    }

    if (btnLoginSubmit) {
        btnLoginSubmit.addEventListener('click', () => {
            const password = adminPasswordInput.value;
            if (password === 'admin123') {
                adminLoginModal.classList.remove('visible');
                adminPanelModal.classList.add('visible');
                renderAdminView();
            } else {
                alert('Parolă incorectă!');
            }
        });
    }

    if (adminClose) {
        adminClose.addEventListener('click', () => {
            adminPanelModal.classList.remove('visible');
        });
    }

    if (adminResetDb) {
        adminResetDb.addEventListener('click', resetDB);
    }

    // Admin Tabs
    adminTabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            adminTabs.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentAdminTab = e.target.dataset.tab;
            renderAdminView();
        });
    });

    function renderAdminView() {
        adminViewContainer.innerHTML = '';
        adminFormInputs.innerHTML = '';

        const listContainer = document.createElement('div');
        listContainer.className = 'admin-item-list';

        if (currentAdminTab === 'universities') {
            appState.db.universities.forEach(uni => {
                const item = document.createElement('div');
                item.className = 'admin-list-item';
                item.textContent = uni.name;
                listContainer.appendChild(item);
            });

            adminFormInputs.innerHTML = `
                <p>Editează structura bazei de date (JSON):</p>
                <textarea id="db-json-editor" style="width:100%; height:300px; background:rgba(0,0,0,0.3); color:white; border:1px solid #444; padding:10px; font-family:monospace;">${JSON.stringify(appState.db, null, 2)}</textarea>
            `;

            adminSaveBtn.onclick = () => {
                try {
                    const newDb = JSON.parse(document.getElementById('db-json-editor').value);
                    appState.db = newDb;
                    saveDB();
                    if (appState.mode === 'database') {
                        setMode('database');
                    }
                    alert('Baza de date actualizată!');
                } catch (e) {
                    alert('Eroare JSON: ' + e.message);
                }
            };
        } else {
            listContainer.innerHTML = '<p style="color:var(--text-muted); padding:1rem;">Folosește editorul JSON din tab-ul "Universități" pentru a edita structura completă.</p>';
        }

        adminViewContainer.appendChild(listContainer);
    }
});
