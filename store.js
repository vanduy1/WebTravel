/* Lưu trữ bài viết trong localStorage. Không có server, không có database. */
var Store = (function () {
  var KEY = 'wd_posts'
  var SEEDED_KEY = 'wd_seeded'
  var PAGE_KEY = 'wd_page_'
  var MAX_WIDTH = 800
  var JPEG_QUALITY = 0.7

  /**
   * @return {Array} danh sách bài viết, mới nhất lên đầu
   */
  function all () {
    var raw = null
    try {
      raw = window.localStorage.getItem(KEY)
    } catch (e) {
      return []
    }
    if (!raw) return []

    var list
    try {
      list = JSON.parse(raw)
    } catch (e) {
      return []
    }
    if (!Array.isArray(list)) return []

    return list.sort(function (a, b) {
      return (b.updatedAt || 0) - (a.updatedAt || 0)
    })
  }

  /**
   * @param {string} id
   * @return {Object|null}
   */
  function get (id) {
    var list = all()
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i]
    }
    return null
  }

  /**
   * Thêm mới (post.id rỗng) hoặc cập nhật bài viết đã có.
   * @param {Object} post
   * @return {Object} bài viết sau khi lưu
   */
  function upsert (post) {
    var list = all()
    var saved = {
      id: post.id || String(Date.now()) + Math.random().toString(16).slice(2, 8),
      image: post.image || '',
      title: post.title,
      category: post.category || '',
      rating: post.rating,
      departure: post.departure,
      transport: post.transport,
      hotelClass: post.hotelClass,
      price: post.price,
      updatedAt: Date.now()
    }

    var found = false
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === saved.id) {
        list[i] = saved
        found = true
        break
      }
    }
    if (!found) list.push(saved)

    write(list)
    return saved
  }

  /**
   * @param {string} id
   */
  function remove (id) {
    write(all().filter(function (p) { return p.id !== id }))
  }

  /**
   * Nội dung trang Giới thiệu / Liên hệ. Chưa sửa lần nào thì trả về bản mặc định.
   * @param {string} name 'about' hoặc 'contact'
   * @return {Object}
   */
  function getPage (name) {
    var raw = null
    try {
      raw = window.localStorage.getItem(PAGE_KEY + name)
    } catch (e) {
      raw = null
    }

    if (raw) {
      try {
        return JSON.parse(raw)
      } catch (e) {
        // nội dung hỏng thì rơi về bản mặc định bên dưới
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_PAGES[name]))
  }

  /**
   * @param {string} name 'about' hoặc 'contact'
   * @param {Object} data
   */
  function savePage (name, data) {
    writeKey(PAGE_KEY + name, data)
  }

  function write (list) {
    writeKey(KEY, list)
  }

  function writeKey (storageKey, value) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value))
    } catch (e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014)) {
        throw new Error('Bộ nhớ trình duyệt đã đầy. Hãy xoá bớt bài viết cũ rồi lưu lại.')
      }
      throw new Error('Không lưu được dữ liệu trên trình duyệt này.')
    }
  }

  /**
   * Thu nhỏ ảnh rồi chuyển sang chuỗi base64 — ảnh gốc từ điện thoại
   * thường 3-5MB, vượt hạn mức localStorage chỉ sau 1-2 bài.
   * @param {File} file
   * @param {Function} onDone nhận chuỗi dataURL
   * @param {Function} onError nhận câu thông báo lỗi
   */
  function readImage (file, onDone, onError) {
    if (!file.type || file.type.indexOf('image/') !== 0) {
      onError('File đã chọn không phải là ảnh.')
      return
    }

    var reader = new FileReader()
    reader.onerror = function () { onError('Không đọc được file ảnh.') }
    reader.onload = function () {
      var img = new Image()
      img.onerror = function () { onError('Ảnh bị lỗi hoặc không mở được.') }
      img.onload = function () {
        var w = img.width
        var h = img.height
        if (w > MAX_WIDTH) {
          h = Math.round(h * MAX_WIDTH / w)
          w = MAX_WIDTH
        }

        var canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)

        try {
          onDone(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
        } catch (e) {
          onError('Không xử lý được ảnh này.')
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  /**
   * Đổ dữ liệu mẫu cho người mở web lần đầu. Dùng cờ riêng thay vì kiểm tra
   * danh sách rỗng, để người đã tự xoá hết bài không bị đổ lại dữ liệu mẫu.
   */
  function ensureSeeded () {
    try {
      if (window.localStorage.getItem(SEEDED_KEY)) return
      window.localStorage.setItem(SEEDED_KEY, '1')
      if (window.localStorage.getItem(KEY)) return
      if (typeof SEED_POSTS === 'undefined' || !SEED_POSTS.length) return
      write(SEED_POSTS)
    } catch (e) {
      // Trình duyệt chặn localStorage: vẫn chạy được, chỉ là danh sách rỗng.
    }
  }

  ensureSeeded()

  return {
    all: all,
    get: get,
    upsert: upsert,
    remove: remove,
    readImage: readImage,
    getPage: getPage,
    savePage: savePage
  }
})()
