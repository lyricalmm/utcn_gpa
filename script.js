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

    // Manual Update from data.js
    function updateDB() {
        if (typeof UNIVERSITY_DATA !== 'undefined') {
            if (confirm("Această acțiune va reîncărca datele din fișierul sursă și va șterge orice modificare locală. Continui?")) {
                appState.db = UNIVERSITY_DATA;
                saveDB();
                alert("Baza de date a fost actualizată!");
                location.reload();
            }
        } else {
            alert("Fișierul de date (data.js) nu a fost găsit.");
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

    // Update DB Button
    const updateDbBtn = document.getElementById('update-db-btn');

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

    // --- Advanced Admin Logic ---
    let adminPath = []; // Array of objects: { type: 'uni'|'fac'|'spec'|'year'|'sem', id: '...', name: '...' }
    let currentEditItem = null; // { type, id, data } for editing

    // Elements
    const adminBreadcrumbs = document.getElementById('admin-breadcrumbs');
    const adminListView = document.getElementById('admin-list-view');
    const adminEditorView = document.getElementById('admin-editor-view');
    const editorTitle = document.getElementById('editor-title');
    const editorInputs = document.getElementById('editor-inputs');
    const editorSaveBtn = document.getElementById('editor-save-btn');
    const editorCancelBtn = document.getElementById('editor-cancel-btn');

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
                resetAdminView();
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

    if (updateDbBtn) {
        updateDbBtn.addEventListener('click', updateDB);
    }

    if (editorCancelBtn) {
        editorCancelBtn.addEventListener('click', () => {
            adminEditorView.classList.add('hidden');
        });
    }

    editorSaveBtn.addEventListener('click', saveEditorChanges);

    function resetAdminView() {
        adminPath = [];
        renderAdmin();
    }

    function renderAdmin() {
        renderBreadcrumbs();
        renderList();
        adminEditorView.classList.add('hidden');
    }

    function renderBreadcrumbs() {
        adminBreadcrumbs.innerHTML = '';

        // Root crumb
        const rootCrumb = document.createElement('span');
        rootCrumb.className = `crumb ${adminPath.length === 0 ? 'active' : ''}`;
        rootCrumb.textContent = 'Universități';
        rootCrumb.onclick = () => {
            adminPath = [];
            renderAdmin();
        };
        adminBreadcrumbs.appendChild(rootCrumb);

        // Path crumbs
        adminPath.forEach((item, index) => {
            const crumb = document.createElement('span');
            crumb.className = `crumb ${index === adminPath.length - 1 ? 'active' : ''}`;
            crumb.textContent = item.name;
            crumb.onclick = () => {
                adminPath = adminPath.slice(0, index + 1);
                renderAdmin();
            };
            adminBreadcrumbs.appendChild(crumb);
        });
    }

    function getDataAtCurrentLevel() {
        let currentData = appState.db.universities;
        let parent = appState.db;

        if (adminPath.length > 0) {
            const uni = appState.db.universities.find(u => u.id === adminPath[0].id);
            if (!uni) return null;
            if (adminPath.length === 1) return { list: uni.faculties || [], type: 'fac', parent: uni };

            const fac = uni.faculties.find(f => f.id === adminPath[1].id);
            if (!fac) return null;
            if (adminPath.length === 2) return { list: fac.specializations || [], type: 'spec', parent: fac };

            const spec = fac.specializations.find(s => s.id === adminPath[2].id);
            if (!spec) return null;
            // Years are objects, convert to array for consistent handling logic
            // But 'years' is an object keyed by year number.
            if (adminPath.length === 3) {
                const yearsList = Object.keys(spec.years || {}).map(y => ({ id: y, name: `Anul ${y}` }));
                return { list: yearsList, type: 'year', parent: spec };
            }

            const yearData = spec.years[adminPath[3].id];
            if (!yearData) return null;
            if (adminPath.length === 4) {
                // Semesters
                const semList = Object.keys(yearData || {}).map(s => ({ id: s, name: `Semestrul ${s}` }));
                return { list: semList, type: 'sem', parent: yearData };
            }

            const semesterSubjects = yearData[adminPath[4].id]; // Array of subjects
            return { list: semesterSubjects || [], type: 'subj', parent: yearData, semId: adminPath[4].id };
        }

        return { list: appState.db.universities, type: 'uni', parent: appState.db };
    }

    function renderList() {
        adminListView.innerHTML = '';
        const levelData = getDataAtCurrentLevel();
        if (!levelData) {
            adminListView.innerHTML = '<p>Eroare la încărcarea datelor.</p>';
            return;
        }

        const { list, type } = levelData;

        if (list.length === 0) {
            adminListView.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Nu există date aici.</p>';
        }

        list.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'admin-list-item';

            // Name logic
            let name = item.name;
            if (type === 'subj') name = `${item.name} (${item.credits} credite)`;

            el.innerHTML = `
                <div class="item-name" onclick="enterItem('${item.id}', '${item.name ? item.name.replace(/'/g, "\\'") : ''}')">
                    ${type !== 'subj' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>' : ''}
                    <span>${name}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-icon edit" title="Editează"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                    <button class="btn-icon delete" title="Șterge"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>
                </div>
            `;

            // Interaction handlers
            // Prevent click on name triggering if clicking actions
            el.querySelector('.item-name').onclick = (e) => {
                if (type === 'subj') {
                    openEditor('edit', item, index);
                } else {
                    enterItem(item.id, item.name);
                }
            }

            el.querySelector('.edit').onclick = (e) => { e.stopPropagation(); openEditor('edit', item, index); };
            el.querySelector('.delete').onclick = (e) => { e.stopPropagation(); deleteItem(index); };

            adminListView.appendChild(el);
        });

        // Add Button
        const addBtn = document.createElement('div');
        addBtn.className = 'admin-add-btn';
        addBtn.innerHTML = '+ Adaugă ' + getLevelName(type);
        addBtn.onclick = () => openEditor('add');
        adminListView.appendChild(addBtn);
    }

    window.enterItem = function (id, name) {
        // Push to breadcrumb
        adminPath.push({ id: id, name: name });
        renderAdmin();
    };

    function getLevelName(type) {
        switch (type) {
            case 'uni': return 'Universitate';
            case 'fac': return 'Facultate';
            case 'spec': return 'Specializare';
            case 'year': return 'An';
            case 'sem': return 'Semestru';
            case 'subj': return 'Materie';
            default: return 'Element';
        }
    }

    function deleteItem(index) {
        if (!confirm("Ești sigur că vrei să ștergi acest element?")) return;

        const levelData = getDataAtCurrentLevel();
        const { list, type, parent, semId } = levelData;

        if (Array.isArray(list)) {
            list.splice(index, 1);
        } else {
            // It's an object property delete? No, getDataAtCurrentLevel returns list as array for year/sem
            // But we need to update the actual parent object if it was a mapped array
            // Special handling for Year and Sem which are object keys in the DB
        }

        // Apply deletion to DB reference
        if (type === 'year') {
            // Parent is spec, list is array of {id, name}
            // We need to delete spec.years[list[index].id]
            delete parent.years[list[index].id];
        } else if (type === 'sem') {
            delete parent[list[index].id];
        } else {
            // Valid for uni, fac, spec, subj where 'list' IS the reference to the array in DB
            // (Subjects is array, Uni is array, Fac is array, Spec is array)
            // Wait, getDataAtCurrentLevel returns the actual array for those.
        }

        saveDB();
        renderAdmin();
        // Refresh main UI if needed
        if (appState.mode === 'database') setMode('database');
    }

    function openEditor(mode, item = null, index = null) {
        const levelData = getDataAtCurrentLevel();
        const { type } = levelData;

        currentEditItem = { mode, type, index, item };

        editorTitle.textContent = (mode === 'add' ? 'Adaugă ' : 'Editează ') + getLevelName(type);
        editorInputs.innerHTML = '';

        if (type === 'subj') {
            createInput('Nume Materie', 'text', 'name', item ? item.name : '');
            createInput('Credite', 'number', 'credits', item ? item.credits : '');
        } else {
            createInput('Nume', 'text', 'name', item ? item.name : '');
            if (type !== 'sem' && type !== 'year') {
                createInput('ID (unic)', 'text', 'id', item ? item.id : '', mode === 'edit'); // Lock ID on edit if complex
            } else {
                // Year/Sem ID is the number itself 1, 2, 3...
                createInput('Număr (ex: 1, 2)', 'number', 'id', item ? item.id : '', mode === 'edit');
            }
        }

        adminEditorView.classList.remove('hidden');
    }

    function createInput(label, type, key, value, disabled = false) {
        const div = document.createElement('div');
        div.className = 'editor-input-group';
        div.innerHTML = `
            <label>${label}</label>
            <input type="${type}" data-key="${key}" value="${value}" ${disabled ? 'disabled' : ''}>
        `;
        editorInputs.appendChild(div);
    }

    function saveEditorChanges() {
        const inputs = editorInputs.querySelectorAll('input');
        const newData = {};
        inputs.forEach(input => newData[input.dataset.key] = input.value);

        const { mode, type, index, item } = currentEditItem;
        const levelData = getDataAtCurrentLevel();
        const { list, parent } = levelData;

        // Validation
        if (!newData.name && !newData.id) { alert("Completeaza campurile!"); return; }

        if (type === 'subj') {
            const subject = { name: newData.name, credits: parseInt(newData.credits) };
            if (mode === 'add') {
                list.push(subject);
            } else {
                list[index] = subject;
            }
        } else if (type === 'uni' || type === 'fac' || type === 'spec') {
            if (mode === 'add') {
                const newObj = { id: newData.id, name: newData.name };
                if (type === 'uni') newObj.faculties = [];
                if (type === 'fac') newObj.specializations = [];
                if (type === 'spec') newObj.years = {};
                list.push(newObj);
            } else {
                list[index].name = newData.name;
                // We don't change ID for simplicity, or we need to check collision
            }
        } else if (type === 'year') {
            // Parent is spec.years
            const yearNum = newData.id;
            if (mode === 'add') {
                if (parent.years[yearNum]) { alert("Anul există deja!"); return; }
                parent.years[yearNum] = {};
            } else {
                // Rename year? Complex because key is used. Only allow name change? 
                // Years don't really have names in data, just "years: { 1: ... }"
                // But our UI shows "Anul 1". 
                // If we want to change year ID, we have to move data.
                // For now, let's say we only add years, not edit ID easily.
                // Actually map logic used 'id' as the key.
                alert("Nu poți edita numărul anului momentan. Șterge și adaugă din nou.");
                return;
            }
        } else if (type === 'sem') {
            // Parent is year (object with keys 1, 2)
            const semNum = newData.id;
            if (mode === 'add') {
                if (parent[semNum]) { alert("Semestrul există deja!"); return; }
                parent[semNum] = [];
            } else {
                alert("Nu poți edita numărul semestrului. Șterge și adaugă din nou.");
                return;
            }
        }

        saveDB();
        adminEditorView.classList.add('hidden');
        renderAdmin();
        if (appState.mode === 'database') setMode('database');
    }
});
