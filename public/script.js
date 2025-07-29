// DOM 元素引用
const userInput = document.getElementById('userInput');
const generateBtn = document.getElementById('generateBtn');
const loadingSection = document.getElementById('loadingSection');
const resultSection = document.getElementById('resultSection');
const zenContent = document.getElementById('zenContent');
const shareBtn = document.getElementById('shareBtn');
const newBtn = document.getElementById('newBtn');
const charCount = document.getElementById('charCount');
const imageModal = document.getElementById('imageModal');
const generatedImage = document.getElementById('generatedImage');
const closeModal = document.getElementById('closeModal');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const shareWechatBtn = document.getElementById('shareWechatBtn');

// 状态变量
let currentZenContent = '';
let isGenerating = false;

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateCharCount();

    // 添加一些视觉效果
    addFloatingElements();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 输入框字符计数
    userInput.addEventListener('input', updateCharCount);

    // 生成按钮点击事件
    generateBtn.addEventListener('click', handleGenerate);

    // 回车键快捷生成（Ctrl+Enter）
    userInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            handleGenerate();
        }
    });

    // 分享按钮点击事件
    shareBtn.addEventListener('click', handleShare);

    // 新生成按钮点击事件
    newBtn.addEventListener('click', handleNewGeneration);

    // 模态框相关事件
    closeModal.addEventListener('click', closeImageModal);
    downloadBtn.addEventListener('click', handleDownload);
    copyBtn.addEventListener('click', handleCopy);
    shareWechatBtn.addEventListener('click', handleWechatShare);

    // 点击模态框背景关闭
    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal) {
            closeImageModal();
        }
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !imageModal.classList.contains('hidden')) {
            closeImageModal();
        }
    });
}

// 更新字符计数
function updateCharCount() {
    const count = userInput.value.length;
    charCount.textContent = count;

    // 字符数接近上限时改变颜色
    if (count > 450) {
        charCount.style.color = '#e74c3c';
    } else if (count > 400) {
        charCount.style.color = '#f39c12';
    } else {
        charCount.style.color = '#666';
    }
}

// 处理生成禅语
async function handleGenerate() {
    const input = userInput.value.trim();

    // 验证输入
    if (!input) {
        showMessage('施主，请先输入内容让方丈开示', 'warning');
        userInput.focus();
        return;
    }

    if (input.length < 2) {
        showMessage('施主，请输入更多内容以便方丈深思', 'warning');
        userInput.focus();
        return;
    }

    if (isGenerating) {
        return;
    }

    try {
        isGenerating = true;
        showLoading();

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput: input })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '方丈打坐中，请稍后再试');
        }

        if (data.success && data.content) {
            currentZenContent = data.content;
            showResult(data.content);

            // 追踪成功生成
            trackEvent('generate_success', { input_length: input.length });
        } else {
            throw new Error('方丈的回复似乎有问题，请重试');
        }

    } catch (error) {
        console.error('生成禅语失败:', error);
        showMessage(error.message || '方丈正在打坐，请稍后再试', 'error');
        hideLoading();

        // 追踪失败事件
        trackEvent('generate_error', { error: error.message });
    } finally {
        isGenerating = false;
    }
}

// 显示加载状态
function showLoading() {
    resultSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="btn-text">🙏 方丈思考中...</span>';

    // 添加随机的加载文案
    const loadingTexts = [
        '方丈正在打坐思考中...',
        '正在参悟宇宙奥义...',
        '施主稍安勿躁，功德即将显现...',
        '正在与佛祖沟通中...',
        '万物皆空，正在悟道...'
    ];

    const randomText = loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
    document.querySelector('.loading-spinner p').textContent = randomText;
}

// 隐藏加载状态
function hideLoading() {
    loadingSection.classList.add('hidden');
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span class="btn-text">🙏 请方丈开示</span>';
}

