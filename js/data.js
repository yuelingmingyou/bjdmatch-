// 数据管理模块
const DataStore = {
    STORAGE_KEY: 'bjd_match_data',
    
    // 获取所有数据
    getAll() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        const defaultData = {
            faces: [],
            hairs: [],
            matches: [],
            version: '1.0'
        };
        return data ? JSON.parse(data) : defaultData;
    },
    
    // 保存所有数据
    saveAll(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },
    
    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // ========== 脸片操作 ==========
    getFaces() {
        return this.getAll().faces;
    },
    
    getFaceById(id) {
        return this.getFaces().find(f => f.id === id);
    },
    
    saveFace(face) {
        const data = this.getAll();
        if (face.id) {
            // 更新
            const index = data.faces.findIndex(f => f.id === face.id);
            if (index >= 0) {
                data.faces[index] = { ...data.faces[index], ...face, updatedAt: Date.now() };
            }
        } else {
            // 新增
            face.id = this.generateId();
            face.createdAt = Date.now();
            data.faces.push(face);
        }
        this.saveAll(data);
        return face;
    },
    
    deleteFace(id) {
        const data = this.getAll();
        data.faces = data.faces.filter(f => f.id !== id);
        // 级联删除相关匹配
        data.matches = data.matches.filter(m => m.faceId !== id);
        this.saveAll(data);
    },
    
    // ========== 前后发操作 ==========
    getHairs(type = null) {
        const hairs = this.getAll().hairs;
        return type ? hairs.filter(h => h.type === type) : hairs;
    },
    
    getHairById(id) {
        return this.getHairs().find(h => h.id === id);
    },
    
    saveHair(hair) {
        const data = this.getAll();
        if (hair.id) {
            const index = data.hairs.findIndex(h => h.id === hair.id);
            if (index >= 0) {
                data.hairs[index] = { ...data.hairs[index], ...hair, updatedAt: Date.now() };
            }
        } else {
            hair.id = this.generateId();
            hair.createdAt = Date.now();
            data.hairs.push(hair);
        }
        this.saveAll(data);
        return hair;
    },
    
    deleteHair(id) {
        const data = this.getAll();
        data.hairs = data.hairs.filter(h => h.id !== id);
        // 级联删除相关匹配
        data.matches = data.matches.filter(m => m.frontHairId !== id && m.backHairId !== id);
        this.saveAll(data);
    },
    
    // ========== 匹配操作 ==========
    getMatches() {
        return this.getAll().matches;
    },
    
    getMatchById(id) {
        return this.getMatches().find(m => m.id === id);
    },
    
    // 获取脸片的所有匹配
    getMatchesByFace(faceId) {
        return this.getMatches().filter(m => m.faceId === faceId);
    },
    
    // 获取配件相关的所有匹配
    getMatchesByHair(hairId) {
        return this.getMatches().filter(m => m.frontHairId === hairId || m.backHairId === hairId);
    },
    
    // 检查是否已存在相同组合
    findExistingMatch(faceId, frontHairId, backHairId) {
        return this.getMatches().find(m => 
            m.faceId === faceId && 
            m.frontHairId === (frontHairId || '') && 
            m.backHairId === (backHairId || '')
        );
    },
    
    saveMatch(match) {
        const data = this.getAll();
        
        // 检查是否已存在
        const existing = this.findExistingMatch(match.faceId, match.frontHairId, match.backHairId);
        if (existing) {
            // 更新现有记录
            const index = data.matches.findIndex(m => m.id === existing.id);
            data.matches[index] = { 
                ...existing, 
                ...match, 
                updatedAt: Date.now() 
            };
        } else {
            match.id = this.generateId();
            match.createdAt = Date.now();
            data.matches.push(match);
        }
        this.saveAll(data);
        return match;
    },
    
    deleteMatch(id) {
        const data = this.getAll();
        data.matches = data.matches.filter(m => m.id !== id);
        this.saveAll(data);
    },
    
    // ========== 导入导出 ==========
    exportToJson() {
        return JSON.stringify(this.getAll(), null, 2);
    },
    
    importFromJson(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            // 简单验证
            if (!data.faces || !data.hairs || !data.matches) {
                throw new Error('数据格式不正确');
            }
            this.saveAll(data);
            return true;
        } catch (e) {
            console.error('导入失败:', e);
            return false;
        }
    },
    
    // 清空所有数据
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    },
    
    // 获取所有眼珠尺寸（用于筛选）
    getEyeSizes() {
        const sizes = new Set();
        this.getFaces().forEach(f => {
            if (f.eyeSize) sizes.add(parseFloat(f.eyeSize));
        });
        return Array.from(sizes).sort((a, b) => a - b);
    }
};

