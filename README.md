// Update this README in english later
## auth/dto: validate dữ liệu
// Create dto for user input validation

    - create-user.dto.ts: validate dữ liệu khi tạo user
    - login.dto.ts: validate dữ liệu khi login

##  auth/passport: guard & strategy -> xác thực , phân quyền

    - jwt-auth.guard.ts: kiểm tra token jwt, @Public() -> bỏ quia xác thực, xử lis lỗi token.
    - jwt.strategy.ts: lấy token từ bearer, giải mã và trả về user.
    - local.strategy.ts: xác thực email/password, kiểm tra status của user.
    - roles.guard.ts: kiểm tra quyền role


## common/enums: định nghĩa các enum dùng chung (role,status)

## derector: set metadata cho route

    - customize.ts: định nghĩa public()->bỏ qua xác thực
    - role.ts: định nghĩa roles()->phân quyền user  


## helper: các hàm htrowj

    - util.ts: hash mật khẩu và so sánh mk khi nhập login