// 显示结果
function showResult(content) {
    hideLoading();

    // 打字机效果显示内容
    zenContent.innerHTML = '';
    resultSection.classList.remove('hidden');

    typeWriter(content, zenContent, 50);

    // 滚动到结果区域
    setTimeout(() => {
        resultSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

// 打字机效果
function typeWriter(text, element, speed = 50) {
    element.innerHTML = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// 处理分享功能
async function handleShare() {
    if (!currentZenContent) {
        showMessage('没有内容可以分享', 'warning');
        return;
    }

    try {
        const startTime = Date.now();
        shareBtn.disabled = true;

        // 根据文本长度显示不同的生成提示
        const textLength = currentZenContent.length;
        let loadingText = '📸 生成中...';
        if (textLength > 150) {
            loadingText = '📸 智能布局中...';
        } else if (textLength > 100) {
            loadingText = '📸 优化排版中...';
        }
        shareBtn.textContent = loadingText;

        // 使用前端Canvas生成图片
        const userQuestion = userInput.value.trim();
        const imageUrl = await generateZenImage(currentZenContent, userQuestion);

        const endTime = Date.now();
        const generationTime = endTime - startTime;

        generatedImage.src = imageUrl;

        // 显示生成时间和文本统计
        const generationTimeElement = document.getElementById('generationTime');
        if (generationTimeElement) {
            generationTimeElement.textContent = `生成耗时：${generationTime}ms | 文本长度：${textLength}字 | 已智能优化布局`;
        }

        imageModal.classList.remove('hidden');

        // 追踪分享事件
        trackEvent('image_generated', {
            content_length: textLength,
            generation_time: generationTime
        });

    } catch (error) {
        console.error('图片生成失败:', error);
        showMessage('图片生成失败，请重试', 'error');

        trackEvent('image_error', { error: error.message });
    } finally {
        shareBtn.disabled = false;
        shareBtn.textContent = '📸 生成分享图片';
    }
}

// 在客户端生成富有“佛味”的分享图片
async function generateZenImage(text, question) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');

        // 1. 设置背景和边框
        ctx.fillStyle = '#f5f2e9'; // 柔和的米黄色
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#d4af37'; // 金色边框
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // 2. 绘制用户问题
        ctx.fillStyle = '#6a5d50';
        ctx.font = '29px "FangSong", "仿宋", serif';
        ctx.textAlign = 'center';
        const questionText = `问曰：${question.substring(0, 20)}${question.length > 20 ? '...' : ''}`;
        ctx.fillText(questionText, canvas.width / 2, 80);

        // 3. 绘制禅语回答
        ctx.fillStyle = '#3a2d22'; // 深棕色文字
        ctx.font = 'bold 36px "KaiTi", "STKaiti", "华文楷体", serif';
        ctx.textBaseline = 'middle';

        const maxWidth = canvas.width - 160; // 文字最大宽度
        const lineHeight = 50;
        const x = canvas.width / 2;
        let y = 180; // 为问题文本留出空间后，调整起始y坐标

        // 自动折行并绘制文本
        const lines = wrapText(ctx, text, maxWidth);
        lines.forEach(line => {
            ctx.fillText(line, x, y);
            y += lineHeight;
        });

        // 4. 添加装饰
        ctx.font = '100px serif';
        ctx.fillStyle = 'rgba(212, 175, 55, 0.2)'; // 半透明莲花
        ctx.fillText('🪷', canvas.width / 2, canvas.height / 2 + 80);

        ctx.font = '20px "FangSong", "仿宋", serif';
        ctx.fillStyle = '#8c7b69';
        ctx.fillText('—— 赛博住持・开示 ——', canvas.width / 2, canvas.height - 100);

        canvas.toBlob((blob) => {
            resolve(URL.createObjectURL(blob));
        }, 'image/png');
    });
}

// Canvas文本自动折行函数
function wrapText(context, text, maxWidth) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i];
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && i > 0) {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    return lines;
}


// 处理新生成
function handleNewGeneration() {
    // 清空输入框并聚焦
    userInput.value = '';
    updateCharCount();
    userInput.focus();

    // 隐藏结果区域
    resultSection.classList.add('hidden');
    currentZenContent = '';

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });

    trackEvent('new_generation');
}

// 关闭图片模态框
function closeImageModal() {
    imageModal.classList.add('hidden');
    // 释放blob URL
    if (generatedImage.src && generatedImage.src.startsWith('blob:')) {
        URL.revokeObjectURL(generatedImage.src);
    }
}

