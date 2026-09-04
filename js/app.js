// 主应用逻辑
const app = {
    currentHairFilter: 'all',
    
    // 初始化
    init() {
        this.updateStats();
        this.renderFaceList();
        this.renderHairList();
        this.renderMatchList();
        this.updateSelectOptions();
        this.updateEyeSizeFilter();
    },
    
    // 切换标签页
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        // 刷新数据
        if (tabName === 'matches') {
            this.updateMatchSelects();
        }
    },
    
    // ========== 统计更新 ==========
    updateStats() {
        const data = DataStore.getAll();
        document.getElementById('faceCount').textContent = data.faces.length;
        document.getElementById('frontHairCount').textContent = data.hairs.filter(h => h.type === 'front' || h.type === 'set').length;
        document.getElementById('backHairCount').textContent = data.hairs.filter(h => h.type === 'back' || h.type === 'set').length;
        document.getElementById('matchCount').textContent = data.matches.length;
    },
    
    // ========== 脸片管理 ==========
    saveFace(event) {
        event.preventDefault();
        
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
        this.renderFaceList();
        this.updateStats();
        this.updateSelectOptions();
        this.updateEyeSizeFilter();
        
        // 更新按钮文字
        document.getElementById('faceSubmitBtn').textContent = '添加脸片';
    },
    
    editFace(id) {
        const face = DataStore.getFaceById(id);
        if (!face) return;
        
        document.getElementById('faceId').value = face.id;
        document.getElementById('faceName').value = face.name;
        document.getElementById('faceBrand').value = face.brand || '';
        document.getElementById('eyeSize').value = face.eyeSize;
        document.getElementById('headSize').value = face.headSize || '';
        document.getElementById('faceNote').value = face.note || '';
        
        document.getElementById('faceSubmitBtn').textContent = '更新脸片';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    deleteFace(id) {
        if (!confirm('确定删除这个脸片？相关匹配记录也会被删除。')) return;
        DataStore.deleteFace(id);
        this.renderFaceList();
        this.updateStats();
        this.updateSelectOptions();
    },
    
    renderFaceList(faces = null) {
        faces = faces || DataStore.getFaces();
        const container = document.getElementById('faceList');
        document.getElementById('faceListCount').textContent = faces.length;
        
        if (faces.length === 0) {
            container.innerHTML = Components.emptyState('还没有脸片，请添加');
            return;
        }
        
        container.innerHTML = faces.map(f => 
            Components.faceCard(f, 'app.editFace', 'app.deleteFace')
        ).join('');
    },
    
    filterFaces() {
        let faces = DataStore.getFaces();
        
        // 按眼珠尺寸筛选
        const eyeSize = document.getElementById('eyeSizeFilter').value;
        if (eyeSize) {
            faces = faces.filter(f => f.eyeSize == eyeSize);
        }
        
        // 按关键词搜索
        const keyword = document.getElementById('faceSearch').value.toLowerCase().trim();
        if (keyword) {
            faces = faces.filter(f => 
                f.name.toLowerCase().includes(keyword) ||
                (f.brand && f.brand.toLowerCase().includes(keyword)) ||
                (f.note && f.note.toLowerCase().includes(keyword))
            );
        }
        
        this.renderFaceList(faces);
    },
    
    updateEyeSizeFilter() {
        const select = document.getElementById('eyeSizeFilter');
        const currentValue = select.value;
        const sizes = DataStore.getEyeSizes();
        
        select.innerHTML = '<option value="">全部尺寸</option>' +
            sizes.map(s => `<option value="${s}">${s}mm</option>`).join('');
        
        select.value = currentValue;
    },
    
    // ========== 前后发管理 ==========
    saveHair(event) {
        event.preventDefault();
        
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
        this.renderHairList();
        this.updateStats();
        this.updateSelectOptions();
        
        document.getElementById('hairSubmitBtn').textContent = '添加';
    },
    
    editHair(id) {
        const hair = DataStore.getHairById(id);
        if (!hair) return;
        
        document.getElementById('hairId').value = hair.id;
        document.getElementById('hairName').value = hair.name;
        document.getElementById('hairType').value = hair.type;
        document.getElementById('hairBrand').value = hair.brand || '';
        document.getElementById('hairHeadSize').value = hair.headSize || '';
        document.getElementById('hairNote').value = hair.note || '';
        
        document.getElementById('hairSubmitBtn').textContent = '更新';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    deleteHair(id) {
        if (!confirm('确定删除？相关匹配记录也会被删除。')) return;
        DataStore.deleteHair(id);
        this.renderHairList();
        this.updateStats();
        this.updateSelectOptions();
    },
    
    renderHairList() {
        let hairs = DataStore.getHairs();
        if (this.currentHairFilter !== 'all') {
            hairs = hairs.filter(h => h.type === this.currentHairFilter);
        }
        
        const container = document.getElementById('hairList');
        
        if (hairs.length === 0) {
            container.innerHTML = Components.emptyState('还没有配件，请添加');
            return;
        }
        
        container.innerHTML = hairs.map(h => 
            Components.hairCard(h, 'app.editHair', 'app.deleteHair')
        ).join('');
    },
    
    filterHairs(type) {
        this.currentHairFilter = type;
        document.querySelectorAll('.hair-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', 
                (type === 'all' && btn.textContent === '全部') ||
                (type === 'front' && btn.textContent === '前发') ||
                (type === 'back' && btn.textContent === '后发') ||
                (type === 'set' && btn.textContent === '套装')
            );
        });
        this.renderHairList();
    },
    
    // ========== 匹配管理 ==========
    updateSelectOptions() {
        // 更新所有下拉选择框
        const faces = DataStore.getFaces();
        const hairs = DataStore.getHairs();
        const frontHairs = hairs.filter(h => h.type === 'front' || h.type === 'set');
        const backHairs = hairs.filter(h => h.type === 'back' || h.type === 'set');
        
        // 通用选项生成
        const makeOptions = (items, emptyText) => 
            `<option value="">${emptyText}</option>` +
            items.map(i => `<option value="${i.id}">${this.escapeHtml(i.name)} (${i.eyeSize ? i.eyeSize + 'mm' : i.headSize + 'cm'})</option>`).join('');
        
        // 匹配表单
        const matchFace = document.getElementById('matchFace');
        if (matchFace) matchFace.innerHTML = makeOptions(faces, '请选择脸片');
        
        // 查询选择框
        const queryFace = document.getElementById('queryFace');
        if (queryFace) queryFace.innerHTML = makeOptions(faces, '选择脸片...');
    },
    
    updateMatchSelects() {
        this.updateSelectOptions();
        
        const hairs = DataStore.getHairs();
        const frontHairs = hairs.filter(h => h.type === 'front' || h.type === 'set');
        const backHairs = hairs.filter(h => h.type === 'back' || h.type === 'set');
        
        const makeOptions = (items, emptyText) => 
            `<option value="">${emptyText}</option>` +
            items.map(i => `<option value="${i.id}">${this.escapeHtml(i.name)}</option>`).join('');
        
        const matchFront = document.getElementById('matchFrontHair');
        const matchBack = document.getElementById('matchBackHair');
        if (matchFront) matchFront.innerHTML = makeOptions(frontHairs, '无/未测试');
        if (matchBack) matchBack.innerHTML = makeOptions(backHairs, '无/未测试');
        
        // 反向查询
        const queryHair = document.getElementById('queryHair');
        if (queryHair) queryHair.innerHTML = makeOptions(hairs, '选择前发/后发...');
    },
    
    updateMatchPreview() {
        // 可以在这里显示选中脸片的信息
    },
    
    saveMatch(event) {
        event.preventDefault();
        
        const faceId = document.getElementById('matchFace').value;
        const frontHairId = document.getElementById('matchFrontHair').value;
        const backHairId = document.getElementById('matchBackHair').value;
        const result = document.querySelector('input[name="matchResult"]:checked')?.value;
        const detail = document.getElementById('matchDetail').value.trim();
        
        if (!faceId || !result) {
            alert('请填写必填项');
            return;
        }
        
        // 检查是否至少选择了一个配件
        if (!frontHairId && !backHairId) {
            alert('请至少选择一个前发或后发');
            return;
        }
        
        const match = {
            faceId,
            frontHairId: frontHairId || '',
            backHairId: backHairId || '',
            result,
            detail
        };
        
        DataStore.saveMatch(match);
        this.resetForm('matchForm');
        this.updateStats();
        this.renderMatchList();
        
        alert('匹配记录已保存！');
    },
    
    queryMatches() {
        const faceId = document.getElementById('queryFace').value;
        const container = document.getElementById('matchResults');
        
        if (!faceId) {
            container.innerHTML = '<p class="hint">请选择脸片查看可用配件</p>';
            return;
        }
        
        const matches = DataStore.getMatchesByFace(faceId);
        const face = DataStore.getFaceById(faceId);
        
        if (matches.length === 0) {
            container.innerHTML = `<div class="empty-state">暂无 "${this.escapeHtml(face.name)}" 的匹配记录<br>请先在"匹配查询"页添加记录</div>`;
            return;
        }
        
        // 按结果排序
        const order = { perfect: 0, good: 1, unknown: 2, poor: 3 };
        matches.sort((a, b) => order[a.result] - order[b.result]);
        
        container.innerHTML = `
            <h4 style="margin-bottom: 15px;">"${this.escapeHtml(face.name)}" 的匹配结果</h4>
            ${matches.map(m => {
                const frontHair = m.frontHairId ? DataStore.getHairById(m.frontHairId) : null;
                const backHair = m.backHairId ? DataStore.getHairById(m.backHairId) : null;
                return Components.matchResultCard(m, face, frontHair, backHair);
            }).join('')}
        `;
    },
    
    queryByHair() {
        const hairId = document.getElementById('queryHair').value;
        const container = document.getElementById('matchResults');
        
        if (!hairId) {
            container.innerHTML = '<p class="hint">请选择配件查看兼容脸片</p>';
            return;
        }
        
        const matches = DataStore.getMatchesByHair(hairId);
        const hair = DataStore.getHairById(hairId);
        
        if (matches.length === 0) {
            container.innerHTML = `<div class="empty-state">暂无 "${this.escapeHtml(hair.name)}" 的匹配记录</div>`;
            return;
        }
        
        const order = { perfect: 0, good: 1, unknown: 2, poor: 3 };
        matches.sort((a, b) => order[a.result] - order[b.result]);
        
        container.innerHTML = `
            <h4 style="margin-bottom: 15px;">"${this.escapeHtml(hair.name)}" 兼容的脸片</h4>
            ${matches.map(m => {
                const face = DataStore.getFaceById(m.faceId);
                const otherHair = m.frontHairId === hairId 
                    ? (m.backHairId ? DataStore.getHairById(m.backHairId) : null)
                    : (m.frontHairId ? DataStore.getHairById(m.frontHairId) : null);
                return Components.matchResultCard(m, face, 
                    m.frontHairId === hairId ? hair : otherHair,
                    m.backHairId === hairId ? hair : otherHair
                );
            }).join('')}
        `;
    },
    
    renderMatchList() {
        const matches = DataStore.getMatches();
        const container = document.getElementById('matchList');
        
        if (matches.length === 0) {
            container.innerHTML = Components.emptyState('还没有匹配记录');
            return;
        }
        
        // 按时间倒序
        const sorted = [...matches].sort((a, b) => b.createdAt - a.createdAt);
        
        container.innerHTML = sorted.map(m => {
            const face = DataStore.getFaceById(m.faceId);
            const frontHair = m.frontHairId ? DataStore.getHairById(m.frontHairId) : null;
            const backHair = m.backHairId ? DataStore.getHairById(m.backHairId) : null;
            return Components.matchItem(m, face, frontHair, backHair, 'app.deleteMatch');
        }).join('');
    },
    
    deleteMatch(id) {
        if (!confirm('确定删除这条匹配记录？')) return;
        DataStore.deleteMatch(id);
        this.updateStats();
        this.renderMatchList();
    },
    
    // ========== 工具方法 ==========
    resetForm(formId) {
        document.getElementById(formId).reset();
        document.getElementById(formId).querySelector('input[type="hidden"]').value = '';
    },
    
    cancelEdit(type) {
        this.resetForm(type + 'Form');
        document.getElementById(type + 'SubmitBtn').textContent = type === 'face' ? '添加脸片' : '添加';
    },
    
    escapeHtml(text) {
        return Components.escapeHtml(text);
    },
    
    // ========== 导入导出 ==========
    exportData() {
        const data = DataStore.exportToJson();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `bjd-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    importData(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            if (DataStore.importFromJson(e.target.result)) {
                alert('导入成功！');
                this.init();
            } else {
                alert('导入失败，请检查文件格式');
            }
        };
        reader.readAsText(file);
        input.value = ''; // 重置以便可以再次选择同一文件
    },
    
    clearAll() {
        if (!confirm('确定清空所有数据？此操作不可恢复！建议先导出备份。')) return;
        DataStore.clearAll();
        this.init();
    },
    
    // Modal
    closeModal(event) {
        if (!event || event.target.id === 'modal') {
            document.getElementById('modal').classList.remove('active');
        }
    }
};

// 启动
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

