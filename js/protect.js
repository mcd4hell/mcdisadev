// ==========================================================================
// Mcd - Ultimate Code Protection & Anti-Scraping Shield
// ==========================================================================

(function() {
    'use strict';

    // ── CONFIGURATION ──
    const allowedDomains = ['localhost:8000', 'localhost']; // Buraya production domain'ini ekle: 'yourdomain.com'
    const blockedUserAgents = [
        'httrack', 'wget', 'curl', 'python-requests', 
        'scrapy', 'screaming frog', 'sitebulb', 'dotnet',
        'java/', 'libwww', 'httpclient', 'urllib', 'requests'
    ];

    // ── 1. DOMAIN CHECK - Sadece izin verilen domainlerde çalışsın ──
    (function checkDomain() {
        const currentDomain = window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        const isAllowed = allowedDomains.some(domain => 
            currentDomain === domain || currentDomain.startsWith('localhost')
        );

        if (!isAllowed) {
            document.body.innerHTML = `
                <div style="padding: 50px; text-align: center; font-family: 'JetBrains Mono', monospace; background: #0a0a0a; color: #ff5555; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
                    <div>
                        <h1 style="font-size: 32px; margin-bottom: 20px;">🚫 Bu site korumalıdır</h1>
                        <p style="font-size: 16px; line-height: 1.6;">
                            Bu site sadece orijinal domain üzerinden erişilebilir.<br>
                            İzin verilmeyen domain: <strong>${currentDomain}</strong>
                        </p>
                    </div>
                </div>`;
            throw new Error('Unauthorized domain access: ' + currentDomain);
        }
    })();

    // ── 2. FILE:// PROTOCOL BLOCK - Local dosya olarak açılamasın ──
    (function blockFileProtocol() {
        if (window.location.protocol === 'file:') {
            document.body.innerHTML = `
                <div style="padding: 50px; text-align: center; font-family: 'JetBrains Mono', monospace; background: #0a0a0a; color: #ff5555; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
                    <div>
                        <h1 style="font-size: 32px; margin-bottom: 20px;">🚫 Local dosya olarak çalıştırılamaz</h1>
                        <p style="font-size: 16px;">Bu site sunucu üzerinden çalıştırılmalıdır.</p>
                    </div>
                </div>`;
            // Sonsuz döngü ile kilit
            while(true) {}
        }
    })();

    // ── 3. USER-AGENT BLOCK - HTTrack, wget, curl engelleme ──
    (function blockUserAgents() {
        const userAgent = navigator.userAgent.toLowerCase();
        const blocked = blockedUserAgents.some(agent => userAgent.includes(agent.toLowerCase()));

        if (blocked) {
            // Boş sayfa göster veya yanlış içerik gönder
            document.body.innerHTML = '';
            
            // Sahte içerik üret
            setInterval(() => {
                const fakeDiv = document.createElement('div');
                fakeDiv.style.display = 'none';
                fakeDiv.innerHTML = Math.random().toString(36).substring(7);
                document.body.appendChild(fakeDiv);
            }, 50);

            // Console'u spam et
            setInterval(() => {
                console.log('%c[Scraping Detected]', 'color: #ff5555; font-size: 20px; font-weight: bold;');
            }, 100);

            throw new Error('Blocked user agent detected');
        }
    })();

    // ── 4. Disable Right-Click Context Menu ──
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // ── 5. Disable Keyboard Shortcuts for DevTools ──
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (Inspect)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+C (Element picker)
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S (Save)
        if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+K (Firefox Console)
        if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k' || e.keyCode === 75)) {
            e.preventDefault();
            return false;
        }
    });

    // ── 6. Anti-Debugging: Detect DevTools via timing ──
    let devToolsOpen = false;

    function detectDevTools() {
        const threshold = 160;
        const widthDiff = window.outerWidth - window.innerWidth > threshold;
        const heightDiff = window.outerHeight - window.innerHeight > threshold;

        if (widthDiff || heightDiff) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                onDevToolsDetected();
            }
        } else {
            devToolsOpen = false;
        }
    }

    function onDevToolsDetected() {
        // Clear console and flood with warnings
        console.clear();
        console.log('%c⚠️ STOP!', 'color: #ff0000; font-size: 48px; font-weight: bold; text-shadow: 2px 2px 0 #000;');
        console.log('%cBu site korumalıdır. Kaynak kodu incelemeye çalışmak yasaktır.', 'color: #00ff66; font-size: 16px; font-family: monospace;');
        console.log('%cThis site is protected. Inspecting source code is not permitted.', 'color: #00ff66; font-size: 14px; font-family: monospace;');
    }

    setInterval(detectDevTools, 1000);

    // ── 7. Debugger trap (slows down anyone using DevTools) ──
    (function antiDebug() {
        function block() {
            try {
                (function() {
                    return false;
                }['constructor']('debugger')['call']());
            } catch(e) {}

            setTimeout(block, 50);
        }
        // Delayed start so it doesn't affect initial load
        setTimeout(block, 2000);
    })();

    // ── 8. Disable text selection on non-input elements ──
    document.addEventListener('selectstart', function(e) {
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') {
            return true; // Allow selection in form fields
        }
        e.preventDefault();
        return false;
    });

    // ── 9. Disable drag ──
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });

    // ── 10. Console flood on open ──
    const consoleImage = new Image();
    Object.defineProperty(consoleImage, 'id', {
        get: function() {
            onDevToolsDetected();
        }
    });

    // Periodic console check
    setInterval(function() {
        console.log('%c', consoleImage);
        console.clear();
    }, 3000);

    // ── 11. Disable copy (except form inputs) ──
    document.addEventListener('copy', function(e) {
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return true;
        e.preventDefault();
        return false;
    });

    // ── 12. Prevent iframe embedding ──
    if (window.self !== window.top) {
        window.top.location = window.self.location;
    }

})();