// 处理图片下载
function handleDownload() {
    if (!generatedImage.src) return;

    const link = document.createElement('a');
    link.href = generatedImage.src;
    link.download = `赛博住持开示_${new Date().getTime()}.png`;
    link.click();

    trackEvent('image_download');
    showMessage('图片已开始下载...', 'success');

    // 下载后弹出关注提示
    setTimeout(() => {
        showFollowBubble();
    }, 1000); // 延迟1秒显示
}

// 处理图片复制
async function handleCopy() {
    try {
        // 获取图片blob
        const response = await fetch(generatedImage.src);
        const blob = await response.blob();

        // 尝试使用Clipboard API复制
        if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            showMessage('图片已复制到剪贴板', 'success');
            trackEvent('image_copy');

            // 复制后也弹出关注提示
            setTimeout(() => {
                showFollowBubble();
            }, 1000); // 延迟1秒显示

        } else {
            // 降级处理：提示用户手动保存
            showMessage('请右键图片选择"复制图像"', 'info');
        }
    } catch (error) {
        console.error('复制图片失败:', error);
        showMessage('复制失败，请尝试右键保存图片', 'warning');
    }
}

// 处理微信分享
async function handleWechatShare() {
    if (!currentZenContent) {
        showMessage('没有内容可以分享', 'warning');
        return;
    }

    try {
        const userQuestion = userInput.value.trim();
        const shareText = `我问：${userQuestion}\n\n赛博住持开示：\n${currentZenContent}\n\n你也来试试吧！`;

        await navigator.clipboard.writeText(shareText);

        showMessage('分享文案已复制！请先下载图片，再到微信分享。', 'success');

        trackEvent('wechat_share_guide_shown');
    } catch (error) {
        console.error('复制分享文案失败:', error);
        showMessage('无法复制文案，请手动分享。', 'error');
    }
}

// 显示关注推特的气泡提示
function showFollowBubble() {
    const bubble = document.createElement('div');
    bubble.innerHTML = `
        <span>喜欢这个项目吗？点个关注吧！</span>
        <a href="https://x.com/DisDjj4797" target="_blank">👉 关注我的推特 @DisDjj4797</a>
    `;
    bubble.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1da1f2, #1a91da);
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        font-size: 16px;
        font-weight: bold;
        display: flex;
        flex-direction: column;
        gap: 8px;
        animation: slideInUp 0.5s ease-out;
    `;

    // 添加动画效果
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOutDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(bubble);

    // 5秒后自动消失
    setTimeout(() => {
        bubble.style.animation = 'slideOutDown 0.5s ease-in forwards';
        setTimeout(() => {
            bubble.remove();
        }, 500);
    }, 5000);
}


// 显示消息提示
function showMessage(message, type = 'info') {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;

    // 添加样式
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getMessageColor(type)};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: bold;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(messageEl);

    // 3秒后自动移除
    setTimeout(() => {
        messageEl.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// 获取消息颜色
function getMessageColor(type) {
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    return colors[type] || colors.info;
}

// 添加动画样式
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// 添加浮动装饰元素
function addFloatingElements() {
    const symbols = ['🪷', '☯', '🙏', '✨'];

    for (let i = 0; i < 6; i++) {
        const element = document.createElement('div');
        element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        element.style.cssText = `
            position: fixed;
            font-size: ${Math.random() * 20 + 20}px;
            opacity: ${Math.random() * 0.3 + 0.1};
            pointer-events: none;
            z-index: -1;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s linear infinite;
        `;
        document.body.appendChild(element);
    }
}

// 浮动动画样式
function addFloatingAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
            100% { transform: translateY(0px) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// 事件追踪（用于分析用户行为）
function trackEvent(eventName, properties = {}) {
    // 这里可以集成Google Analytics或其他分析工具
    console.log(`Event: ${eventName}`, properties);

    // 如果有分析工具，可以在这里发送数据
    // gtag('event', eventName, properties);
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏时暂停动画等
        document.body.style.animationPlayState = 'paused';
    } else {
        // 页面可见时恢复动画
        document.body.style.animationPlayState = 'running';
    }
});

// 错误处理
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
    trackEvent('page_error', {
        message: e.error?.message,
        filename: e.filename,
        lineno: e.lineno
    });
});

// 初始化动画样式
addAnimationStyles();
addFloatingAnimation();

// PWA支持（如果需要的话）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // 这里可以注册Service Worker
        // navigator.serviceWorker.register('/sw.js');
    });
}