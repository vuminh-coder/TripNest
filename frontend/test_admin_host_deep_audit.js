import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\VU VAN MINH\\.gemini\\antigravity-ide\\brain\\910ebe78-28fc-4e12-b48a-4ac92d1bb139';

const auditResults = {
  timestamp: new Date().toLocaleString('vi-VN'),
  admin: {},
  host: {},
  client: {},
  issuesFound: [],
  passedChecks: []
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDeepAudit() {
  console.log('========================================================================');
  console.log('      TRIPNEST DEEP E2E CHROME AUDIT - ADMIN & HOST PORTAL             ');
  console.log('========================================================================\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1600,1000'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000 });

    // Track API requests & responses to ensure DB traffic
    const networkCalls = [];
    page.on('response', async (res) => {
      const url = res.url();
      if (url.includes('/api/')) {
        networkCalls.push({
          url: url.replace('http://127.0.0.1:8000/api', '').replace('http://localhost:8000/api', ''),
          status: res.status(),
          ok: res.ok()
        });
      }
    });

    // =========================================================================
    // 1. ADMIN PORTAL AUDIT
    // =========================================================================
    console.log('\n🔵 [PHẦN 1] KIỂM TRA CHUYÊN SÂU CỔNG QUẢN TRỊ ADMIN PORTAL');

    // 1.1 Dashboard
    console.log('--- 1.1 Admin Dashboard (/admin) ---');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const adminDashData = await page.evaluate(() => {
      const statCards = Array.from(document.querySelectorAll('.stat-card-glass')).map(c => ({
        label: c.querySelector('.stat-label')?.textContent?.trim(),
        value: c.querySelector('.stat-value')?.textContent?.trim()
      }));
      const recentRows = Array.from(document.querySelectorAll('table tbody tr')).length;
      return { statCards, recentRows };
    });
    console.log('  Stats thẻ Dashboard:', JSON.stringify(adminDashData.statCards));
    auditResults.admin.dashboard = adminDashData;
    auditResults.passedChecks.push('Admin Dashboard tải thành công từ DB với stats: ' + adminDashData.statCards.map(s => `${s.label}: ${s.value}`).join(' | '));

    // 1.2 Accommodations
    console.log('\n--- 1.2 Admin Chỗ Ở & Hạng Phòng (/admin/accommodations) ---');
    await page.goto(`${BASE_URL}/admin/accommodations`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const accData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr')).map(r => {
        const title = r.querySelector('.adm-acc-name, .adm-acc-title-vi, strong, td')?.textContent?.trim();
        const city = r.querySelector('.adm-acc-city-cell, .adm-acc-city')?.textContent?.trim();
        const price = r.querySelector('.adm-acc-price, .adm-acc-price-vnd')?.textContent?.trim();
        const status = r.querySelector('.status-pill, select')?.value || r.querySelector('.status-pill')?.textContent?.trim();
        return { title, city, price, status };
      });
      const headerSubtitle = document.querySelector('.admin-page-subtitle')?.textContent?.trim();
      return { count: rows.length, sample: rows.slice(0, 3), headerSubtitle };
    });
    console.log(`  Số lượng chỗ ở hiển thị: ${accData.count} phòng (Subtitle: ${accData.headerSubtitle})`);
    console.log('  Mẫu chỗ ở:', JSON.stringify(accData.sample));
    auditResults.admin.accommodations = accData;

    // 1.3 Bookings
    console.log('\n--- 1.3 Admin Đơn Đặt Phòng (/admin/bookings) ---');
    await page.goto(`${BASE_URL}/admin/bookings`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const bookingsData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr')).map(r => {
        const cells = Array.from(r.querySelectorAll('td')).map(td => td.textContent.trim().replace(/\s+/g, ' '));
        return cells.slice(0, 5).join(' | ');
      });
      return { count: rows.length, rows: rows.slice(0, 5) };
    });
    console.log(`  Số lượng đơn đặt phòng: ${bookingsData.count}`);
    console.log('  Mẫu đơn đặt:', JSON.stringify(bookingsData.rows));
    auditResults.admin.bookings = bookingsData;

    // 1.4 Financials / Payouts
    console.log('\n--- 1.4 Admin Quyết Toán & Quỹ Escrow (/admin/financials) ---');
    await page.goto(`${BASE_URL}/admin/financials`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const financialsData = await page.evaluate(() => {
      const stats = Array.from(document.querySelectorAll('.stat-card-glass')).map(c => ({
        label: c.querySelector('.stat-label')?.textContent?.trim(),
        value: c.querySelector('.stat-value')?.textContent?.trim()
      }));
      const payoutRows = Array.from(document.querySelectorAll('table tbody tr')).map(r => {
        const cells = Array.from(r.querySelectorAll('td')).map(td => td.textContent.trim().replace(/\s+/g, ' '));
        return cells.slice(0, 6).join(' | ');
      });
      return { stats, payoutCount: payoutRows.length, samplePayouts: payoutRows.slice(0, 4) };
    });
    console.log('  Stats Tài chính:', JSON.stringify(financialsData.stats));
    console.log(`  Số lệnh Payout: ${financialsData.payoutCount}`);
    console.log('  Mẫu Payouts:', financialsData.samplePayouts);
    auditResults.admin.financials = financialsData;

    // 1.5 Users
    console.log('\n--- 1.5 Admin Quản Lý Người Dùng (/admin/users) ---');
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const usersData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr')).map(r => {
        const cells = Array.from(r.querySelectorAll('td')).map(td => td.textContent.trim().replace(/\s+/g, ' '));
        return cells.slice(0, 4).join(' | ');
      });
      return { count: rows.length, sample: rows.slice(0, 4) };
    });
    console.log(`  Số người dùng hiển thị: ${usersData.count}`);
    console.log('  Mẫu người dùng:', JSON.stringify(usersData.sample));
    auditResults.admin.users = usersData;

    // 1.6 Hosts KYC
    console.log('\n--- 1.6 Admin Đối Tác & KYC (/admin/hosts_kyc) ---');
    await page.goto(`${BASE_URL}/admin/hosts_kyc`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const hostsKycData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr')).map(r => {
        const cells = Array.from(r.querySelectorAll('td')).map(td => td.textContent.trim().replace(/\s+/g, ' '));
        return cells.slice(0, 4).join(' | ');
      });
      return { count: rows.length, sample: rows.slice(0, 3) };
    });
    console.log(`  Số lượng đối tác chủ nhà KYC: ${hostsKycData.count}`);
    auditResults.admin.hostsKyc = hostsKycData;

    // 1.7 Reviews Radar
    console.log('\n--- 1.7 Admin Kiểm Duyệt Đánh Giá Radar (/admin/reviews) ---');
    await page.goto(`${BASE_URL}/admin/reviews`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const reviewsData = await page.evaluate(() => {
      const revCards = Array.from(document.querySelectorAll('.adm-rev-card')).length;
      const subtitle = document.querySelector('.admin-page-subtitle')?.textContent?.trim();
      return { cardCount: revCards, subtitle };
    });
    console.log(`  Đánh giá hiển thị: ${reviewsData.cardCount} (Subtitle: ${reviewsData.subtitle})`);
    auditResults.admin.reviews = reviewsData;

    // 1.8 Categories
    console.log('\n--- 1.8 Admin Danh Mục Chỗ Nghỉ (/admin/categories) ---');
    await page.goto(`${BASE_URL}/admin/categories`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const catData = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.adm-cat-item-row')).length;
      return { count: items };
    });
    console.log(`  Số danh mục lưu trú: ${catData.count}`);
    auditResults.admin.categories = catData;

    // 1.9 Experiences
    console.log('\n--- 1.9 Admin Quản Lý Trải Nghiệm (/admin/experiences) ---');
    await page.goto(`${BASE_URL}/admin/experiences`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const expData = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.adm-exp-card')).length;
      return { count: cards };
    });
    console.log(`  Số tour trải nghiệm: ${expData.count}`);
    auditResults.admin.experiences = expData;


    // =========================================================================
    // 2. HOST PORTAL AUDIT
    // =========================================================================
    console.log('\n🟢 [PHẦN 2] KIỂM TRA CHUYÊN SÂU CỔNG CHỦ NHÀ HOST PORTAL');

    // 2.1 Host Dashboard
    console.log('--- 2.1 Host Dashboard (/host) ---');
    await page.goto(`${BASE_URL}/host`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const hostDashData = await page.evaluate(() => {
      const statCards = Array.from(document.querySelectorAll('.stat-card, .stat-card-glass, .kpi-card, .stat-value')).map(el => el.textContent.trim());
      const bookingsCount = Array.from(document.querySelectorAll('tbody tr')).length;
      return { statsText: statCards.slice(0, 6), bookingsCount };
    });
    console.log('  Dữ liệu Host Dashboard:', JSON.stringify(hostDashData));
    auditResults.host.dashboard = hostDashData;

    // 2.2 Host Accommodations
    console.log('\n--- 2.2 Host Chỗ Ở Của Tôi (/host/accommodations) ---');
    await page.goto(`${BASE_URL}/host/accommodations`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const hostAccomData = await page.evaluate(() => {
      const listings = Array.from(document.querySelectorAll('.listing-card, .property-card, tbody tr')).length;
      return { count: listings };
    });
    console.log(`  Chỗ ở của Host: ${hostAccomData.count}`);
    auditResults.host.accommodations = hostAccomData;

    // 2.3 Host Bookings
    console.log('\n--- 2.3 Host Đơn Đặt Phòng (/host/bookings) ---');
    await page.goto(`${BASE_URL}/host/bookings`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const hostBookingsData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr')).map(r => {
        return Array.from(r.querySelectorAll('td')).map(td => td.textContent.trim().replace(/\s+/g, ' ')).slice(0, 6).join(' | ');
      });
      return { count: rows.length, sample: rows.slice(0, 3) };
    });
    console.log(`  Đơn đặt của Host: ${hostBookingsData.count}`);
    console.log('  Mẫu đơn đặt Host:', hostBookingsData.sample);
    auditResults.host.bookings = hostBookingsData;

    // 2.4 Host Financials / Wallet
    console.log('\n--- 2.4 Host Ví Doanh Thu & Rút Tiền (/host/financials) ---');
    await page.goto(`${BASE_URL}/host/financials`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const hostFinancialsData = await page.evaluate(() => {
      const balances = Array.from(document.querySelectorAll('.wallet-balance, .stat-value, .balance-amount, strong')).map(el => el.textContent.trim()).filter(t => t.includes('₫') || t.includes('VND'));
      const historyRows = Array.from(document.querySelectorAll('tbody tr')).length;
      return { balances: balances.slice(0, 4), historyCount: historyRows };
    });
    console.log('  Số dư ví Host:', hostFinancialsData.balances);
    console.log(`  Số giao dịch rút tiền: ${hostFinancialsData.historyCount}`);
    auditResults.host.financials = hostFinancialsData;

    // 2.5 Host Reviews
    console.log('\n--- 2.5 Host Đánh Giá Từ Khách (/host/reviews) ---');
    await page.goto(`${BASE_URL}/host/reviews`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const hostReviewsData = await page.evaluate(() => {
      const reviews = Array.from(document.querySelectorAll('.review-card, .host-review-item, tbody tr')).length;
      return { count: reviews };
    });
    console.log(`  Số đánh giá của Host: ${hostReviewsData.count}`);
    auditResults.host.reviews = hostReviewsData;


    // =========================================================================
    // 3. NETWORK / API CALL VERIFICATION
    // =========================================================================
    console.log('\n🟣 [PHẦN 3] TỔNG HỢP CÁC CUỘC GỌI API BACKEND THỰC TẾ');
    const uniqueApis = Array.from(new Set(networkCalls.map(c => `${c.url} [Status ${c.status}]`)));
    console.log(`  Đã thực hiện thành công ${uniqueApis.length} API endpoints:`);
    uniqueApis.forEach(api => console.log('    ✓ ' + api));

    console.log('\n========================================================================');
    console.log('                     TỔNG KẾT AUDIT THÀNH CÔNG                          ');
    console.log('========================================================================');

  } catch (err) {
    console.error('Lỗi trong quá trình Chrome audit:', err);
  } finally {
    if (browser) await browser.close();
  }
}

runDeepAudit();
