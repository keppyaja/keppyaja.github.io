(() => {
    'use strict';

    const results = document.querySelector('.archive-page #archive-results');
    if (!results || results.dataset.initialized) return;

    const pageSize = 6;
    const normalize = value => value.normalize('NFKC').toLocaleLowerCase('id').trim();
    const groups = Array.from(results.querySelectorAll('.writeup-comp')).map(element => ({
        element,
        id: element.id,
        title: element.querySelector('h2').textContent.trim(),
        categories: Array.from(element.querySelectorAll('.writeup-category'))
    }));
    const entries = groups.flatMap(group => group.categories.flatMap(category => {
        const name = category.querySelector('h3').textContent.trim();
        return Array.from(category.querySelectorAll('.archive-row')).map(row => ({
            row,
            group: group.id,
            category: name,
            text: normalize(`${row.textContent} ${name} ${group.title}`)
        }));
    }));
    if (!entries.length) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'archive-toolbar';
    toolbar.setAttribute('role', 'search');
    toolbar.setAttribute('aria-label', 'Cari catatan CTF');
    toolbar.innerHTML = `
        <div class="archive-search">
            <label for="archive-query">Cari catatan</label>
            <input id="archive-query" type="search" placeholder="Judul, kategori, atau kompetisi" aria-controls="archive-results">
        </div>
        <div class="archive-filter">
            <label for="archive-category">Kategori</label>
            <select id="archive-category" aria-controls="archive-results">
                <option value="">Semua kategori</option>
            </select>
        </div>
        <div class="archive-filter">
            <label for="archive-competition">Kompetisi</label>
            <select id="archive-competition" aria-controls="archive-results">
                <option value="">Semua kompetisi</option>
            </select>
        </div>`;

    const query = toolbar.querySelector('#archive-query');
    const categorySelect = toolbar.querySelector('#archive-category');
    const competitionSelect = toolbar.querySelector('#archive-competition');
    const addOption = (select, value, label) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        select.append(option);
    };
    Array.from(new Set(entries.map(entry => entry.category)))
        .sort((a, b) => a.localeCompare(b, 'id'))
        .forEach(category => addOption(categorySelect, category, category));
    groups.forEach(group => addOption(competitionSelect, group.id, group.title));

    const status = document.createElement('p');
    status.className = 'archive-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');

    const empty = document.createElement('p');
    empty.className = 'archive-empty';
    empty.textContent = 'Tidak ada catatan yang cocok. Coba kata lain atau pilih semua kategori dan kompetisi.';
    empty.hidden = true;

    const pagination = document.createElement('nav');
    pagination.className = 'archive-pagination';
    pagination.setAttribute('aria-label', 'Halaman catatan CTF');
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.textContent = 'Sebelumnya';
    previous.setAttribute('aria-label', 'Halaman sebelumnya');
    previous.setAttribute('aria-controls', 'archive-results');
    const pageLabel = document.createElement('span');
    pageLabel.className = 'archive-page-number';
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = 'Berikutnya';
    next.setAttribute('aria-label', 'Halaman berikutnya');
    next.setAttribute('aria-controls', 'archive-results');
    pagination.append(previous, pageLabel, next);

    let page = 1;
    const render = () => {
        const terms = normalize(query.value).split(/\s+/).filter(Boolean);
        const matches = entries.filter(entry =>
            (!categorySelect.value || entry.category === categorySelect.value) &&
            (!competitionSelect.value || entry.group === competitionSelect.value) &&
            terms.every(term => entry.text.includes(term))
        );
        const showAllCompetitionNotes = Boolean(competitionSelect.value) &&
            !categorySelect.value && !terms.length;
        const currentPageSize = showAllCompetitionNotes ? matches.length || 1 : pageSize;
        const pages = Math.ceil(matches.length / currentPageSize);
        page = Math.max(1, Math.min(page, pages || 1));
        const start = (page - 1) * currentPageSize;
        const visible = new Set(matches.slice(start, start + currentPageSize));
        entries.forEach(entry => { entry.row.hidden = !visible.has(entry); });
        groups.forEach(group => {
            group.categories.forEach(category => {
                category.hidden = !Array.from(category.querySelectorAll('.archive-row'))
                    .some(row => !row.hidden);
            });
            group.element.hidden = group.categories.every(category => category.hidden);
        });
        previous.disabled = page === 1 || showAllCompetitionNotes;
        next.disabled = page >= pages || showAllCompetitionNotes;
        pagination.hidden = showAllCompetitionNotes;
        pageLabel.textContent = pages ? `Halaman ${page} dari ${pages}` : 'Halaman 0 dari 0';
        status.textContent = matches.length
            ? showAllCompetitionNotes
                ? `Menampilkan semua ${matches.length} catatan dari kompetisi yang dipilih.`
                : `Menampilkan ${start + 1}–${Math.min(start + currentPageSize, matches.length)} dari ${matches.length} catatan. Halaman ${page} dari ${pages}.`
            : '0 catatan ditemukan.';
        empty.hidden = matches.length !== 0;
    };

    const resetPage = () => {
        page = 1;
        render();
    };
    const applyCompetition = id => {
        const group = groups.find(item => item.id === id);
        competitionSelect.value = group ? group.id : '';
        query.value = '';
        categorySelect.value = '';
        resetPage();
        if (group) {
            window.requestAnimationFrame(() => group.element.scrollIntoView({ block: 'start' }));
        }
    };

    query.addEventListener('input', resetPage);
    categorySelect.addEventListener('change', resetPage);
    competitionSelect.addEventListener('change', () => {
        applyCompetition(competitionSelect.value);
    });
    previous.addEventListener('click', () => {
        if (!previous.disabled) {
            page -= 1;
            render();
        }
    });
    next.addEventListener('click', () => {
        if (!next.disabled) {
            page += 1;
            render();
        }
    });
    document.querySelectorAll('.archive-competitions a').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            applyCompetition(link.dataset.competition);
        });
    });

    results.before(toolbar, status);
    results.after(empty, pagination);
    results.dataset.initialized = 'true';
    const initialCompetition = new URLSearchParams(window.location.search).get('competition');
    applyCompetition(initialCompetition || '');
})();
