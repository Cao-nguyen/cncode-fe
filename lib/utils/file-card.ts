interface FileCardConfig {
    svg: string;
    color: string;
    canPreview: boolean;
}

const FILE_CONFIGS: Record<string, FileCardConfig> = {
    pdf: {
        svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#e11d48" d="M19,2L14,2L14,9L20,9L20,4C20,2.89 19.1,2 19,2M13,2H6C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V10L13,2M9,19H7V13H9C10.1,13 11,13.9 11,15V17C11,18.1 10.1,19 9,19M15,19H13V13H17V15H15V16H17V18H15V19M9,15V17H7V15H9M13,3.5L18.5,9H13V3.5Z"/></svg>',
        color: "#e11d48",
        canPreview: true,
    },
    doc: {
        svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#2b579a" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.2,19H13.8L12.8,14.4L11.7,19H10.3L8.7,12.1H10.1L11.3,17.5L12.3,12.8H13.3L14.3,17.5L15.5,12.1H16.9L15.2,19M13,9V3.5L18.5,9H13Z"/></svg>',
        color: "#2b579a",
        canPreview: false,
    },
    docx: {
        svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#2b579a" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.2,19H13.8L12.8,14.4L11.7,19H10.3L8.7,12.1H10.1L11.3,17.5L12.3,12.8H13.3L14.3,17.5L15.5,12.1H16.9L15.2,19M13,9V3.5L18.5,9H13Z"/></svg>',
        color: "#2b579a",
        canPreview: false,
    },
    xls: {
        svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#107c10" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.8,19H14.4L12.4,14.6L10.4,19H9L11.7,13.1L9,7.2H10.4L12.4,11.6L14.4,7.2H15.8L13.1,13.1L15.8,19M13,9V3.5L18.5,9H13Z"/></svg>',
        color: "#107c10",
        canPreview: false,
    },
    xlsx: {
        svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#107c10" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.8,19H14.4L12.4,14.6L10.4,19H9L11.7,13.1L9,7.2H10.4L12.4,11.6L14.4,7.2H15.8L13.1,13.1L15.8,19M13,9V3.5L18.5,9H13Z"/></svg>',
        color: "#107c10",
        canPreview: false,
    },
    ppt: {
        svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#d24726" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M16,13H13V12H16V13M16,15H13V14H16V15M16,17H13V16H16V17M11,13H8V12H11V13M11,15H8V14H11V15M11,17H8V16H11V17M13,9V3.5L18.5,9H13Z"/></svg>',
        color: "#d24726",
        canPreview: false,
    },
    pptx: {
        svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#d24726" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M16,13H13V12H16V13M16,15H13V14H16V15M16,17H13V16H16V17M11,13H8V12H11V13M11,15H8V14H11V15M11,17H8V16H11V17M13,9V3.5L18.5,9H13Z"/></svg>',
        color: "#d24726",
        canPreview: false,
    },
    zip: {
        svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#f59e0b" d="M14,17H12V15H10V17H8V15H10V13H8V11H10V13H12V11H10V9H12V7H14V9H12V11H14V13H12V15H14V17M14,2H6C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
        color: "#f59e0b",
        canPreview: false,
    },
    rar: {
        svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#f59e0b" d="M14,17H12V15H10V17H8V15H10V13H8V11H10V13H12V11H10V9H12V7H14V9H12V11H14V13H12V15H14V17M14,2H6C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
        color: "#f59e0b",
        canPreview: false,
    },
    "7z": {
        svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#f59e0b" d="M14,17H12V15H10V17H8V15H10V13H8V11H10V13H12V11H10V9H12V7H14V9H12V11H14V13H12V15H14V17M14,2H6C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
        color: "#f59e0b",
        canPreview: false,
    },
};

const DEFAULT_CONFIG: FileCardConfig = {
    svg: '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="#64748b" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
    color: "#64748b",
    canPreview: false,
};

export function generateFileCardHTML(
    filename: string,
    messageId: string,
    fileSize: string
): string {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const config = FILE_CONFIGS[ext] ?? DEFAULT_CONFIG;

    return `
        <div class="file-card" contenteditable="false" data-message-id="${messageId}" style="background:#ffffff;width:100%;max-width:550px;padding:12px 16px;border-radius:12px;display:flex;align-items:center;border:1px solid #edf2f7;transition:all 0.2s ease;margin:12px 0;font-family:Inter,system-ui,sans-serif;" onmouseover="this.style.borderColor='#cbd5e0';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.05)';this.style.transform='translateY(-1px)';" onmouseout="this.style.borderColor='#edf2f7';this.style.boxShadow='none';this.style.transform='translateY(0)';">
            <div style="width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-right:16px;flex-shrink:0;position:relative;background:${config.color}12;">
                ${config.svg}
            </div>
            <div style="flex-grow:1;min-width:0;">
                <div style="font-size:14.5px;font-weight:600;color:#2d3748;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;" title="${filename}">${filename}</div>
                <div style="font-size:12px;color:#718096;display:flex;gap:10px;">
                    <span>${fileSize}</span>
                    <span>•</span>
                    <span>Vừa xong</span>
                </div>
            </div>
            <button onclick="(()=>{const a=document.createElement('a');a.href='http://localhost:5000/api/upload/proxy/file/${messageId}';a.download='${filename}';a.click();})()" style="width:36px;height:36px;border-radius:8px;border:none;background:#f8fafc;color:#64748b;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.2s;margin-left:12px;" onmouseover="this.style.background='#e2e8f0';this.style.color='#1e293b';" onmouseout="this.style.background='#f8fafc';this.style.color='#64748b';" title="Tải xuống">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            </button>
        </div>
    `;
}
