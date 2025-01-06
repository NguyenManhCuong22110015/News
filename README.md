### List Of Members

|Name|MSSV|
|---|---|
|Nguyễn Mạnh Cường|22110015|
|Lê Trường Thịnh|22110071|
|Lê Công Bảo|22110009|


# Hướng Dẫn Triển Khai Ứng Dụng Node.js Kết Nối Cơ Sở Dữ Liệu
### 1. Tải Mã Nguồn từ [đây](https://drive.google.com/drive/folders/1VDRYa4dEEIoTijl2G-pOGqwb26S_l-uS?usp=sharing)

- Chúng ta sẽ có 1 folder `22110015-22110009-221110071 ` như sau

  ![image](https://github.com/user-attachments/assets/882264ef-ebad-4951-8016-758c50ecde6a)


- Giải nén file `src.zip` từ thư mục `22110015-22110009-221110071 `

- Mỡ mã nguồn trên `vscode`

- Mở terminal trên vscode và  di chuyển vào folder Project

```bash
cd Project
```

![image](https://github.com/user-attachments/assets/8f367770-053c-4964-988f-5a16705c4647)


### 2. Tải các thư viện cần thiết 

- Trên ternimal nhập lệnh

```bash
npm install
```

để tải toàn bộ thư viện cần thiết về ( sẽ mất một lúc khá lâu )

![image](https://github.com/user-attachments/assets/95ce4f77-e0c4-419c-9e5b-77f6653b488f)

- Xác nhận rằng đã có node_moduls

![image](https://github.com/user-attachments/assets/27b5e893-5beb-4a61-b46d-1ac29e7036ee)



### 3. Thiết Lập Cơ Sở Dữ Liệu

- Giải nén file `db.zip` từ thư mục `22110015-22110009-221110071 ` sẽ nhận được 1 file là `script.sql` chứa sql query để tạo bảng và insert các dữ liệu có sẵn


![image](https://github.com/user-attachments/assets/f5247a20-a2c0-474a-92cf-9a40375a9c2e)

![image](https://github.com/user-attachments/assets/92977f32-49ad-41e5-85f5-7498911df8ff)


- Mở hệ quản trị cơ sở dữ liệu của bạn trên máy tính và tạo 1 query.

- Tạo tên của database trên đó bằng ( ví dụ là `test` )

```sql
create database test
```
![image](https://github.com/user-attachments/assets/3fd82ea0-2470-4ef5-8244-bfbed2da0a02)

tiếp theo sẽ xóa bỏ dòng đó đi và dùng lệnh 

```sql
use test
```

để làm việc trên database đó

![image](https://github.com/user-attachments/assets/3202067e-29c8-4ed3-bd87-7051ed8d2c1a)

- Tiếp theo mở file `script.sql` vừa giải nén nhấn `Ctr+A` và `Ctr+C` để lấy và copy toàn bộ đoạn script đó sau đó vào cơ sở dữ liệu và dán nó vào query sau đó chạy toàn bộ

![image](https://github.com/user-attachments/assets/40cee640-fb7c-4249-bf64-85aac544da9a)

chúng ta sẽ có database như sau 

![image](https://github.com/user-attachments/assets/3fcb0d37-52f6-435e-87e3-f6b25e32c728)


- Mở lại `vscode` vô folder `utils` và cấu hình lại file `db.js`  với tên database là `test` và cấu hình các giá trị `user` và `password` của bạn  

![image](https://github.com/user-attachments/assets/5f9b112c-590c-4d70-9bc2-97e4c61b2a8f)

### 4. Chạy demo chương trình

- Mở terminal và chắc chắn rằng nó đã trỏ về folder `Project` sau đó nhập

```bash
npm start
```

![image](https://github.com/user-attachments/assets/41eb4542-242a-49d9-87e1-e84589faf1e5)


- mở brower của bạn và nhập địa chỉ `localhost:3000` để kiểm tra

![image](https://github.com/user-attachments/assets/51ee9147-c9a2-44e7-96b8-9400f9f55636)

- Nhấn vào nút `Login` ở bên phải góc trên màn hình và đăng nhập và 1 số tài khoản mặc định như sau và có thể đăng nhập bằng google, facebook hoặc github nhưng nó chỉ ở mức quyền user

|Email|Password|role|
|---|---|---|
|admin@gmail.com|1|admin|
|test@gmail.com|1|writer|
|user2@gmail.com|2|editor|

nếu sử dụng đường dẫn  `https://hostwebproject.onrender.com` trong file `urlOnline.txt` thì sử dụng tài khoản admin là 

|Email|Password|role|
|---|---|---|
|admin@gmail.com|admin|admin|


để đăng nhập 


- Sau khi đăng nhập nhấn vào biểu tưởng user trên góc phải màn hình và nhấn vào biểu tượng + tên chức năng của mình để trang điều hướng bạn đến trang làm việc của role đã được thiết lập ( các url đã ngăn chặn role khác truy cập kể cả khi có `url` của nó )

![image](https://github.com/user-attachments/assets/3d418827-e966-459d-9814-1d102aa4ac5b)

![image](https://github.com/user-attachments/assets/5ee9b535-70a0-4949-997c-60a093075270)










