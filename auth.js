/*
 * Phân quyền ở mức giao diện.
 *
 * CẢNH BÁO: đây KHÔNG phải bảo mật. Web này không có server nên tài khoản và
 * mật khẩu nằm ngay trong file js mà ai cũng xem được, và bất kỳ ai cũng có thể
 * tự bật quyền sửa bằng console. Nó chỉ để tách chế độ xem và chế độ quản trị
 * cho người dùng bình thường. Muốn chặn thật thì phải kiểm tra ở phía server.
 */
var Auth = (function () {
  var KEY = 'wd_session'
  var USERNAME = 'travel'
  var PASSWORD = '123123'

  /**
   * @param {string} username
   * @param {string} password
   * @return {boolean} đăng nhập thành công hay không
   */
  function login (username, password) {
    if (username !== USERNAME || password !== PASSWORD) return false
    try {
      window.localStorage.setItem(KEY, USERNAME)
    } catch (e) {
      // Trình duyệt chặn localStorage: phiên chỉ sống tới khi tải lại trang.
    }
    session = USERNAME
    return true
  }

  function logout () {
    try {
      window.localStorage.removeItem(KEY)
    } catch (e) {
      // không sao, biến session bên dưới vẫn được xoá
    }
    session = ''
  }

  function currentUser () {
    return session
  }

  function isLoggedIn () {
    return session !== ''
  }

  var session = ''
  try {
    session = window.localStorage.getItem(KEY) || ''
  } catch (e) {
    session = ''
  }

  return {
    login: login,
    logout: logout,
    currentUser: currentUser,
    isLoggedIn: isLoggedIn
  }
})()
