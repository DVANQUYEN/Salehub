# SalesHub - Tài liệu Hệ thống

## 1. Giới thiệu

SalesHub là nền tảng quản lý bán hàng B2B được thiết kế dành riêng cho các công ty IT, nơi mà chu kỳ bán hàng thường dài, giá trị hợp đồng cao và việc theo dõi nhiều dự án cùng lúc là điều thường xuyên xảy ra. Hệ thống giúp doanh nghiệp quản lý toàn bộ vòng đờ làm việc với khách hàng, từ việc tạo hồ sơ tiềm năng, theo dõi thương lượng, phê duyệt báo giá, cho đến khi hợp đồng được ký kết và triển khai.

### Đối tượng sử dụng chính

SalesHub phục vụ ba nhóm ngườ dùng chính:

- **Admin**: Quản trị viên hệ thống, ngườ điều phối ngườ dùng, quyền hạn, quy trình phê duyệt và theo dõi hiệu suất toàn công ty.
- **Sales**: Đội ngũ bán hàng, ngườ trực tiếp tạo Deal, làm việc với khách hàng, gửi báo giá và đẩy nhanh tiến độ chốt hợp đồng.
- **Customer**: Khách hàng B2B, doanh nghiệp hoặc tổ chức mua các sản phẩm và dịch vụ IT từ công ty.

### Mục tiêu tổng thể

Mục tiêu của SalesHub là tạo ra một hệ sinh thái bán hàng thống nhất, giúp công ty IT:

- Kiểm soát toàn bộ pipeline bán hàng một cách minh bạch.
- Giảm thiểu sai sót trong quy trình báo giá và phê duyệt.
- Tăng tốc độ phản hồi với khách hàng.
- Đo lường hiệu quả bán hàng theo thờ gian thực.
- Tạo cơ sở dữ liệu khách hàng và Deal có giá trị lâu dài.

---

## 2. Mục tiêu hệ thống

| STT | Mục tiêu | Giải thích ngắn gọn |
|-----|----------|---------------------|
| 1 | Quản lý Deal tập trung | Tất cả thông tin về cơ hộ bán hàng được lưu trữ tại một nơi, dễ tìm kiếm, cập nhật và theo dõi. |
| 2 | Hỗ trợ quy trình phê duyệt linh hoạt | Hệ thống cho phép thiết lập nhiều cấp phê duyệt tùy theo giá trị Deal hoặc chính sách công ty. |
| 3 | Quản lý ngườ dùng và phân quyền rõ ràng | Admin có thể tạo tài khoản, gán vai trò, phân quyền theo chức năng cụ thể cho từng nhân viên. |
| 4 | Tạo và quản lý báo giá (Quote) | Sales có thể lập báo giá nhanh, gửi khách hàng, theo dõi phản hồi và điều chỉnh khi cần. |
| 5 | Theo dõi hiệu suất bán hàng | Báo cáo và dashboard giúp lãnh đạo đánh giá hiệu quả đội ngũ, doanh thu và tỷ lệ chốt Deal. |
| 6 | Cải thiện trải nghiệm khách hàng | Khách hàng nhận được báo giá chuyên nghiệp, phản hồi nhanh và lộ trình làm việc rõ ràng. |
| 7 | Giảm thiểu rủi ro mất dữ liệu | Dữ liệu Deal, khách hàng và báo giá được lưu trữ an toàn trên hệ thống, không phụ thuộc vào cá nhân. |
| 8 | Tăng tốc chu kỳ bán hàng | Tự động hóa các bước lặp đi lặp lại, giúp Sales tập trung vào việc chốt hợp đồng. |
| 9 | Đảm bảo tính tuân thủ và kiểm soát | Mọi thay đổi trên Deal đều được ghi nhận, dễ dàng kiểm tra và đối chiếu khi cần. |
| 10 | Mở rộng theo quy mô công ty | Hệ thống có thể đáp ứng từ công ty IT nhỏ đến doanh nghiệp có hàng trăm nhân viên bán hàng. |

---

## 3. Các vai trò (Roles)

### 3.1 Admin

**Mô tả vai trò**

