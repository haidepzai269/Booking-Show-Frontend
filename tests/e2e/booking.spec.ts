import { test, expect } from '@playwright/test';

test.describe('Golden Path: Full Booking Flow', () => {
  
  test('Should complete booking flow from Home to Payment', async ({ page }) => {
    // 0. Đăng nhập trước để có quyền đặt vé
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@bookingshow.com');
    await page.getByPlaceholder(/mật khẩu/i).fill('Admin@123456');
    await page.getByRole('button', { name: /đăng nhập/i }).click({ force: true });
    await page.waitForURL('/');

    // 1. Chọn phim từ trang chủ: Tìm link có href chứa /movies/ và click bằng JS
    const bookingLinkSelector = 'a[href^="/movies/"]';
    await page.waitForSelector(bookingLinkSelector, { state: 'attached' });
    await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (el) (el as HTMLElement).click();
    }, bookingLinkSelector);

    // 3. Kiểm tra trang chi tiết phim và cuộn tới lịch chiếu
    await page.waitForURL(/\/movies\/\d+/, { timeout: 20000 });
    const bookingBtn = page.getByRole('button', { name: /đặt vé ngay/i }).first();
    await bookingBtn.click({ force: true });
    
    // Đợi scroll tới phần lịch chiếu (id="showtimes")
    const showtimeSection = page.locator('#showtimes');
    await expect(showtimeSection).toBeVisible();

    // 4. Chọn một khung giờ chiếu (slot đầu tiên)
    const showtimeSlot = showtimeSection.locator('button').filter({ has: page.locator('span.text-lg') }).first();
    await expect(showtimeSlot).toBeVisible();
    await showtimeSlot.click();

    // 5. Trang Chọn ghế (Seat Selection)
    await expect(page).toHaveURL(/\/booking\/seat-selection\/\d+/);
    
    // Đợi cho đến khi các ghế (svg hoặc button) hiển thị
    await page.waitForSelector('button[title^="Ghế"]', { timeout: 15000 });
    
    // Chọn ghế đầu tiên có sẵn (thường là A1 hoặc tương tự)
    const seat = page.locator('button[title^="Ghế"]').first();
    await expect(seat).toBeVisible();
    await seat.click({ force: true });
    
    // Nhấn "Tiếp Tục"
    const nextBtn = page.getByRole('button', { name: /tiếp tục/i });
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click({ force: true });

    // 6. Trang Checkout - Bước 1: Concessions (Bắp nước)
    await page.waitForURL(/\/booking\/checkout\/\d+/, { timeout: 15000 });
    await expect(page.getByText(/thêm bắp & nước/i)).toBeVisible();
    
    // Nhấn "Tiếp tục" để bỏ qua hoặc chọn combo mặc định
    await page.getByRole('button', { name: /tiếp tục/i }).click({ force: true });

    // 7. Trang Checkout - Bước 2: Voucher
    await expect(page.getByText(/mã giảm giá/i)).toBeVisible();
    await page.getByRole('button', { name: /tiếp tục/i }).click({ force: true });

    // 8. Trang Checkout - Bước 3: Thanh toán
    await expect(page.getByText(/chọn phương thức thanh toán/i)).toBeVisible({ timeout: 10000 });
    
    // Kiểm tra có các cổng thanh toán
    const vnpayBtn = page.getByText(/VNPay/i);
    const zalopayBtn = page.getByText(/ZaloPay/i);
    await expect(vnpayBtn).toBeVisible();
    await expect(zalopayBtn).toBeVisible();

    // Lưu ý: Không nhấn thanh toán thật để tránh redirect ra ngoài môi trường test
    console.log('Booking path verified up to Payment selection.');
  });
});
