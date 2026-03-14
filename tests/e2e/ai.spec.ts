import { test, expect } from '@playwright/test';

test.describe('AI & Smart Search Functionality', () => {

  test('Search movies by title in Header', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/tìm kiếm phim/i);
    await expect(searchInput).toBeVisible();

    // Nhập từ khóa (Ví dụ: "Mar")
    await searchInput.fill('Mar');
    
    // Nhấn Enter để tìm kiếm
    await searchInput.press('Enter');

    // Đợi chuyển tới trang tìm kiếm
    await page.waitForURL(/\/movies\?q=Mar/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/movies\?q=Mar/);
  });

  test('AI Chatbot interaction', async ({ page }) => {
    await page.goto('/');

    // Cuộn xuống để hiện QuickBookingIsland hoặc tìm nút AI ở Header
    // Tìm nút chatbot ở Header (icon Bot) hoặc dùng text "Quick Book" ở Island
    const aiIcon = page.locator('header button:has(svg.lucide-bot)');
    if (await aiIcon.isVisible()) {
      await aiIcon.click();
    } else {
      // Cuộn xuống để Island xuất hiện
      await page.keyboard.press('End');
      await page.waitForTimeout(2000); 
      
      const quickIsland = page.getByText(/Quick Book/i).first();
      await expect(quickIsland).toBeVisible({ timeout: 15000 });
      await quickIsland.click({ force: true });
      
      // Đợi overlay mở ra và click "Gợi ý đặt nhanh"
      const suggestionBtn = page.getByText(/Gợi ý đặt nhanh/i).first();
      await expect(suggestionBtn).toBeVisible({ timeout: 10000 });
      await suggestionBtn.click({ force: true });
    }

    // Kiểm tra Chatbot Modal mở ra
    const chatbotWindow = page.getByText(/NOVA AI/i);
    await expect(chatbotWindow).toBeVisible();

    // Thử gửi một tin nhắn
    const chatInput = page.getByPlaceholder(/nhập câu hỏi/i);
    await chatInput.fill('Phim nào đang hot nhất?');
    await chatInput.press('Enter');

    // Đợi AI phản hồi (có message mới xuất hiện)
    const aiMessage = page.locator('.bg-primary\\/10').last(); // Giả sử style của AI message
    await expect(aiMessage).toBeVisible({ timeout: 10000 });
  });
});