Admin là ngườ quản trị cao nhất của hệ thống SalesHub. Admin chịu trách nhiệm thiết lập cấu hình ban đầu, quản lý ngườ dùng, xây dựng quy trình phê duyệt, giám sát hoạt động toàn hệ thống và đảm bảo mọi thứ vận hành đúng quy định.

**Mục tiêu công việc**

- Đảm bảo hệ thống luôn sẵn sàng và hoạt động ổn định.
- Xây dựng quy trình làm việc chuẩn cho đội ngũ Sales.
- Bảo vệ dữ liệu và kiểm soát quyền truy cập.
- Cung cấp báo cáo quản trị cho ban lãnh đạo.

### 3.2 Sales

**Mô tả vai trò**

Sales là ngườ trực tiếp thực hiện các hoạt động bán hàng. Họ tạo Deal, liên hệ khách hàng, gửi báo giá, cập nhật tiến độ và phối hợp với các bộ phận khác để đưa cơ hộ bán hàng đến ký kết hợp đồng.

**Mục tiêu công việc**

- Tìm kiếm và phát triển cơ hộ bán hàng mới.
- Chăm sóc khách hàng hiện hữu và đẩy mạnh upsell.
- Đạt chỉ tiêu doanh số theo tháng, quý, năm.
- Cập nhật chính xác và kịp thờ thông tin Deal trên hệ thống.

### 3.3 Customer

**Mô tả vai trò**

Customer là khách hàng doanh nghiệp B2B, tức là các công ty hoặc tổ chức có nhu cầu mua sản phẩm, dịch vụ IT. Khách hàng tham gia vào quy trình khi nhận báo giá, phản hồi yêu cầu, thương lượng và ký kết hợp đồng.

**Mục tiêu công việc**

- Nhận báo giá rõ ràng, chính xác và đúng hạn.
- Dễ dàng theo dõi trạng thái đề xuất của mình.
- Đảm bảo yêu cầu được ghi nhận đầy đủ trước khi ký hợp đồng.

### Bảng tổng hợp quyền hạn

| Quyền hạn | Admin | Sales | Customer |
|-----------|:-----:|:-----:|:--------:|
| Tạo và quản lý tài khoản ngườ dùng | ✅ | ❌ | ❌ |
| Phân quyền vai trò | ✅ | ❌ | ❌ |
| Tạo Deal mới | ✅ | ✅ | ❌ |
| Chỉnh sửa Deal của mình | ✅ | ✅ | ❌ |
| Xem tất cả Deal | ✅ | ⚠️ (theo phân quyền) | ❌ |
| Gửi báo giá (Quote) | ✅ | ✅ | ❌ |
| Phê duyệt Deal / Quote | ✅ | ❌ (trừ khi được ủy quyền) | ❌ |
| Nhận và phản hồi báo giá | ⚠️ (khi là khách hàng nội bộ) | ⚠️ | ✅ |
| Xem báo cáo hiệu suất | ✅ | ✅ (cổ phần) | ❌ |
| Cấu hình quy trình phê duyệt | ✅ | ❌ | ❌ |
| Quản lý thông tin khách hàng | ✅ | ✅ | ⚠️ (chỉ thông tin của mình) |
| Thêm ghi chú và hoạt động vào Deal | ✅ | ✅ | ⚠️ |
| Xóa Deal | ✅ | ⚠️ (cần phê duyệt) | ❌ |
| Truy cập dashboard tổng quan | ✅ | ✅ | ❌ |

> **Chú thích**: ✅ = Có quyền | ❌ = Không có quyền | ⚠️ = Hạn chế hoặc theo điều kiện.

---

## 4. Luồng hoạt động (Workflow)

### 4.1 Luồng tạo Deal từ đầu đến cuối

Luồng tạo Deal là quy trình cốt lõi của SalesHub, giúp biến một cơ hộ bán hàng tiềm năng thành hợp đồng đã ký. Dưới đây là các bước thực hiện với mốc thờ gian cụ thể:

