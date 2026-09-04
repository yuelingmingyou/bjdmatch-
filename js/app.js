const app = {
    currentHairFilter: 'all',
    queryMode: 'byFace',
    
    init() {
        this.renderFaces();
        this.renderHairs();
        this.renderMatches();
        this.populateSelects();
        this.populateEyeSizes();
    },
    
    switchTab(name, btn) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${name}`).classList.add('active');
        if (name === 'matches') this.populateMatchSelects();
    },
    
    esc(s) {
        if (!s) return '';
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    },
    
    // faces
    saveFace(e) {
        e.preventDefault();
        DataStore.saveFace({
            id: document.getElementById('faceId').value || null,
            name: document.getElementById('faceName').value.trim(),
            brand: document.getElementById('faceBrand').value.trim(),
            eyeSize: parseFloat(document.getElementById('eyeSize').value),
            headSize: document.getElementById('headSize').value ? parseFloat(document.getElementById('headSize').value) : null,
            note: document.getElementById('faceNote').value.trim()
        });
        this.resetForm('faceForm');
        this.renderFaces();
        this.populateSelects();
        this.populateEyeSizes();
        document.getElementById('faceSubmitBtn').textContent = '添加';
    },
    
    editFace(id) {
        const f = DataStore.getFace(id);
        if (!f) return;
        document.getElementById('faceId').value = f.id;
        document.getElementById('faceName').value = f.name;
        document.getElementById('faceBrand').value = f.brand || '';
        document.getElementById('eyeSize').value = f.eyeSize;
        document.getElementById('headSize').value = f.headSize || '';
        document.getElementById('faceNote').value = f.note || '';
        document.getElementById('faceSubmitBtn').textContent = '更新';
    },
    
    deleteFace(id) {
        if (!confirm('删除？')) return;
        DataStore.deleteFace(id);
        this.renderFaces();
    },
    
    renderFaces(faces) {
        faces = faces || DataStore.getFaces();
        const el = document.getElementById('faceList');
        
        if (!faces.length) {
            el.innerHTML = '<div class="empty">暂无脸片</div>';
            return;
        }
        
        el.innerHTML = faces.map(f => `
            <div class="card">
                <div class="card-main">
                    <div class="card-title">${this.esc(f.name)}${f.brand ? ` <span style="color:var(--text-lighter)">· ${this.esc(f.brand)}</span>` : ''}</div>
                    <div class="card-meta">
                        <span class="card-tag eye">${f.eyeSize}mm</span>
                        ${f.headSize ? `<span class="card-tag head">${f.headSize}cm</span>` : ''}
                        ${f.note ? `<span>${this.esc(f.note)}</span>` : ''}
                    </div>
                </div>
                <div class="card-actions">
                    <button onclick="app.editFace('${f.id}')">编辑</button>
                    <button class="danger" onclick="app.deleteFace('${f.id}')">删除</button>
                </div>
            </div>
        `).join('');
    },
    
    filterFaces() {
        let faces = DataStore.getFaces();
        const eyeSize = document.getElementById('eyeSizeFilter').value;
        const search = document.getElementById('faceSearch').value.toLowerCase().trim();
        if (eyeSize) faces = faces.filter(f => f.eyeSize == eyeSize);
        if (search) faces = faces.filter(f => 
            f.name.toLowerCase().includes(search) || 
            (f.brand && f.brand.toLowerCase().includes(search))
        );
        this.renderFaces(faces);
    },
    
    populateEyeSizes() {
        const sel = document.getElementById('eyeSizeFilter');
        const val = sel.value;
        const sizes = DataStore.getEyeSizes();
        sel.innerHTML = '<option value="">全部眼珠</option>' + sizes.map(s => `<option value="${s}">${s}mm</option>`).join('');
        sel.value = val;
    },
    
    // hairs
    saveHair(e) {
        e.preventDefault();
        DataStore.saveHair({
            id: document.getElementById('hairId').value || null,
            name: document.getElementById('hairName').value.trim(),
            type: document.getElementById('hairType').value,
            brand: document.getElementById('hairBrand').value.trim(),
            headSize: document.getElementById('hairHeadSize').value ? parseFloat(document.getElementById('hairHeadSize').value) : null,
            note: document.getElementById('hairNote').value.trim()
        });
        this.resetForm('hairForm');
        this.renderHairs();
        this.populateSelects();
        document.getElementById('hairSubmitBtn').textContent = '添加';
    },
    
    editHair(id) {
        const h = DataStore.getHair(id);
        if (!h) return;
        document.getElementById('hairId').value = h.id;
        document.getElementById('hairName').value = h.name;
        document.getElementById('hairType').value = h.type;
        document.getElementById('hairBrand').value = h.brand || '';
        document.getElementById('hairHeadSize').value = h.headSize || '';
        document.getElementById('hairNote').value = h.note || '';
        document.getElementById('hairSubmitBtn').textContent = '更新';
    },
    
    deleteHair(id) {
        if (!confirm('删除？')) return;
        DataStore.deleteHair(id);
        this.renderHairs();
    },
    
    renderHairs() {
        let hairs = DataStore.getHairs(this.currentHairFilter);
        const el = document.getElementById('hairList');
        
        if (!hairs.length) {
            el.innerHTML = '<div class="empty">暂无配件</div>';
            return;
        }
        
        const typeNames = { front: '前', back: '后', set: '套' };
        
        el.innerHTML = hairs.map(h => `
            <div class="card">
                <div class="card-type ${h.type}">${typeNames[h.type]}</div>
                <div class="card-main">
                    <div class="card-title">${this.esc(h.name)}${h.brand ? ` <span style="color:var(--text-lighter)">· ${this.esc(h.brand)}</span>` : ''}</div>
                    <div class="card-meta">
                        ${h.headSize ? `<span>头围 ${h.headSize}cm</span>` : ''}
                        ${h.note ? `<span>${this.esc(h.note)}</span>` : ''}
                    </div>
                </div>
                <div class="card-actions">
                    <button onclick="app.editHair('${h.id}')">编辑</button>
                    <button class="danger" onclick="app.deleteHair('${h.id}')">删除</button>
                </div>
            </div>
        `).join('');
    },
    
    filterHairs(type, btn) {
        this.currentHairFilter = type;
        document.querySelectorAll('.type-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderHairs();
    },
    
    // matches
    populateSelects() {
        const faces = DataStore.getFaces();
        const makeOpts = (items, empty) => `<option value="">${empty}</option>` + items.map(i => 
            `<option value="${i.id}">${this.esc(i.name)}</option>`
        ).join('');
        
        const mf = document.getElementById('matchFace');
        const qf = document.getElementById('queryFace');
        if (mf) mf.innerHTML = makeOpts(faces, '选择脸片');
        if (qf) qf.innerHTML = makeOpts(faces, '选择...');
    },
    
    populateMatchSelects() {
        this.populateSelects();
        const hairs = DataStore.getHairs();
        const fronts = hairs.filter(h => h.type === 'front' || h.type === 'set');
        const backs = hairs.filter(h => h.type === 'back' || h.type === 'set');
        const makeOpts = (items, empty) => `<option value="">${empty}</option>` + items.map(i => `<option value="${i.id}">${this.esc(i.name)}</option>`).join('');
        
        document.getElementById('matchFrontHair').innerHTML = makeOpts(fronts, '前发');
        document.getElementById('matchBackHair').innerHTML = makeOpts(backs, '后发');
        document.getElementById('queryHair').innerHTML = makeOpts(hairs, '选择...');
    },
    
    setQueryMode(mode, btn) {
        this.queryMode = mode;
        document.querySelectorAll('.query-toggle button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('queryFace').style.display = mode === 'byFace' ? 'block' : 'none';
        document.getElementById('queryHair').style.display = mode === 'byHair' ? 'block' : 'none';
        document.getElementById('matchResults').innerHTML = '';
    },
    
    saveMatch(e) {
        e.preventDefault();
        const faceId = document.getElementById('matchFace').value;
        const frontId = document.getElementById('matchFrontHair').value;
        const backId = document.getElementById('matchBackHair').value;
        const result = document.querySelector('input[name="matchResult"]:checked')?.value;
        
        if (!faceId || !result) { alert('请填写必填项'); return; }
        if (!frontId && !backId) { alert('请至少选择一个配件'); return; }
        
        DataStore.saveMatch({
            faceId,
            frontHairId: frontId || '',
            backHairId: backId || '',
            result,
            detail: document.getElementById('matchDetail').value.trim()
        });
        this.resetForm('matchForm');
        this.renderMatches();
    },
    
    queryMatches() {
        const faceId = document.getElementById('queryFace').value;
        const el = document.getElementById('matchResults');
        if (!faceId) { el.innerHTML = ''; return; }
        
        const matches = DataStore.getMatchesByFace(faceId);
        const face = DataStore.getFace(faceId);
        
        if (!matches.length) {
            el.innerHTML = '<div class="empty">暂无记录</div>';
            return;
        }
        
        const order = { perfect: 0, good: 1, unknown: 2, poor: 3 };
        matches.sort((a, b) => order[a.result] - order[b.result]);
        
        el.innerHTML = matches.map(m => this.makeResultCard(m, face, DataStore.getHair(m.frontHairId), DataStore.getHair(m.backHairId))).join('');
    },
    
    queryByHair() {
        const hairId = document.getElementById('queryHair').value;
        const el = document.getElementById('matchResults');
        if (!hairId) { el.innerHTML = ''; return; }
        
        const matches = DataStore.getMatchesByHair(hairId);
        if (!matches.length) {
            el.innerHTML = '<div class="empty">暂无记录</div>';
            return;
        }
        
        const order = { perfect: 0, good: 1, unknown: 2, poor: 3 };
        matches.sort((a, b) => order[a.result] - order[b.result]);
        
        el.innerHTML = matches.map(m => this.makeResultCard(m, DataStore.getFace(m.faceId),
            m.frontHairId === hairId ? DataStore.getHair(hairId) : DataStore.getHair(m.frontHairId),
            m.backHairId === hairId ? DataStore.getHair(hairId) : DataStore.getHair(m.backHairId)
        )).join('');
    },
    
    makeResultCard(match, face, frontHair, backHair) {
        const parts = [];
        if (frontHair) parts.push(`前 ${this.esc(frontHair.name)}`);
        if (backHair) parts.push(`后 ${this.esc(backHair.name)}`);
        
        return `
            <div class="result-card ${match.result}">
                <div class="result-dot"></div>
                <div class="result-main">
                    <div class="result-name">${this.esc(face.name)}${parts.length ? ' + ' + parts.join(' / ') : ''}</div>
                    ${match.detail ? `<div class="result-detail">${this.esc(match.detail)}</div>` : ''}
                </div>
            </div>
        `;
    },
    
    renderMatches() {
        const matches = DataStore.getMatches();
        const el = document.getElementById('matchList');
        
        if (!matches.length) {
            el.innerHTML = '<div class="empty">暂无记录</div>';
            return;
        }
        
        const sorted = [...matches].sort((a, b) => b.created - a.created);
        
        el.innerHTML = sorted.map(m => {
            const face = DataStore.getFace(m.faceId);
            const fh = m.frontHairId ? DataStore.getHair(m.frontHairId) : null;
            const bh = m.backHairId ? DataStore.getHair(m.backHairId) : null;
            const parts = [];
            if (fh) parts.push(`前:${this.esc(fh.name)}`);
            if (bh) parts.push(`后:${this.esc(bh.name)}`);
            
            return `
                <div class="match-item">
                    <div class="match-status ${m.result}"></div>
                    <div class="match-body">
                        <div class="match-title">${this.esc(face.name)}</div>
                        <div class="match-parts">${parts.join(' / ')}</div>
                        ${m.detail ? `<div class="match-note">${this.esc(m.detail)}</div>` : ''}
                    </div>
                    <button onclick="app.deleteMatch('${m.id}')" class="btn-ghost" style="height:32px;padding:0 12px;font-size:12px">删除</button>
                </div>
            `;
        }).join('');
    },
    
    deleteMatch(id) {
        if (!confirm('删除？')) return;
        DataStore.deleteMatch(id);
        this.renderMatches();
    },
    
    // utils
    resetForm(id) {
        document.getElementById(id).reset();
        document.getElementById(id).querySelector('input[type="hidden"]').value = '';
    },
    
    cancelEdit(type) {
        this.resetForm(type + 'Form');
        document.getElementById(type + 'SubmitBtn').textContent = '添加';
    },
    
    exportData() {
        const blob = new Blob([DataStore.export()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bjd-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    importData(input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            if (DataStore.import(e.target.result)) {
                this.init();
            } else {
                alert('导入失败');
            }
        };
        reader.readAsText(file);
        input.value = '';
    },
    
    clearAll() {
        if (!confirm('清空所有数据？')) return;
        DataStore.clear();
        this.init();
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());

