/* Điều hướng theo hash, phân quyền, menu và xử lý sự kiện của các màn hình. */
(function () {
  var VIEWS = {
    list: document.getElementById('view-list'),
    detail: document.getElementById('view-detail'),
    form: document.getElementById('view-form'),
    about: document.getElementById('view-about'),
    contact: document.getElementById('view-contact'),
    page: document.getElementById('view-page'),
    login: document.getElementById('view-login')
  }

  // Những màn đã có thanh nút dính đáy hoặc cần tập trung thì ẩn tab bar.
  var HIDE_TABBAR = { form: true, page: true, login: true }

  var postForm = document.getElementById('post-form')
  var pageForm = document.getElementById('page-form')
  var loginForm = document.getElementById('login-form')
  var priceInput = document.getElementById('f-price')
  var searchInput = document.getElementById('f-search')
  var drawer = document.getElementById('drawer')
  var drawerOverlay = document.getElementById('drawer-overlay')
  var tabbar = document.getElementById('tabbar')

  var editingId = ''
  var editingPage = 'about'
  var authMode = 'login'
  var filters = { query: '', category: '', sort: 'new' }

  /* ===== Điều hướng ===== */

  function route () {
    var hash = window.location.hash || '#/'
    var isAdmin = Auth.isLoggedIn()
    closeDrawer()

    if (hash === '#/login') {
      if (isAdmin) {
        window.location.hash = '#/'
        return
      }
      showView('login', '#/login')
    } else if (hash === '#/new' || hash.indexOf('#/edit/') === 0) {
      if (!requireAdmin(isAdmin)) return

      var editing = null
      if (hash !== '#/new') {
        editing = Store.get(hash.slice('#/edit/'.length))
        if (!editing) {
          window.location.hash = '#/'
          return
        }
      }
      editingId = editing ? editing.id : ''
      UI.fillForm(editing)
      showView('form', '#/new')
    } else if (hash.indexOf('#/post/') === 0) {
      var post = Store.get(hash.slice('#/post/'.length))
      if (!post) {
        window.location.hash = '#/'
        return
      }
      UI.renderDetail(post, isAdmin)
      showView('detail', '#/')
    } else if (hash === '#/about/edit' || hash === '#/contact/edit') {
      if (!requireAdmin(isAdmin)) return
      openPageForm(hash === '#/about/edit' ? 'about' : 'contact')
    } else if (hash === '#/about') {
      UI.renderAbout(Store.getPage('about'))
      showView('about', '#/about')
    } else if (hash === '#/contact') {
      UI.renderContact(Store.getPage('contact'))
      showView('contact', '#/contact')
    } else {
      renderList()
      showView('list', '#/')
    }
    window.scrollTo(0, 0)
  }

  /**
   * @param {boolean} isAdmin
   * @return {boolean} false nếu đã chuyển hướng sang màn đăng nhập
   */
  function requireAdmin (isAdmin) {
    if (isAdmin) return true
    window.location.hash = '#/login'
    return false
  }

  /**
   * @param {string} name khoá trong VIEWS
   * @param {string} navKey giá trị data-nav được tô sáng
   */
  function showView (name, navKey) {
    for (var key in VIEWS) {
      if (!Object.prototype.hasOwnProperty.call(VIEWS, key)) continue
      VIEWS[key].classList.toggle('hidden', key !== name)
    }

    tabbar.classList.toggle('hidden', HIDE_TABBAR[name] === true)

    var links = document.querySelectorAll('[data-nav]')
    for (var i = 0; i < links.length; i++) {
      links[i].classList.toggle('on', links[i].getAttribute('data-nav') === navKey)
    }
  }

  /* ===== Phân quyền ===== */

  function refreshAuth () {
    UI.applyRole(Auth.isLoggedIn(), Auth.currentUser() || 'Tài khoản')
    route()
  }

  function setAuthMode (mode) {
    authMode = mode
    var isSignup = mode === 'signup'
    document.getElementById('auth-title').textContent = isSignup ? 'Tạo tài khoản' : 'Đăng nhập quản trị'
    document.getElementById('auth-subtitle').textContent = isSignup
      ? 'Đăng ký bằng email hợp lệ. Tài khoản mới chưa có quyền quản trị.'
      : 'Đăng nhập bằng email đã được cấp quyền quản trị.'
    document.getElementById('btn-auth-submit').textContent = isSignup ? 'Đăng ký' : 'Đăng nhập'
    document.getElementById('btn-auth-mode').textContent = isSignup
      ? 'Đã có tài khoản? Đăng nhập'
      : 'Chưa có tài khoản? Đăng ký'
    document.getElementById('l-pass').autocomplete = isSignup ? 'new-password' : 'current-password'
    document.getElementById('err-login').textContent = ''
  }

  document.getElementById('btn-auth-mode').addEventListener('click', function () {
    setAuthMode(authMode === 'login' ? 'signup' : 'login')
  })

  loginForm.addEventListener('submit', async function (ev) {
    ev.preventDefault()
    var email = document.getElementById('l-user').value.trim()
    var password = document.getElementById('l-pass').value

    if (!email || !password) {
      document.getElementById('err-login').textContent = 'Hãy nhập email và mật khẩu.'
      return
    }
    if (authMode === 'signup' && password.length < 8) {
      document.getElementById('err-login').textContent = 'Mật khẩu cần tối thiểu 8 ký tự.'
      return
    }

    var submitButton = document.getElementById('btn-auth-submit')
    submitButton.disabled = true
    try {
      if (authMode === 'signup') {
        var signup = await Auth.signUp(email, password)
        if (!signup.ok) {
          document.getElementById('err-login').textContent = signup.message
          return
        }
        document.getElementById('err-login').textContent = signup.confirmationRequired
          ? 'Đã tạo tài khoản. Hãy kiểm tra email để xác nhận, sau đó liên hệ quản trị viên cấp quyền.'
          : 'Đã tạo tài khoản. Tài khoản chưa có quyền quản trị; hãy liên hệ quản trị viên để được cấp quyền.'
        loginForm.reset()
        return
      }

      var login = await Auth.login(email, password)
      if (!login.ok) {
        document.getElementById('err-login').textContent = login.message
        return
      }
      document.getElementById('err-login').textContent = ''
      loginForm.reset()
      window.location.hash = '#/'
      refreshAuth()
    } catch (error) {
      document.getElementById('err-login').textContent = 'Có lỗi khi xác thực: ' + error.message
    } finally {
      submitButton.disabled = false
    }
  })

  document.getElementById('btn-toggle-pass').addEventListener('click', function (ev) {
    var input = document.getElementById('l-pass')
    var showing = input.type === 'text'
    input.type = showing ? 'password' : 'text'
    ev.currentTarget.setAttribute('aria-label', showing ? 'Hiện mật khẩu' : 'Ẩn mật khẩu')
    ev.currentTarget.classList.toggle('on', !showing)
  })

  document.getElementById('btn-logout').addEventListener('click', async function () {
    try {
      await Auth.logout()
      window.location.hash = '#/'
      refreshAuth()
    } catch (error) {
      window.alert('Không thể đăng xuất: ' + error.message)
    }
  })

  /* ===== Lọc, tìm kiếm, sắp xếp ===== */

  function isFiltered () {
    return filters.query !== '' || filters.category !== ''
  }

  function renderList () {
    var all = Store.all()
    var query = filters.query.toLowerCase()

    var shown = all.filter(function (post) {
      if (filters.category && post.category !== filters.category) return false
      if (!query) return true
      return (post.title + ' ' + (post.departure || '')).toLowerCase().indexOf(query) >= 0
    })

    if (filters.sort === 'price-asc') {
      shown.sort(function (a, b) { return a.price - b.price })
    } else if (filters.sort === 'price-desc') {
      shown.sort(function (a, b) { return b.price - a.price })
    }

    UI.renderList(shown, all.length, isFiltered())
  }

  searchInput.addEventListener('input', function () {
    filters.query = searchInput.value.trim()
    document.getElementById('btn-clear-search').classList.toggle('hidden', filters.query === '')
    renderList()
  })

  document.getElementById('btn-clear-search').addEventListener('click', function () {
    searchInput.value = ''
    filters.query = ''
    document.getElementById('btn-clear-search').classList.add('hidden')
    renderList()
  })

  document.getElementById('chips').addEventListener('click', function (ev) {
    var chip = ev.target.closest ? ev.target.closest('.chip') : null
    if (!chip) return

    filters.category = chip.getAttribute('data-category')
    var chips = document.querySelectorAll('#chips .chip')
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle('on', chips[i] === chip)
    renderList()
  })

  document.getElementById('f-sort').addEventListener('change', function (ev) {
    filters.sort = ev.target.value
    renderList()
  })

  /* ===== Menu trượt ===== */

  function openDrawer () {
    drawer.classList.add('on')
    drawerOverlay.classList.add('on')
  }

  function closeDrawer () {
    drawer.classList.remove('on')
    drawerOverlay.classList.remove('on')
  }

  document.addEventListener('click', function (ev) {
    if (ev.target.closest && ev.target.closest('[data-drawer-open]')) openDrawer()
  })

  drawerOverlay.addEventListener('click', closeDrawer)

  // bấm lại chính mục đang mở thì hash không đổi, route() không chạy -> tự đóng
  drawer.querySelector('.drawer-nav').addEventListener('click', function (ev) {
    if (ev.target.closest && ev.target.closest('a')) closeDrawer()
  })

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeDrawer()
  })

  /* ===== Màn danh sách ===== */

  document.getElementById('list').addEventListener('click', function (ev) {
    var card = ev.target.closest ? ev.target.closest('.card') : null
    if (!card) return
    window.location.hash = '#/post/' + card.getAttribute('data-id')
  })

  /* ===== Chọn ảnh ===== */

  document.getElementById('f-image').addEventListener('change', function (ev) {
    var file = ev.target.files && ev.target.files[0]
    // cho phép chọn lại đúng file vừa chọn
    ev.target.value = ''
    if (!file) return

    document.getElementById('err-image').textContent = ''
    Store.readImage(file, UI.setImage, function (message) {
      document.getElementById('err-image').textContent = message
    })
  })

  document.getElementById('btn-clear-image').addEventListener('click', function () {
    UI.setImage('')
  })

  /* ===== Chọn sao ===== */

  document.getElementById('f-rating').addEventListener('click', function (ev) {
    var star = ev.target.closest ? ev.target.closest('.star') : null
    if (!star) return
    UI.setRating(Number(star.getAttribute('data-value')))
  })

  /* ===== Ô giá: tự chấm phẩy khi gõ ===== */

  priceInput.addEventListener('input', function () {
    priceInput.value = UI.formatPrice(priceInput.value)
  })

  /* ===== Lưu bài viết ===== */

  postForm.addEventListener('submit', async function (ev) {
    ev.preventDefault()
    if (!Auth.isLoggedIn()) {
      window.location.hash = '#/login'
      return
    }

    var data = UI.readForm()
    var errors = validatePost(data)
    if (Object.keys(errors).length > 0) {
      UI.showErrors(errors)
      return
    }

    data.id = editingId
    data.price = Number(data.price)
    try {
      await Store.upsert(data)
    } catch (e) {
      UI.showErrors({ form: e.message })
      return
    }
    window.location.hash = '#/'
  })

  function validatePost (data) {
    var errors = {}
    if (data.title === '') {
      errors.title = 'Hãy nhập tiêu đề bài viết.'
    }
    if (data.price === '') {
      errors.price = 'Hãy nhập giá.'
    } else if (Number(data.price) <= 0) {
      errors.price = 'Giá phải lớn hơn 0.'
    }
    return errors
  }

  document.getElementById('btn-delete').addEventListener('click', async function () {
    if (!editingId || !Auth.isLoggedIn()) return
    if (!window.confirm('Xoá bài viết này?')) return

    try {
      await Store.remove(editingId)
    } catch (e) {
      UI.showErrors({ form: e.message })
      return
    }
    window.location.hash = '#/'
  })

  /* ===== Sửa nội dung trang giới thiệu / liên hệ ===== */

  function openPageForm (name) {
    editingPage = name
    var isAbout = name === 'about'
    var backHref = isAbout ? '#/about' : '#/contact'

    document.getElementById('page-form-title').textContent = isAbout
      ? 'Sửa trang giới thiệu'
      : 'Sửa trang liên hệ'
    document.getElementById('page-back').setAttribute('href', backHref)
    document.getElementById('page-cancel').setAttribute('href', backHref)
    document.getElementById('panel-about').classList.toggle('hidden', !isAbout)
    document.getElementById('panel-contact').classList.toggle('hidden', isAbout)

    UI.fillPageForm(name, Store.getPage(name))
    showView('page', backHref)
  }

  pageForm.addEventListener('submit', async function (ev) {
    ev.preventDefault()
    if (!Auth.isLoggedIn()) {
      window.location.hash = '#/login'
      return
    }

    var data = UI.readPageForm(editingPage)
    var errors = validatePage(editingPage, data)
    if (Object.keys(errors).length > 0) {
      UI.showErrors(errors)
      return
    }

    try {
      await Store.savePage(editingPage, data)
    } catch (e) {
      UI.showErrors({ page: e.message })
      return
    }
    window.location.hash = editingPage === 'about' ? '#/about' : '#/contact'
  })

  function validatePage (name, data) {
    var errors = {}
    if (name === 'about') {
      if (data.title === '') errors['pa-title'] = 'Hãy nhập tiêu đề.'
      if (data.intro === '') errors['pa-intro'] = 'Hãy nhập nội dung giới thiệu.'
      return errors
    }

    if (data.title === '') errors['pc-title'] = 'Hãy nhập tiêu đề.'
    if (data.email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors['pc-email'] = 'Email không đúng định dạng.'
    }
    return errors
  }

  document.getElementById('btn-page-reset').addEventListener('click', async function () {
    if (!Auth.isLoggedIn()) return
    if (!window.confirm('Khôi phục nội dung gốc và lưu ngay?')) return

    try {
      await Store.savePage(editingPage, JSON.parse(JSON.stringify(DEFAULT_PAGES[editingPage])))
    } catch (e) {
      UI.showErrors({ page: e.message })
      return
    }
    window.location.hash = editingPage === 'about' ? '#/about' : '#/contact'
  })

  /* ===== Khởi động: nạp session và dữ liệu cloud trước khi render ===== */

  async function boot () {
    window.addEventListener('hashchange', route)
    try {
      await Promise.all([Auth.init(), Store.init()])
    } catch (error) {
      console.error('THTravel initialization error:', error)
      document.getElementById('empty-text').textContent =
        'Không tải được dữ liệu từ máy chủ. Vui lòng kiểm tra kết nối và tải lại trang.'
    }
    UI.applyRole(Auth.isLoggedIn(), Auth.currentUser() || 'Tài khoản')
    route()
  }

  boot()
})()