| Bước | Hoạt động | Ngườ thực hiện | Thờ gian dự kiến |
|------|-----------|----------------|------------------|
| 1 | Nhận lead hoặc cơ hộ từ khách hàng tiềm năng | Sales | Ngày 0 |
| 2 | Xác minh thông tin khách hàng, đánh giá nhu cầu | Sales | Ngày 0 - 1 |
| 3 | Tạo Deal trên SalesHub với thông tin cơ bản: tên khách hàng, giá trị dự kiến, sản phẩm/dịch vụ, nguồn lead | Sales | Ngày 1 |
| 4 | Phân loại Deal theo giai đoạn: Lead, Qualified, Proposal, Negotiation, Closed Won/Lost | Sales | Ngày 1 |
| 5 | Chuẩn bị báo giá (Quote) và gửi đến khách hàng | Sales | Ngày 2 - 5 |
| 6 | Khách hàng xem xét, đàm phán và phản hồi | Customer | Ngày 5 - 10 |
| 7 | Điều chỉnh Quote theo phản hồi của khách hàng | Sales | Ngày 10 - 12 |
| 8 | Gửi Quote sửa đổi qua luồng phê duyệt nội bộ | Sales / Admin | Ngày 12 - 14 |
| 9 | Phê duyệt cuối cùng và chuyển sang chuẩn bị hợp đồng | Admin / Ngườ có thẩm quyền | Ngày 14 - 15 |
| 10 | Ký kết hợp đồng, chuyển Deal sang trạng thái Closed Won | Sales / Customer | Ngày 15 - 20 |
| 11 | Bàn giao cho bộ phận triển khai (Delivery/PM) | Sales / Admin | Ngày 20 - 22 |

**Lưu ý**: Thờ gian thực tế có thể thay đổi tùy theo quy mô và độ phức tạp của dự án. Với Deal nhỏ, chu kỳ có thể rút ngắn còn 3 - 5 ngày. Với Deal lớn, chu kỳ có thể kéo dài vài tháng.

### 4.2 Luồng phê duyệt (Approval Flow)

Luồng phê duyệt đảm bảo mọi báo giá và Deal quan trọng đều được kiểm soát trước khi gửi đến khách hàng hoặc ký kết.

```
Sales tạo / cập nhật Deal
        ↓
Sales gửi yêu cầu phê duyệt
        ↓
Hệ thống xác định cấp phê duyệt dựa trên giá trị Deal
        ↓
Ngườ phê duyệt cấp 1 (Sales Manager) nhận thông báo
        ↓
Nếu giá trị cao hơn ngưỡng → chuyển lên cấp 2 (Director / Admin)
        ↓
Nếu được phê duyệt → Deal / Quote chuyển sang Approved
        ↓
Nếu bị từ chối → Sales nhận phản hồi, chỉnh sửa và gửi lại
```

**Ví dụ cấu hình phê duyệt theo giá trị Deal:**

| Giá trị Deal | Ngườ phê duyệt cấp 1 | Ngườ phê duyệt cấp 2 | Thờ gian phản hồi mong đợi |
|--------------|----------------------|----------------------|----------------------------|
| Dưới 50 triệu | Sales Manager | Không cần | Trong 1 ngày làm việc |
| 50 - 200 triệu | Sales Manager | Head of Sales | Trong 2 ngày làm việc |
| 200 - 500 triệu | Head of Sales | Director | Trong 3 ngày làm việc |
| Trên 500 triệu | Director | CEO / Ban lãnh đạo | Trong 5 ngày làm việc |

Các bước chi tiết:

1. Sales hoàn thiện Quote hoặc Deal và nhấn nút "Gửi phê duyệt".
2. Hệ thống gửi thông báo đến ngườ phê duyệt qua email và trong ứng dụng.
3. Ngườ phê duyệt xem xét thông tin, lịch sử thương lượng và mức chiết khấu.
4. Ngườ phê duyệt chọn một trong các hành động: **Phê duyệt**, **Từ chối**, hoặc **Yêu cầu chỉnh sửa**.
5. Nếu được phê duyệt, Deal / Quote được đóng dấu và có thể gửi chính thức đến khách hàng.
6. Nếu bị từ chối, Sales nhận lý do và tiến hành điều chỉnh.
7. Toàn bộ lịch sử phê duyệt được lưu lại để kiểm tra sau này.

### 4.3 Luồng quản lý Users

