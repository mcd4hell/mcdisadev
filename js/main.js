// ==========================================================================
// Mcd - Developer Workspace / Playground Core JS
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    const viewport = document.getElementById('editorViewport');
    const explorerSidebar = document.getElementById('explorerSidebar');
    const explorerToggleBtn = document.getElementById('explorerToggleBtn');
    
    // Navigation Mapping
    const sections = document.querySelectorAll('.editor-section');
    const tabs = document.querySelectorAll('.tab-item');
    const files = document.querySelectorAll('.file-item');
    const activities = document.querySelectorAll('.activity-item');
    
    let isScrollingFromClick = false;
    let scrollTimeout;

    // Helper: Extract section ID from href attribute
    function getSectionId(href) {
        if (!href) return '';
        const index = href.indexOf('#');
        return index !== -1 ? href.substring(index + 1) : href;
    }

    // Sync active states across Sidebar, Explorer, and Tabs
    function syncActiveState(sectionId) {
        // Update Tabs
        tabs.forEach(tab => {
            const id = getSectionId(tab.getAttribute('href'));
            if (id === sectionId) tab.classList.add('active');
            else tab.classList.remove('active');
        });

        // Update Explorer Tree
        files.forEach(file => {
            const id = getSectionId(file.getAttribute('href'));
            if (id === sectionId) file.classList.add('active');
            else file.classList.remove('active');
        });

        // Update Activity Bar (only matching links, skip external/settings)
        activities.forEach(act => {
            const id = getSectionId(act.getAttribute('href'));
            if (id && id === sectionId) act.classList.add('active');
            else if (id && id !== 'settings') act.classList.remove('active');
        });
    }

    // Perform smooth scrolling inside custom container
    function scrollToSection(sectionId) {
        const target = document.getElementById(sectionId);
        if (target && viewport) {
            isScrollingFromClick = true;
            clearTimeout(scrollTimeout);
            
            // Offset computation for relative scrolling container
            const targetScrollTop = target.offsetTop;
            viewport.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });

            syncActiveState(sectionId);

            // Reset scrolling lock flag after smooth scroll ends
            scrollTimeout = setTimeout(() => {
                isScrollingFromClick = false;
            }, 800);
        }
    }

    // Attach click listeners to all navigation elements
    const navElements = [...tabs, ...files, ...activities];
    navElements.forEach(el => {
        el.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const sectionId = getSectionId(href);
                scrollToSection(sectionId);
                
                // If on mobile and clicked inside explorer tree, hide sidebar
                if (window.innerWidth <= 768 && this.classList.contains('file-item')) {
                    explorerSidebar.classList.remove('active');
                }
            }
        });
    });

    // Scroll Spy for viewport container
    if (viewport) {
        viewport.addEventListener('scroll', function() {
            if (isScrollingFromClick) return;

            const scrollTop = viewport.scrollTop;
            const viewportHeight = viewport.clientHeight;
            let currentSectionId = '';

            sections.forEach(sec => {
                const secTop = sec.offsetTop;
                const secHeight = sec.clientHeight;
                
                // Check if the section occupies the main focal area of the viewport
                if (scrollTop >= secTop - viewportHeight / 3 && 
                    scrollTop < secTop + secHeight - viewportHeight / 3) {
                    currentSectionId = sec.id;
                }
            });

            if (currentSectionId) {
                syncActiveState(currentSectionId);
            }
        });
    }

    // 1. Scroll-Reveal Animation Trigger using IntersectionObserver
    if (viewport) {
        const observerOptions = {
            root: viewport, // Observed relative to the editor area scrolling pane
            rootMargin: '0px',
            threshold: 0.15
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => {
            revealObserver.observe(el);
        });
    }

    // Explorer Sidebar Collapse / Expand Panel Toggles
    if (explorerToggleBtn && explorerSidebar) {
        explorerToggleBtn.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                explorerSidebar.classList.toggle('active');
            } else {
                explorerSidebar.classList.toggle('collapsed');
            }
            
            // Toggle arrow direction based on layout state
            const icon = explorerToggleBtn.querySelector('i');
            const isCollapsed = explorerSidebar.classList.contains('collapsed') || 
                               (window.innerWidth <= 768 && !explorerSidebar.classList.contains('active'));
                               
            if (isCollapsed) {
                icon.className = 'fas fa-angle-right';
            } else {
                icon.className = 'fas fa-angle-left';
            }
        });
    }

    // Hook explorer trigger to activity bar icon
    const explorerActivityBtn = document.querySelector('.activity-item[title*="Explorer"]');
    if (explorerActivityBtn) {
        explorerActivityBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.innerWidth <= 768) {
                explorerSidebar.classList.toggle('active');
            } else {
                explorerSidebar.classList.toggle('collapsed');
            }
            
            // Toggle the panel collapse indicator icon
            if (explorerToggleBtn) {
                const icon = explorerToggleBtn.querySelector('i');
                const isCollapsed = explorerSidebar.classList.contains('collapsed') || 
                                   (window.innerWidth <= 768 && !explorerSidebar.classList.contains('active'));
                icon.className = isCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left';
            }
        });
    }

    // Collapsible folder tree list items
    const folders = document.querySelectorAll('.folder-title');
    folders.forEach(folder => {
        folder.addEventListener('click', function() {
            const group = this.parentElement;
            const items = group.querySelector('.folder-items');
            const arrow = this.querySelector('.folder-arrow');
            const folderIcon = this.querySelector('.folder-icon') || this.querySelector('.folder-icon-sub');
            
            if (items) {
                const isExpanded = items.style.display !== 'none';
                if (isExpanded) {
                    items.style.display = 'none';
                    arrow.className = 'fas fa-chevron-right folder-arrow';
                    if (folderIcon) {
                        folderIcon.className = folderIcon.className.replace('folder-open', 'folder');
                    }
                } else {
                    items.style.display = 'flex';
                    arrow.className = 'fas fa-chevron-down folder-arrow';
                    if (folderIcon) {
                        folderIcon.className = folderIcon.className.replace('folder', 'folder-open');
                    }
                }
            }
        });
    });

    // 2. Mock Compiler Simulation Terminal
    const runCompilerBtn = document.getElementById('runCompilerBtn');
    const terminalLogs = document.getElementById('terminalLogs');
    const compilerStatus = document.getElementById('compilerStatus');

    if (runCompilerBtn && terminalLogs) {
        runCompilerBtn.addEventListener('click', function() {
            runCompilerBtn.disabled = true;
            runCompilerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Executing...';
            compilerStatus.className = "badge edit-badge";
            compilerStatus.textContent = "Compiling";

            // Reset logs panel
            terminalLogs.innerHTML = `<div class="log-row info"><span class="log-prompt">$</span> npm run build:workspace</div>`;

            const compileLogs = [
                { type: 'comment', text: '// Booting workspace bundler v4.8...' },
                { type: 'info', text: '[1/4] Resolving source modules from assets folder...' },
                { type: 'info', text: '[2/4] Transpiling script nodes and loading index.html layout...' },
                { type: 'info', text: '[3/4] Optimizing style rules with pure OLED black CSS overrides...' },
                { type: 'info', text: '[4/4] Deploying responsive build to client channel pipelines...' },
                { type: 'success', text: '✔ SUCCESS: workspace_compile: complete! Portfolio parsed in 1242ms.' }
            ];

            let logIndex = 0;

            function addLogLine() {
                if (logIndex < compileLogs.length) {
                    const log = compileLogs[logIndex];
                    const logEl = document.createElement('div');
                    logEl.className = `log-row ${log.type}`;
                    
                    if (log.type === 'success') {
                        logEl.innerHTML = log.text;
                    } else if (log.type === 'comment') {
                        logEl.textContent = log.text;
                    } else {
                        logEl.textContent = `  ${log.text}`;
                    }

                    terminalLogs.appendChild(logEl);
                    // Smoothly scroll compiler terminal viewport
                    terminalLogs.scrollTop = terminalLogs.scrollHeight;
                    
                    logIndex++;
                    setTimeout(addLogLine, Math.random() * 250 + 150); // random log timing
                } else {
                    // Compilation done
                    compilerStatus.className = "badge online";
                    compilerStatus.textContent = "Build Passing";
                    runCompilerBtn.disabled = false;
                    runCompilerBtn.innerHTML = '<i class="fas fa-check"></i> Re-compile';
                }
            }

            setTimeout(addLogLine, 300);
        });
    }

    // Form Submission (Web3Forms API Integration)
    const form = document.querySelector('.yaml-styled-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.yaml-submit-btn');
            const name = document.getElementById('senderName').value;
            const email = document.getElementById('senderEmail').value;
            const subject = document.getElementById('msgSubject').value;
            const message = document.getElementById('senderMsg').value;
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> transmitting...';
            }
            
            // Web3Forms API Request Configuration
            // Kendi Access Key'inizi buraya yapıştırın. (Web3Forms.com'dan ücretsiz alınır)
            const accessKey = "b3919d7e-a3c2-470a-877f-98aea5f5c97c"; 

            const formData = {
                access_key: accessKey,
                name: name,
                email: email,
                subject: subject,
                message: `${message}\n\n---\nSent from MCD Developer Workspace Portfolio`
            };

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(async (response) => {
                let json = await response.json();
                if (response.status === 200) {
                    alert("SUCCESS: Message transmitted successfully!");
                    form.reset();
                } else {
                    alert("ERROR: " + (json.message || "Something went wrong. Make sure you set a valid Web3Forms Access Key."));
                }
            })
            .catch(error => {
                alert("ERROR: Network transmission failed. Please try again later.");
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> sendMessage({ senderName, message })';
                }
            });
        });
    }

    // Tab close buttons simulation
    const tabCloses = document.querySelectorAll('.tab-close');
    tabCloses.forEach(close => {
        close.addEventListener('click', function(e) {
            e.stopPropagation(); // Avoid triggering smooth scroll
            const tab = this.parentElement;
            alert("This file is a required part of the portfolio workspace. Keeping it open for easy exploration!");
        });
    });
});
