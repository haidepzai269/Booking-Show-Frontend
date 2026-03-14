import { test, expect } from '@playwright/test';

/**
 * Lưu ý: Để chạy kịch bản này, bạn cần có một tài khoản test hoặc 
 * sử dụng tài khoản mẫu trong môi trường dev.
 */
test.describe('Authentication Flow', () => {
  
  test('Successful login and redirect to profile', async ({ page }) => {
    await page.goto('/login');

    // Nhập thông tin đăng nhập thực tế từ hệ thống (Admin)
    await page.getByPlaceholder(/email/i).fill('admin@bookingshow.com');
    await page.getByPlaceholder(/mật khẩu/i).fill('Admin@123456');
    
    // Nhấn nút Đăng nhập
    await page.getByRole('button', { name: /đăng nhập/i }).click({ force: true });

    // Mong đợi chuyển hướng về trang chủ
    await expect(page).toHaveURL('/', { timeout: 15000 });

    // Kiểm tra Header hiển thị icon avatar (User)
    const userButton = page.locator('header button:has(svg.lucide-user)');
    await expect(userButton).toBeVisible();

    // Click vào Menu tài khoản và đi tới Hồ sơ
    await userButton.click({ force: true });
    await page.getByRole('link', { name: /hồ sơ/i }).click({ force: true });
    await page.waitForURL('/profile', { timeout: 10000 });
    await expect(page.getByText(/hồ sơ/i).first()).toBeVisible();
  });

  test('Logout functionality', async ({ page }) => {
    // Giả lập trạng thái đã đăng nhập bằng cách login trước
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@bookingshow.com');
    await page.getByPlaceholder(/mật khẩu/i).fill('Admin@123456');
    await page.getByRole('button', { name: /đăng nhập/i }).click({ force: true });

     // Thực hiện Logout
    const userButton = page.locator('header button:has(svg.lucide-user)');
    await userButton.click({ force: true });
    await page.getByRole('button', { name: /đăng xuất/i }).click({ force: true });

    // Mong đợi nút Đăng nhập xuất hiện lại
    await expect(page.getByRole('link', { name: /đăng nhập/i })).toBeVisible();
  });
});