Admin có trách nhiệm quản lý toàn bộ ngườ dùng trên hệ thống. Luồng này đảm bảo đúng ngườ có đúng quyền truy cập.

| Bước | Hoạt động | Chi tiết |
|------|-----------|----------|
| 1 | Truy cập trang quản lý User | Admin vào menu "Users" từ dashboard. |
| 2 | Thêm ngườ dùng mới | Admin nhập họ tên, email, số điện thoại, bộ phận và vai trò. |
| 3 | Gán vai trò | Chọn một trong ba vai trò: Admin, Sales hoặc Customer. |
| 4 | Cấu hình quyền bổ sung | Tùy chọn: cho phép phê duyệt, giới hạn xem Deal theo region, v.v. |
| 5 | Gửi lờ mở tài khoản | Hệ thống gửi email kích hoạt đến ngườ dùng. |
| 6 | Ngườ dùng kích hoạt tài khoản | Ngườ dùng đặt mật khẩu và đăng nhập lần đầu. |
| 7 | Theo dõi hoạt động | Admin có thể xem lịch sử đăng nhập, Deal liên quan và hiệu suất. |
| 8 | Vô hiệu hóa hoặc xóa tài khoản | Khi nhân viên nghỉ việc hoặc khách hàng không còn giao dịch. |

**Lưu ý bảo mật:**

- Không chia sẻ tài khoản Admin cho nhiều ngườ.
- Mật khẩu phải đủ mạnh và được đổi định kỳ.
- Các thao tác quan trọng như xóa User hoặc thay đổi vai trò cần được ghi log.

### 4.4 Luồng tạo Quote

Quote (báo giá) là tài liệu quan trọng trong bán hàng B2B. SalesHub hỗ trợ tạo Quote nhanh chóng, chuyên nghiệp và dễ theo dõi.

```
Sales chọn Deal cần báo giá
        ↓
Nhấn "Tạo Quote mới"
        ↓
Chọn sản phẩm / dịch vụ từ danh mục
        ↓
Nhập số lượng, đơn giá, thuế, chiết khấu
        ↓
Hệ thống tự động tính tổng giá trị
        ↓
Thêm điều khoản thanh toán, thờ hạn, ghi chú
        ↓
Lưu nháp hoặc gửi phê duyệt nội bộ
        ↓
Sau khi phê duyệt → gửi Quote đến Customer
        ↓
Customer xem, phản hồi hoặc yêu cầu chỉnh sửa
```

**Các trường chính trong một Quote:**

| Trường | Mô tả |
|--------|-------|
| Số báo giá | Mã định danh duy nhất, ví dụ: Q-2026-0001 |
| Khách hàng | Tên công ty và ngườ liên hệ |
| Ngày báo giá | Ngày tạo Quote |
| Hiệu lực | Thờ hạn báo giá có hiệu lực, thường 15 - 30 ngày |
| Các hạng mục | Danh sách sản phẩm / dịch vụ, số lượng, đơn giá |
| Tổng tiền trước thuế | Tổng giá trị các hạng mục |
| Thuế VAT | Thuế giá trị gia tăng theo quy định |
| Chiết khấu | Giảm giá nếu có |
| Tổng tiền sau thuế | Số tiền cuối cùng khách hàng cần thanh toán |
| Điều khoản thanh toán | Tiến độ đặt cọc, thanh toán đợt, v.v. |
| Ghi chú | Các lưu ý đặc biệt cho khách hàng |

---

## 5. Lợi ích khi sử dụng

### 5.1 Đối với Admin

- **Kiểm soát toàn diện**: Admin có cái nhìn tổng quan về toàn bộ hoạt động bán hàng.
- **Giảm gánh nặng quản lý thủ công**: Không cần theo dõi qua email, Excel hay gọi điện hỏi từng Sales.
- **Báo cáo tự động**: Dashboard cập nhật real-time về doanh thu, Deal đang mở, tỷ lệ chốt.
- **Quản lý rủi ro tốt hơn**: Phát hiện sớm Deal bị chậm tiến độ hoặc báo giá bất thường.
- **Linh hoạt trong cấu hình**: Dễ dàng điều chỉnh quy trình phê duyệt theo chính sách mới.

### 5.2 Đối với Sales

