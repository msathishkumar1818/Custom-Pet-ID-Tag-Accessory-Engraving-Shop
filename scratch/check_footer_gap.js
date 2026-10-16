const { spawn } = require('child_process');
const fs = require('fs');

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--user-data-dir=C:\\temp\\cdir_footer_gap_test',
    '--window-size=1280,800',
    'file:///c:/Users/user/Desktop/oct/Custom%20Pet%20ID%20Tag%20&%20Accessory%20Engraving%20Shop/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json');
    const tabs = await listRes.json();
    const targetTab = tabs.find(t => t.url.includes('index.html')) || tabs[0];

    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
    await new Promise(resolve => ws.addEventListener('open', resolve));

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        const handler = (event) => {
          const res = JSON.parse(event.data);
          if (res.id === msgId) {
            ws.removeEventListener('message', handler);
            if (res.error) reject(res.error);
            else resolve(res.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Runtime.enable');

    const clipRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.querySelector('.footer-brand');
          el.scrollIntoView({ block: 'center' });
          const r = el.getBoundingClientRect();
          return JSON.stringify({
            x: r.x - 10,
            y: r.y - 10,
            width: r.width + 30,
            height: r.height + 30,
            scale: 2
          });
        })()
      `,
      returnByValue: true
    });

    const clip = JSON.parse(clipRes.result.value);

    const shotRes = await send('Page.captureScreenshot', {
      format: 'png',
      clip: clip,
      captureBeyondViewport: true
    });

    fs.writeFileSync('C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\da10984b-dfc2-4e65-8477-8ef9b1887094\\footer_brand_gap_updated.png', Buffer.from(shotRes.data, 'base64'));
    console.log('Saved footer_brand_gap_updated.png');

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chrome.kill();
  }
}

main();
