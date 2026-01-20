# So sánh Mobile App (React Native/Expo) & Web Frontend (React/Vite)

Tài liệu này tóm tắt các điểm khác biệt chính giữa việc phát triển ứng dụng di động và ứng dụng web trong hệ thống **myMedicine**.

---

## 1. Thành phần giao diện (UI Components)

Đây là khác biệt lớn nhất về mặt "cách code". React Native không sử dụng thẻ HTML mà sử dụng các Native Components.

| Thành phần | Web (HTML) | Mobile (React Native) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Container** | `<div>` | `<View>` | Mobile dùng Flexbox mặc định là `column`. |
| **Văn bản** | `<span>`, `<p>`, `<h1>` | `<Text>` | Mọi chuỗi văn bản trên Mobile bắt buộc phải nằm trong thẻ `<Text>`. |
| **Hình ảnh** | `<img>` | `<Image>` | Cần định nghĩa kích thước rõ ràng trên Mobile. |
| **Nút bấm** | `<button>` | `<TouchableOpacity>`, `<Pressable>` | Cung cấp phản hồi xúc giác (haptic) và hiệu ứng khi chạm. |
| **Cuộn trang** | Trình duyệt tự có | `<ScrollView>`, `<FlatList>` | Mobile cần định nghĩa vùng có thể cuộn. `<FlatList>` tối ưu cho danh sách dài. |

---

## 2. Hệ thống CSS và Styling

Trong project này, cả hai đều dùng Tailwind, nhưng có sự khác biệt về engine thực thi:

*   **Web**: Dùng chuẩn CSS Browser. Hỗ trợ đầy đủ các thuộc tính như `hover`, `fixed`, `z-index`, `grid`.
*   **Mobile (NativeWind)**: Chuyển đổi Tailwind class thành đối tượng Javascript để React Native hiểu.
    *   **Không có `hover`**: Vì Mobile dùng cảm ứng, không có con trỏ chuột. Dùng state `pressed` thay thế.
    *   **Layout**: Chỉ hỗ trợ **Flexbox**. Không có CSS Grid.
    *   **Đơn vị**: Không dùng `px`, `rem`, `em`. Mobile dùng đơn vị mật độ điểm ảnh (density-independent pixels).

---

## 3. Thư viện & Điều hướng (Navigation)

*   **Web (react-router-dom)**: Điều hướng dựa trên URL trên thanh địa chỉ.
*   **Mobile (expo-router / react-navigation)**: 
    *   Sử dụng cơ chế **Stack** (chồng các màn hình).
    *   Hỗ trợ các cử chỉ (gestures) đặc trưng như vuốt từ cạnh trái để quay lại.
    *   Hỗ trợ Tab Bar (thanh menu dưới cùng) và Drawer (menu cạnh).

---

## 4. Kết nối API Backend

Cả hai đều kết nối vào một hệ thống Backend API chung (Next.js server). Tuy nhiên:

*   **Endpoint**: 
    *   Web có thể dùng đường dẫn tương đối hoặc `localhost`.
    *   Mobile khi chạy dev cần dùng **địa chỉ IP nội bộ** của máy tính (VD: `http://192.168.1.5:3000`) để thiết bị thật hoặc máy ảo có thể nhìn thấy server.
*   **Xử lý Offline**: Mobile thường cần chiến lược lưu trữ local (AsyncStorage/SQLite) để người dùng vẫn xem được dữ liệu cũ khi không có mạng.

---

## 5. Khả năng truy cập thiết bị (Hardware)

*   **Mobile (Expo SDK)**: Dễ dàng truy cập Camera, Thư viện ảnh, GPS, Thông báo (Push Notification), FaceID/Vân tay, Cảm biến gia tốc.
*   **Web**: Bị giới hạn bởi các API của trình duyệt và quyền riêng tư khắt khe hơn.

---

## Tóm lại (Key Takeaway)

> [!TIP]
> **Logic (JS/TS)** có thể chia sẻ đến **90%**. Nếu bạn viết logic xử lý dữ liệu tốt, bạn có thể copy nguyên đoạn code đó từ Web sang Mobile. Sự khác biệt chủ yếu nằm ở **lớp hiển thị (UI)** và **cách tương tác của người dùng**.