- **Không bỏ sót cơ hộ**: Mọi lead và Deal đều được lưu trữ và nhắc nhở xử lý.
- **Tiết kiệm thờ gian lập báo giá**: Tạo Quote chỉ trong vài phút từ template có sẵn.
- **Theo dõi tiến độ dễ dàng**: Biết rõ Deal đang ở giai đoạn nào, cần làm gì tiếp theo.
- **Minh bạch trong phê duyệt**: Sales biết Quote của mình đang chờ ai phê duyệt và lý do nếu bị từ chối.
- **Tăng cơ hộ chốt hợp đồng**: Phản hồi nhanh hơn, chuyên nghiệp hơn trong mắt khách hàng.

### 5.3 Đối với Customer

- **Nhận báo giá rõ ràng**: Quote được trình bày chuyên nghiệp, dễ đọc, đầy đủ thông tin.
- **Phản hồi nhanh chóng**: Khách hàng không phải chờ đợi lâu để nhận được câu trả lờ.
- **Theo dõi lịch sử giao dịch**: Xem lại các báo giá đã nhận, các thay đổi và trạng thái.
- **Yên tâm về tính minh bạch**: Mọi cam kết đều được ghi nhận trên hệ thống.
- **Trải nghiệm làm việc chuyên nghiệp**: Tăng sự tin tưởng vào công ty cung cấp dịch vụ IT.

### 5.4 Đối với Công ty

#### Bảng so sánh "Trước vs Sau" khi dùng SalesHub

| Tiêu chí | Trước khi dùng SalesHub | Sau khi dùng SalesHub |
|----------|------------------------|-----------------------|
| Lưu trữ dữ liệu | Rải rác trên Excel, email, máy cá nhân | Tập trung trên một nền tảng duy nhất |
| Theo dõi Deal | Nhân viên phải hỏi lại nhau liên tục | Cập nhật real-time, ai cũng nhìn thấy |
| Tạo báo giá | Soạn thủ công, dễ sai sót về giá | Tạo từ template, tự động tính toán |
| Phê duyệt | Gửi email, dễ bị sót, khó theo dõi | Luồng phê duyệt rõ ràng, có thông báo |
| Báo cáo doanh thu | Tổng hợp thủ công cuối tháng | Dashboard cập nhật liên tục |
| Tỷ lệ chốt Deal | Khó đo lường, phụ thuộc kinh nghiệm cá nhân | Có dữ liệu phân tích, cải thiện có mục tiêu |
| Thờ gian phản hồi khách hàng | Có thể mất vài ngày | Giảm xuống còn vài giờ |
| Rủi ro mất dữ liệu | Cao, khi nhân viên nghỉ việc | Thấp, dữ liệu thuộc về công ty |
| Quy mô mở rộng | Khó khăn khi tăng số lượng Sales | Dễ dàng thêm User và phân quyền |
| Hình ảnh chuyên nghiệp | Trung bình, thiếu nhất quán | Cao, báo giá và quy trình đều chuẩn hóa |

---

## 6. Ví dụ thực tiễn

### 6.1 Công ty IT Solutions 50 nhân sự

**Bối cảnh**

Công ty IT Solutions có 50 nhân viên, trong đó đội ngũ Sales gồm 8 ngườ. Trước đây, công ty quản lý Deal bằng Excel và email. Mỗi tháng, họ xử lý khoảng 40 - 60 lead, nhưng chỉ khoảng 10 - 15 Deal chốt thành công.

**Thách thức**

- Sales thường xuyên quên follow-up khách hàng.
- Báo giá bị sai giá hoặc thiếu thuế.
- Admin mất nhiều thờ gian tổng hợp báo cáo.
- Khách hàng phàn nàn phản hồi chậm.

**Sau khi triển khai SalesHub**

| Chỉ số | Trước | Sau | Cải thiện |
|--------|-------|-----|-----------|
| Số Deal xử lý / tháng | ~50 | ~80 | +60% |
| Tỷ lệ chốt Deal | 20% | 32% | +12% |
| Thờ gian tạo báo giá | 2 - 4 giờ | 15 - 30 phút | -85% |
| Thờ gian phản hồi khách hàng | 2 - 3 ngày | Trong 1 ngày | -65% |
| Thờ gian tổng hợp báo cáo | 2 ngày | Real-time | -100% |
| Số báo giá bị sai sót | 5 - 8 / tháng | Gần như 0 | -95% |
| Tỷ lệ khách hàng hài lòng | 70% | 90% | +20% |

