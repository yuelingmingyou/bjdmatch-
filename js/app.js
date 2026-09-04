const app = {
    currentHairFilter: 'all',
    queryMode: 'byFace',
    
    init() {
        this.updateStats();
        this.renderFaces();
        this.renderHairs();
        this.renderMatches();
        this.populateSelects();
        this.populateEyeSizes();
    },
    
    // tabs
    switchTab(name, btn) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${name}`).classList.add('active');
        if (name === 'matches') this.populateMatchSelects();
    },
    
    // stats
    updateStats() {
        const d = DataStore.getAll();
        document.getElementById('faceCount').textContent = d.faces.length;
        document.getElementById('frontHairCount').textContent = d.hairs.filter(h => h.type === 'front' || h.type === 'set').length;
        document.getElementById('backHairCount').textContent = d.hairs.filter(h => h.type === 'back' || h.type === 'set').length;
        document.getElementById('matchCount').textContent = d.matches.length;
    },
    
    // faces
    saveFace(e) {
        e.preventDefault();
        const face = {
            id: document.getElementById('faceId').value || null,
            name: document.getElementById('faceName').value.trim(),
            brand: document.getElementById('faceBrand').value.trim(),
            eyeSize: parseFloat(document.getElementById('eyeSize').value),
            headSize: document.getElementById('headSize').value ? parseFloat(document.getElementById('headSize').value) : null,
            note: document.getElementById('faceNote').value.trim()
        };
        DataStore.saveFace(face);
        this.resetForm('faceForm');
        this.renderFaces();
        this.updateStats();
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    deleteFace(id) {
        if (!confirm('删除脸片？相关匹配也会被删除。')) return;
        DataStore.deleteFace(id);
        this.renderFaces();
        this.updateStats();
    },
    
    renderFaces(faces) {
        faces = faces || DataStore.getFaces();
        const el = document.getElementById('faceList');
        document.getElementById('faceListCount').textContent = faces.length;
        
        if (!faces.length) {
            el.innerHTML = '<div class="empty-hint">暂无脸片</div>';
            return;
        }
        
        el.innerHTML = faces.map(f => `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">${this.esc(f.name)}</span>
                </div>
                <div class="card-body">
                    ${f.brand ? `<div>${this.esc(f.brand)}</div>` : ''}
                    <div>眼珠 ${f.eyeSize}mm${f.headSize ? ` / 头围 ${f.headSize}cm` : ''}</div>
                    ${f.note ? `<div style="margin-top:4px;color:var(--text-dark)">${this.esc(f.note)}</div>` : ''}
                </div>
                <div class="card-tags">
                    <span class="tag accent">${f.eyeSize}mm</span>
                    ${f.headSize ? `<span class="tag">${f.headSize}cm</span>` : ''}
                </div>
                <div class="card-actions">
                    <button onclick="app.editFace('${f.id}')" class="btn btn-secondary">编辑</button>
                    <button onclick="app.deleteFace('${f.id}')" class="btn btn-secondary btn-danger">删除</button>
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
        sel.innerHTML = '<option value="">全部</option>' + sizes.map(s => `<option value="${s}">${s}mm</option>`).join('');
        sel.value = val;
    },
    
    // hairs
    saveHair(e) {
        e.preventDefault();
        const hair = {
            id: document.getElementById('hairId').value || null,
            name: document.getElementById('hairName').value.trim(),
            type: document.getElementById('hairType').value,
            brand: document.getElementById('hairBrand').value.trim(),
            headSize: document.getElementById('hairHeadSize').value ? parseFloat(document.getElementById('hairHeadSize').value) : null,
            note: document.getElementById('hairNote').value.trim()
        };
        DataStore.saveHair(hair);
        this.resetForm('hairForm');
        this.renderHairs();
        this.updateStats();
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    deleteHair(id) {
        if (!confirm('删除配件？相关匹配也会被删除。')) return;
        DataStore.deleteHair(id);
        this.renderHairs();
        this.updateStats();
    },
    
    renderHairs() {
        let hairs = DataStore.getHairs(this.currentHairFilter);
        const el = document.getElementById('hairList');
        
        if (!hairs.length) {
            el.innerHTML = '<div class="empty-hint">暂无配件</div>';
            return;
        }
        
        const typeNames = { front: '前发', back: '后发', set: '套装' };
        
        el.innerHTML = hairs.map(h => `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">${this.esc(h.name)}</span>
                    <span class="card-type ${h.type}">${typeNames[h.type]}</span>
                </div>
                <div class="card-body">
                    ${h.brand ? `<div>${this.esc(h.brand)}</div>` : ''}
                    ${h.headSize ? `<div>参考头围 ${h.headSize}cm</div>` : ''}
                    ${h.note ? `<div style="margin-top:4px;color:var(--text-dark)">${this.esc(h.note)}</div>` : ''}
                </div>
                <div class="card-actions">
                    <button onclick="app.editHair('${h.id}')" class="btn btn-secondary">编辑</button>
                    <button onclick="app.deleteHair('${h.id}')" class="btn btn-secondary btn-danger">删除</button>
                </div>
            </div>
        `).join('');
    },
    
    filterHairs(type, btn) {
        this.currentHairFilter = type;
        document.querySelectorAll('.type-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderHairs();
    },
    
    // matches
    populateSelects() {
        const faces = DataStore.getFaces();
        const hairs = DataStore.getHairs();
        const makeOpts = (items, empty) => `<option value="">${empty}</option>` + items.map(i => 
            `<option value="${i.id}">${this.esc(i.name)}${i.eyeSize ? ` (${i.eyeSize}mm)` : i.headSize ? ` (${i.headSize}cm)` : ''}</option>`
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
        
        document.getElementById('matchFrontHair').innerHTML = makeOpts(fronts, '无');
        document.getElementById('matchBackHair').innerHTML = makeOpts(backs, '无');
        document.getElementById('queryHair').innerHTML = makeOpts(hairs, '选择...');
    },
    
    setQueryMode(mode, btn) {
        this.queryMode = mode;
        document.querySelectorAll('.query-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('queryFaceField').style.display = mode === 'byFace' ? 'block' : 'none';
        document.getElementById('queryHairField').style.display = mode === 'byHair' ? 'block' : 'none';
        document.getElementById('matchResults').innerHTML = '<div class="empty-hint">选择上方条件查看结果</div>';
    },
    
    saveMatch(e) {
        e.preventDefault();
        const faceId = document.getElementById('matchFace').value;
        const frontId = document.getElementById('matchFrontHair').value;
        const backId = document.getElementById('matchBackHair').value;
        const result = document.querySelector('input[name="matchResult"]:checked')?.value;
        const detail = document.getElementById('matchDetail').value.trim();
        
        if (!faceId || !result) { alert('请填写必填项'); return; }
        if (!frontId && !backId) { alert('请至少选择一个配件'); return; }
        
        DataStore.saveMatch({ faceId, frontHairId: frontId || '', backHairId: backId || '', result, detail });
        this.resetForm('matchForm');
        this.updateStats();
        this.renderMatches();
    },
    
    queryMatches() {
        const faceId = document.getElementById('queryFace').value;
        const el = document.getElementById('matchResults');
        if (!faceId) { el.innerHTML = '<div class="empty-hint">选择脸片查看结果</div>'; return; }
        
        const matches = DataStore.getMatchesByFace(faceId);
        const face = DataStore.getFace(faceId);
        
        if (!matches.length) {
            el.innerHTML = `<div class="empty-hint">"${this.esc(face.name)}" 暂无匹配记录</div>`;
            return;
        }
        
        const order = { perfect: 0, good: 1, unknown: 2, poor: 3 };
        matches.sort((a, b) => order[a.result] - order[b.result]);
        
        el.innerHTML = `<div style="margin-bottom:12px;color:var(--text-dim);font-size:0.9rem">${this.esc(face.name)} 的匹配结果</div>` +
            matches.map(m => this.renderResultCard(m, face, DataStore.getHair(m.frontHairId), DataStore.getHair(m.backHairId))).join('');
    },
    
    queryByHair() {
        const hairId = document.getElementById('queryHair').value;
        const el = document.getElementById('matchResults');
        if (!hairId) { el.innerHTML = '<div class="empty-hint">选择配件查看结果</div>'; return; }
        
        const matches = DataStore.getMatchesByHair(hairId);
        const hair = DataStore.getHair(hairId);
        
        if (!matches.length) {
            el.innerHTML = `<div class="empty-hint">"${this.esc(hair.name)}" 暂无匹配记录</div>`;
            return;
        }
        
        const order = { perfect: 0, good: 1, unknown: 2, poor: 3 };
        matches.sort((a, b) => order[a.result] - order[b.result]);
        
        el.innerHTML = `<div style="margin-bottom:12px;color:var(--text-dim);font-size:0.9rem">${this.esc(hair.name)} 兼容的脸片</div>` +
            matches.map(m => this.renderResultCard(m, DataStore.getFace(m.faceId), 
                m.frontHairId === hairId ? hair : DataStore.getHair(m.frontHairId),
                m.backHairId === hairId ? hair : DataStore.getHair(m.backHairId)
            )).join('');
    },
    
    renderResultCard(match, face, frontHair, backHair) {
        const labels = { perfect: 'OK', good: '~', poor: 'NO', unknown: '?' };
        const parts = [];
        if (frontHair) parts.push(`前 ${this.esc(frontHair.name)}`);
        if (backHair) parts.push(`后 ${this.esc(backHair.name)}`);
        
        return `
            <div class="result-card ${match.result}">
                <div class="result-status">${labels[match.result]}</div>
                <div class="result-info">
                    <h4>${this.esc(face.name)}${parts.length ? ' + ' + parts.join(' / ') : ''}</h4>
                    ${match.detail ? `<p>${this.esc(match.detail)}</p>` : ''}
                </div>
            </div>
        `;
    },
    
    renderMatches() {
        const matches = DataStore.getMatches();
        const el = document.getElementById('matchList');
        
        if (!matches.length) {
            el.innerHTML = '<div class="empty-hint">暂无匹配记录</div>';
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
                    <div class="match-combo">
                        <div class="face-name">${this.esc(face.name)}</div>
                        <div class="hair-parts">${parts.join(' / ')}</div>
                        ${m.detail ? `<div class="detail">${this.esc(m.detail)}</div>` : ''}
                    </div>
                    <button onclick="app.deleteMatch('${m.id}')" class="btn btn-secondary btn-danger">删除</button>
                </div>
            `;
        }).join('');
    },
    
    deleteMatch(id) {
        if (!confirm('删除这条记录？')) return;
        DataStore.deleteMatch(id);
        this.updateStats();
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
    
    esc(s) {
        if (!s) return '';
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    },
    
    // data
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
                alert('导入成功');
                this.init();
            } else {
                alert('导入失败');
            }
        };
        reader.readAsText(file);
        input.value = '';
    },
    
    clearAll() {
        if (!confirm('清空所有数据？建议先导出备份。')) return;
        DataStore.clear();
        this.init();
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());