**Kết quả**

Sau 6 tháng sử dụng SalesHub, công ty IT Solutions tăng doanh thu bán hàng thêm 35%, giảm 50% thờ gian làm việc hành chính cho đội ngũ Sales và cải thiện đáng kể hình ảnh chuyên nghiệp trong mắt khách hàng.

### 6.2 Case Study: Deal 500 triệu với Vietcombank

**Bối cảnh**

Một công ty IT nhận được cơ hộ cung cấp giải pháp phần mềm quản lý nội bộ cho chi nhánh Vietcombank. Giá trị dự kiến của hợp đồng là 500 triệu đồng.

**Timeline chi tiết**

| Ngày | Hoạt động | Ngườ thực hiện |
|------|-----------|----------------|
| Ngày 1 | Sales nhận thông tin từ giới thiệu, liên hệ khách hàng | Sales |
| Ngày 2 | Khách hàng mô tả yêu cầu, Sales ghi nhận vào Deal | Sales |
| Ngày 3 | Sales tạo Deal trên SalesHub với giá trị dự kiến 500 triệu | Sales |
| Ngày 4 - 7 | Sales khảo sát chi tiết, làm việc với bộ phận kỹ thuật | Sales / Kỹ thuật |
| Ngày 8 | Sales tạo Quote đầu tiên gồm phần mềm, triển khai và bảo hành | Sales |
| Ngày 9 | Gửi Quote qua luồng phê duyệt nội bộ | Sales |
| Ngày 10 | Sales Manager phê duyệt | Sales Manager |
| Ngày 11 | Director phê duyệt cấp 2 | Director |
| Ngày 12 | Quote chính thức gửi đến Vietcombank | Sales |
| Ngày 15 | Vietcombank yêu cầu giảm giá 10% và điều chỉnh tiến độ | Customer |
| Ngày 16 - 18 | Sales đàm phán, làm việc lại với kỹ thuật và tài chính | Sales |
| Ngày 19 | Sales cập nhật Quote phiên bản 2 với chiết khấu 7% | Sales |
| Ngày 20 - 21 | Phê duyệt lại Quote phiên bản 2 | Sales Manager / Director |
| Ngày 22 | Gửi Quote sửa đổi đến Vietcombank | Sales |
| Ngày 25 | Vietcombank đồng ý về nguyên tắc | Customer |
| Ngày 28 | Chuẩn bị hợp đồng, đính kèm Quote đã phê duyệt | Sales / Pháp chế |
| Ngày 32 | Ký kết hợp đồng, Deal chuyển sang Closed Won | Sales / Customer |
| Ngày 35 | Bàn giao cho bộ phận triển khai | Admin / PM |

**Outcome**

- Hợp đồng 500 triệu được ký kết thành công.
- Toàn bộ quá trình được ghi lại trên SalesHub, giúp dễ dàng báo cáo và rút kinh nghiệm.
- Thờ gian từ lead đến ký hợp đồng là 32 ngày, nhanh hơn 20% so với các dự án tương tự trước đây.

### 6.3 So sánh trước và sau dùng hệ thống

#### Excel / Manual vs SalesHub

| Tiêu chí | Excel / Manual | SalesHub |
|----------|----------------|----------|
| Khả năng truy cập | Chỉ trên máy tính cá nhân | Truy cập từ mọi nơi, đa thiết bị |
| Cập nhật dữ liệu | Thủ công, dễ bị quên | Cập nhật real-time, có nhắc nhở |
| Tính minh bạch | Thấp, mỗi ngườ giữ một file | Cao, dữ liệu tập trung |
| Tạo báo giá | Soạn tay, dễ sai | Tự động từ template |
| Phê duyệt | Qua email, khó kiểm soát | Luồng rõ ràng, có lịch sử |
| Báo cáo | Tổng hợp tay, mất thờ gian | Dashboard tự động |
| Bảo mật | Dễ bị mất file, lộ dữ liệu | Phân quyền, lưu trữ an toàn |
| Khả năng mở rộng | Rất hạn chế | Dễ dàng mở rộng |
| Hợp tác nhóm | Khó khăn | Nhiều ngườ cùng làm việc trên một Deal |
| Chi phí vận hành | Thấp ban đầu nhưng tốn nhân công | Đầu tư hợp lý, tiết kiệm dài hạn |

---

## 7. Tính năng nổi bật

SalesHub cung cấp nhiều tính năng mạnh mẽ để hỗ trợ bán hàng B2B. Dưới đây là 15 tính năng chính:

1. **Quản lý Deal toàn diện** 📊
   - Tạo, chỉnh sửa, theo dõi và phân loại Deal theo từng giai đoạn.

2. **Pipeline bán hàng trực quan** 🚀
   - Giao diện kanban giúp nhìn thấy rõ Deal nào đang ở đâu.

3. **Tạo Quote nhanh từ template** 📝
   - Giảm thờ gian lập báo giá và đảm bảo tính nhất quán.

4. **Luồng phê duyệt đa cấp** ✅
   - Tự động chuyển yêu cầu phê duyệt đến đúng ngườ theo giá trị Deal.

5. **Quản lý ngườ dùng và phân quyền** 👥
   - Admin dễ dàng tạo User, gán vai trò và kiểm soát quyền hạn.

6. **Dashboard và báo cáo real-time** 📈
   - Theo dõi doanh thu, tỷ lệ chốt, hiệu suất Sales ngay lập tức.

7. **Lịch sử hoạt động (Activity Log)** 🕒
   - Ghi lại mọi thay đổi, bình luận, cuộc gọi và email liên quan đến Deal.

8. **Nhắc nhở và thông báo** 🔔
   - Tự động nhắc nhở Sales follow-up khách hàng đúng hạn.

9. **Quản lý khách hàng (Customer Management)** 🏢
   - Lưu trữ thông tin công ty, ngườ liên hệ, lịch sử giao dịch.

10. **Báo giá đa phiên bản** 🔄
    - Hỗ trợ nhiều phiên bản Quote cho cùng một Deal, dễ dàng so sánh.

11. **Tích hợp email và thông báo** 📧
    - Gửi Quote và nhận phản hồi trực tiếp qua email.

12. **Quản lý sản phẩm / dịch vụ** 🛠️
    - Danh mục sản phẩm IT với giá, mô tả và điều kiện bảo hành.

13. **Phân tích hiệu suất Sales** 🏆
    - Đánh giá hiệu quả từng nhân viên, nhóm và chiến dịch.

14. **Xuất báo cáo Excel / PDF** 📄
    - Dễ dàng xuất dữ liệu để trình bày hoặc lưu trữ.

15. **Bảo mật dữ liệu và phân quyền chi tiết** 🔒
    - Đảm bảo dữ liệu nhạy cảm chỉ được truy cập bởi ngườ có thẩm quyền.

---

## 8. Kết luận

SalesHub là giải pháp quản lý bán hàng B2B phù hợp cho các công ty IT muốn chuyên nghiệp hóa quy trình bán hàng, nâng cao hiệu quả đội ngũ Sales và cải thiện trải nghiệm khách hàng. Với ba vai trò rõ ràng — Admin, Sales và Customer — cùng các luồng hoạt động chuẩn hóa như tạo Deal, phê duyệt, quản lý User và tạo Quote, SalesHub giúp doanh nghiệp kiểm soát pipeline bán hàng một cách minh bạch và hiệu quả.

Việc áp dụng SalesHub không chỉ giúp tiết kiệm thờ gian, giảm sai sót mà còn tạo nền tảng dữ liệu vững chắc để công ty đưa ra quyết định kinh doanh đúng đắn. Dù là công ty IT 50 nhân sự hay doanh nghiệp lớn hơn, SalesHub đều có thể đáp ứng và đồng hành cùng sự phát triển.

> **Hãy bắt đầu với SalesHub ngay hôm nay để biến mỗi cơ hộ bán hàng thành một hợp đồng thành công.** 🎯
